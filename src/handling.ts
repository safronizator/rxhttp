import {Response} from "./base";
import {ContextInterface, RequestHandlerFunc, RequestHandler, ResponseHandler} from "./interface";
import {concat, of, throwError} from "rxjs";
import {catchError as rxCatch, mergeMap, retryWhen, shareReplay, tap} from "rxjs/operators";
import {StatusCode} from "./http";

import { debug } from "./interface";


export class HandlingError extends Error {
    constructor(message: string, readonly ctx: ContextInterface, readonly httpStatus: StatusCode = StatusCode.InternalServerError) {
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

export const handle = (handler: RequestHandlerFunc): RequestHandler => source => source.pipe(
    handleUnsafe(handler),
    catchErrors()
);

export const catchErrors = (): ResponseHandler => source => {
    const dbg = debug.extend("catchErrors");
    return source.pipe(
        shareReplay(),
        rxCatch((err: HandlingError) => {
            //TODO: check err is not an instance of HandlingError
            dbg("error catched while handling Request#%d: %s", err.ctx.id, err.message);
            //TODO: log
            return concat(
                of(Response.for(err.ctx).withBody(err.message).withStatus(err.httpStatus)),
                throwError(err)
            );
        }),
        retryWhen(errors => errors.pipe(
            tap(() => dbg("subscription restored"))
        ))
    );
};
