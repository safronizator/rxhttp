import listen from "../server";
import {ResponseLike} from "../interface";
import {
    ErrorHandlerFunc,
    handle as defHandle,
    HandlingError,
    Middleware,
    RequestHandler,
    RequestHandlerFunc
} from "../handling";
import {RequestHeader, StatusCode} from "../http";
import {Routed, Router} from "../router";
import {mergeMap, tap} from "rxjs/operators";
import {objectFromMap, streamReadAll} from "../helpers";
import {Context, Response} from "../base";


///////// Setting up error handler and overriding default request handle operator

const errHandler: ErrorHandlerFunc = (err) => Response.for(err.ctx)
    .withStatus(err.httpStatus)
    .withHeader("Content-Type", "application/json")
    .withJsonBody({ msg: err.message });

const handle = <T={}>(handler: RequestHandlerFunc<T>): RequestHandler<T> => source => source.pipe(defHandle(handler, errHandler));

///////// Defining middlewares

const printDebugInfo = (): Middleware => source => source.pipe(tap(ctx => {
    (async () => {
        const body = (await streamReadAll(ctx.request.body)).trim();
        console.info(`New request to ${ctx.request.url}:`);
        console.info("Headers:", objectFromMap(ctx.request.headers.build()));
        body.length && console.info("Body:", body);
    })();
}));

interface BodyParsed {
    parsedBody: any;
}

const parseJson = (): Middleware<{}, BodyParsed> => source => source.pipe(mergeMap(async ctx => {
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

///////// Defining request handlers

let id = 0;

const getPostHandler = (ctx: Context<Routed>): ResponseLike => ctx.reply()
    .withJsonBody({ id: ctx.state.router.id, title: "Some post" });

const addPostHandler = (ctx: Context<BodyParsed>): ResponseLike => {
    const contents = ctx.state.parsedBody;
    if (!contents || !contents.title || typeof contents.title !== "string") {
        throw new HandlingError("Missing required field: title", ctx, StatusCode.BadRequest);
    }
    return ctx.reply().withJsonBody({
        id: ++id,
        title: contents.title
    }).withStatus(StatusCode.Created);
};

const notFoundHandler = (ctx: Context): ResponseLike => {
    throw new HandlingError(`Path ${ctx.request.url.pathname} is not found`, ctx, StatusCode.NotFound);
    // return { status: StatusCode.NotFound, body: `Path ${ctx.request.url.pathname} is not found` };
};

const errorThrowingHandler = (): ResponseLike => {
    throw new Error("test error");
};

///////// Creating server

const server = listen("localhost:3000");

///////// Setting up common middlewares:

const requests = server.requests.pipe(
    printDebugInfo()
);

///////// Routes:

const router = new Router(requests);

router.get("/posts/:id").pipe(handle(getPostHandler)).subscribe(server);

router.post("/posts").pipe(
    parseJson(),         // middleware applied to only this one route
    handle(addPostHandler)
).subscribe(server);

///////// Error handling:

// option 1:
router.get("/error").pipe(
    handle(errorThrowingHandler),
).subscribe(server);

// // option 2:
// router.get("/error").pipe(
//     handleUnsafe(errorThrowingHandler),
//     catchErrors()
// ).subscribe();

// // option 3:
// router.get("/error").pipe(
//     handleUnsafe(errorThrowingHandler),
//     server.send()
// ).subscribe();


///////// Handling unmatched routes:

router.unrouted.pipe(handle(notFoundHandler)).subscribe(server);


///////// Exiting

const sigHandler = () => {
    console.log("Exiting ...");
    server.complete();
};

process.on('SIGINT', sigHandler);
process.on('SIGTERM', sigHandler);
