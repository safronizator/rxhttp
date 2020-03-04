import {Middleware, passThrough, ResponseHandler} from "../../handling";
import {map} from "rxjs/operators";
import {Context, Response} from "../../base";
import {RequestHeader, ResponseHeader} from "../../http";
import {ContextInterface} from "../../interface";
import cookie from "cookie";
import { debug as commonDebug } from "../common";

const debug = commonDebug.extend("cookies");


export interface Cookie {
    value?: string;
    expires?: Date;
    path?: string;
    domain?: string;
}

export interface ParsedCookies {
    [name: string]: string;
}

export interface CookieOpts {
    expires?: Date;
    path?: string;
    domain?: string;
}

export interface WithCookies {
    cookies: ParsedCookies;
    cookiesToSet: Map<string, Cookie>;
    setCookie(name: string, value?: string, opts?: CookieOpts): void;
}

export function areCookiesUsed(ctx: ContextInterface): ctx is ContextInterface<WithCookies> {
    return ctx.state.cookies !== undefined && ctx.state.cookiesToSet !== undefined;
}

export enum SameSiteOpt {
    Strict = "strict",
    Lax = "lax",
    None = "none"
}

export interface CookieSendOpts {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | SameSiteOpt;
}

const cookiesHandler = <T>(ctx: Context<T>): Context<T & WithCookies> => {
    if (areCookiesUsed(ctx)) {
        debug("cookies handling was already inited");
        return ctx as Context<T & WithCookies>;
    }
    const cookiesData = ctx.request.headers.getValue(RequestHeader.Cookie) || "";
    const cookies = cookie.parse(cookiesData);
    debug("cookies parsed from request: \"%s\" -> %o", cookiesData, cookies);
    const cookiesToSet = new Map<string, Cookie>();
    const setCookie = (name: string, value?: string, opts: CookieOpts = {}) => {
        cookiesToSet.set(name, Object.assign({ value }, opts));
    };
    return ctx.withState({
        cookies,
        cookiesToSet,
        setCookie
    });
};

const useCookies = <T>(): Middleware<T, T & WithCookies> => source => source.pipe(
    passThrough(cookiesHandler)
);

export const sendCookies = (opts: CookieSendOpts = {}): ResponseHandler => source => source.pipe(
    map(r => {
        if (!areCookiesUsed(r.context) || r.context.state.cookiesToSet.size === 0) {
            debug("serializer: no new cookies was found in context");
            return r;
        }
        const serialized = Array.from(r.context.state.cookiesToSet.entries()).map(
            ([name, c]) => cookie.serialize(name, c.value || "", {
                expires: c.expires,
                path: c.path,
                domain: c.domain,
                httpOnly: opts.httpOnly,
                secure: opts.secure,
                sameSite: opts.sameSite
            })
        );
        return Response.from(r, r.context).withHeader(ResponseHeader.SetCookie, serialized);
    })
);

export default useCookies;
