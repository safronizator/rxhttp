import {Middleware, ResponseHandler} from "../../handling";
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

export interface WithCookies {
    cookies: ParsedCookies;
    cookiesToSet: Map<string, Cookie>;
    setCookie(name: string, value?: string, expires?: Date, path?: string, domain?: string): void;
}

export function areCookiesUsed(ctx: ContextInterface): ctx is ContextInterface<WithCookies> {
    return ctx.state.cookies !== undefined && ctx.state.cookiesToSet !== undefined;
}

/**
 * @todo proper errors handling
 * @todo additional opts: secure, domain, path, expire, etc
 */
const useCookies = <T>(): Middleware<T, T & WithCookies> => source => source.pipe(
    map(ctx => {
        if (areCookiesUsed(ctx)) {
            debug("cookies handling was already inited");
            return ctx as Context<T & WithCookies>;
        }
        const cookiesData = ctx.request.headers.getValue(RequestHeader.Cookie) || "";
        const cookies = cookie.parse(cookiesData);
        debug("cookies parsed from request: \"%s\" -> %o", cookiesData, cookies);
        const cookiesToSet = new Map<string, Cookie>();
        const setCookie = (name: string, value?: string, expires?: Date, path?: string, domain?: string) => {
            cookiesToSet.set(name, { value, expires, path, domain });
        };
        return ctx.withState({
            cookies,
            cookiesToSet,
            setCookie
        });
    })
);

/**
 * @todo additional opts: secure, domain, path, expire, etc
 */
export const sendCookies = (): ResponseHandler => source => source.pipe(
    map(r => {
        if (!areCookiesUsed(r.context) || r.context.state.cookiesToSet.size === 0) {
            debug("serializer: no new cookies was found in context");
            return r;
        }
        const serialized = Array.from(r.context.state.cookiesToSet.entries()).map(
            ([name, c]) => cookie.serialize(name, c.value || "", {
                expires: c.expires,
                path: c.path,
                domain: c.domain
                //TODO: other
            })
        );
        return Response.from(r, r.context).withHeader(ResponseHeader.SetCookie, serialized);
    })
);

export default useCookies;
