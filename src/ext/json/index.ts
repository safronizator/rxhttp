import {map, mergeMap} from "rxjs/operators";
import {HandlingError, Middleware, Renderer} from "../../handling";
import {RequestHeader, StatusCode} from "../../http";
import {streamReadAll} from "../../helpers";
import {BodyParsed, CustomResponseData} from "../common";
import {Response} from "../../base";


export const parseJson = (): Middleware<{}, BodyParsed> => source => source.pipe(mergeMap(async ctx => {
    if (!ctx.request.headers.has(RequestHeader.ContentType, "application/json")) {
        throw new HandlingError("Request body should contain JSON-encoded data", ctx, StatusCode.BadRequest);
    }
    try {
        return ctx.withState({
            parsedBody: JSON.parse(await streamReadAll(ctx.request.body))
        });
    } catch (e) {
        throw new HandlingError(e.message, ctx, StatusCode.BadRequest);
    }
}));


export const renderJson = (): Renderer<CustomResponseData> => source => source.pipe(
    map(ctx => Response.for(ctx).withJsonBody(ctx.state.responseData))
);
