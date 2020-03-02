import {map, mergeMap} from "rxjs/operators";
import {ErrorHandlerFunc, HandlingError, Middleware, Renderer} from "../../handling";
import {RequestHeader, StatusCode} from "../../http";
import {streamReadAllToString} from "../../helpers";
import {BodyParsed, CustomResponseData} from "../common";
import {Context, Response} from "../../base";
import {RequestInterface} from "../../interface";


export const isJson = (request: RequestInterface): boolean => {
    return request.headers.has(RequestHeader.ContentType, "application/json");
};

export const parseRequestBody = async (ctx: Context) => {
    try {
        return JSON.parse(await streamReadAllToString(ctx.request.body))
    } catch (e) {
        throw new HandlingError(e.message, ctx, StatusCode.BadRequest);
    }
};

export const parseJson = (): Middleware<{}, BodyParsed> => source => source.pipe(
    mergeMap(async ctx => {
        if (!isJson(ctx.request)) {
            throw new HandlingError("Request body should contain JSON-encoded data", ctx, StatusCode.BadRequest);
        }
        return ctx.withState({ parsedBody: await parseRequestBody(ctx) });
    }));

export const parseIfJson = (): Middleware<{}, BodyParsed> => source => source.pipe(
    mergeMap(async ctx => {
        if (!isJson(ctx.request)) {
            return ctx.withState({ parsedBody: null });
        }
        return ctx.withState({ parsedBody: await parseRequestBody(ctx) });
    }));

export const renderJson = (): Renderer<CustomResponseData> => source => source.pipe(
    map(ctx => Response.for(ctx).withJsonBody(ctx.state.responseData))
);

export const errorHandler: ErrorHandlerFunc = err => Response.for(err.ctx)
    .withStatus(err.httpStatus)
    .withJsonBody({ msg: err.message, status: err.httpStatus });
