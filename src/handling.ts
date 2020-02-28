import {Context, Response} from "./base";
import {
    ResponseLike,
    ServerResponseInterface
} from "./interface";
import {concat, Observable, of, throwError} from "rxjs";
import {catchError as rxCatch, map, mergeMap, retryWhen, shareReplay, tap} from "rxjs/operators";
import {StatusCode} from "./http";

import { debug } from "./interface";


export interface RequestHandlerFunc {
    (ctx: Context): ResponseLike | Promise<ResponseLike>;
}

export interface RequestHandler {
    (source: Observable<Context>): Observable<ServerResponseInterface>;
}

export interface Middleware {
    (source: Observable<Context>): Observable<Context>;
}

export interface ResponseHandler {
    (source: Observable<ServerResponseInterface>): Observable<ServerResponseInterface>;
}

export interface ErrorHandlerFunc {
    //TODO: support for async result
    (err: HandlingError): ResponseLike | Promise<ResponseLike>;
}


export class HandlingError extends Error {
    constructor(message: string, readonly ctx: Context, readonly httpStatus: StatusCode = StatusCode.InternalServerError) {
        super(message);
    }
}

export const handleUnsafe = (handler: RequestHandlerFunc): RequestHandler => source => source.pipe(
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

export const handle = (handler: RequestHandlerFunc, errHandler?: ErrorHandlerFunc): RequestHandler => source => source.pipe(
    handleUnsafe(handler),
    catchErrors(errHandler)
);

const defErrHandler: ErrorHandlerFunc = err => Response.for(err.ctx).withBody(err.message).withStatus(err.httpStatus);

export const catchErrors = (handler: ErrorHandlerFunc = defErrHandler): ResponseHandler => source => {
    const dbg = debug.extend("catchErrors");
    return source.pipe(
        shareReplay(),
        rxCatch((err: HandlingError) => {
            //TODO: check err is not an instance of HandlingError
            dbg("error catched while handling Request#%d: %s", err.ctx.id, err.message);
            //TODO: log
            return concat(
                //TODO: support for async handler
                of(handler(err)).pipe(mergeMap(async r => Response.from(await r, err.ctx))),
                throwError(err)
            );
        }),
        retryWhen(errors => errors.pipe(
            tap(() => dbg("subscription restored"))
        ))
    );
};
