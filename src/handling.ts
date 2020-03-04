import {Context, Response} from "./base";
import {
    ResponseLike,
    ServerResponseInterface
} from "./interface";
import {concat, Observable, of, from, throwError, Observer, NextObserver} from "rxjs";
import {catchError, map, mergeMap, retryWhen, shareReplay, tap} from "rxjs/operators";
import {StatusCode} from "./http";

import { debug } from "./interface";

export interface MiddlewareFunc<T={}, U=T> {
    (ctx: Context<T>): Context<U> | Promise<Context<U>>;
}

export interface Middleware<T={}, U=T> {
    (source: Observable<Context<T>>): Observable<Context<U>>;
}

export interface RequestHandlerFunc<T={}> {
    (ctx: Context<T>): ResponseLike | Promise<ResponseLike>;
}

export interface RequestHandler<T={}, U=ServerResponseInterface> {
    (source: Observable<Context<T>>): Observable<U>;
}

export interface Renderer<T={}> {
    (source: Observable<Context<T>>): Observable<ServerResponseInterface>;
}

export interface ResponseHandler {
    (source: Observable<ServerResponseInterface>): Observable<ServerResponseInterface>;
}

export interface ErrorHandlerFunc {
    //TODO: support for async result
    (err: HandlingError): ResponseLike | Promise<ResponseLike> | void;
}

export interface ErrorHandler {
    (source: Observable<HandlingError>): Observable<ServerResponseInterface>;
}


export class HandlingError extends Error {
    constructor(message: string, readonly ctx: Context, readonly httpStatus: StatusCode = StatusCode.InternalServerError) {
        super(message);
    }
}

export const passThrough = <T={}, U=T>(handler: MiddlewareFunc<T, U>): Middleware<T, U> => source => source.pipe(
    mergeMap(async ctx => {
        try {
            return await handler(ctx);
        } catch (e) {
            if (e instanceof HandlingError) {
                throw e;
            }
            throw new HandlingError(e.message, ctx);
        }
    })
);

export const handleUnsafe = <T={}>(handler: RequestHandlerFunc<T>): RequestHandler<T> => source => source.pipe(
    mergeMap(async ctx => {
        try {
            return Response.from(await handler(ctx), ctx)
        } catch (e) {
            if (e instanceof HandlingError) {
                throw e;
            }
            throw new HandlingError(e.message, ctx);
        }
    })
);

export const handle = <T={}>(handler: RequestHandlerFunc<T>, errHandler?: ErrorHandlerFunc): RequestHandler<T> => source => source.pipe(
    handleUnsafe(handler),
    catchErrors(errHandler)
);

export const handleErrors = (handler: ErrorHandlerFunc): ErrorHandler => source => source.pipe(
    mergeMap(async err => {
        const r = await handler(err);
        if (!r) {
            //TODO: should we not allow void handlers in this case?
            throw err;
        }
        return Response.from(r, err.ctx);
    })
);

const isNextObserver = (x: any): x is NextObserver<any> => {
    return x.next !== undefined && typeof x.next === "function";
};

const defErrHandler: ErrorHandlerFunc = err => Response.for(err.ctx).withBody(err.message).withStatus(err.httpStatus);

export const catchErrors = (handler: ErrorHandlerFunc | Observer<HandlingError> = defErrHandler): ResponseHandler => source => {
    const dbg = debug.extend("catchErrors");
    const cb: ErrorHandlerFunc = isNextObserver(handler) ? (err) => handler.next(err) : handler as ErrorHandlerFunc;
    return source.pipe(
        shareReplay(),
        catchError((err: Error) => {
            const thrower = throwError(err);
            if (!(err instanceof HandlingError)) {
                console.error("Error was throwed during handling, but it's not an instance of HandlingError (you should avoid such situation):", err);
                return thrower;
            }
            dbg("error catched while handling Request#%d: %s", err.ctx.id, err.message);
            //TODO: log
            const r = cb(err);
            if (!r) {
                return thrower;
            }
            const subst: Observable<ResponseLike> = (r instanceof Promise) ? from(r) : of(r);
            return concat(
                subst.pipe(map(r => Response.from(r, err.ctx))),
                thrower
            );
        }),
        retryWhen(errors => errors.pipe(
            tap(() => dbg("subscription restored"))
        ))
    );
};
