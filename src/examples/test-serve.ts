import listen from "../server";
import {ResponseLike} from "../interface";
import {handle, HandlingError, Middleware} from "../handling";
import {RequestHeader, StatusCode} from "../http";
import {Router} from "../router";
import {mergeMap, tap} from "rxjs/operators";
import {objectFromMap, streamReadAll} from "../helpers";
import {Context, Response} from "../base";


///////// Defining middlewares

const printDebugInfo = (): Middleware => source => source.pipe(tap(ctx => {
    (async () => {
        const body = (await streamReadAll(ctx.request.body)).trim();
        console.info(`New request to ${ctx.request.url}:`);
        console.info("Headers:", objectFromMap(ctx.request.headers.build()));
        body.length && console.info("Body:", body);
    })();
}));

const parseBody = (): Middleware => source => source.pipe(mergeMap(async ctx => {
    if (!ctx.request.headers.has(RequestHeader.CONTENT_TYPE, "application/json")) {
        return ctx;
    }
    return ctx.withState({
        parsedBody: JSON.parse(await streamReadAll(ctx.request.body))
    });
}));

///////// Defining handlers

let id = 0;

const getPostHandler = (ctx: Context): ResponseLike => {
    return `Post #${ctx.state.router.id}`;
};

const addPostHandler = (ctx: Context): ResponseLike => {
    const contents = ctx.state.parsedBody;
    if (!contents || !contents.title || typeof contents.title !== "string") {
        throw new HandlingError("Missing required field: title", ctx, StatusCode.BadRequest);
    }
    return ctx.response().withJsonBody({
        id: ++id,
        title: contents.title
    }).withStatus(StatusCode.Created);
};

const notFoundHandler = (ctx: Context): ResponseLike => {
    return { status: StatusCode.NotFound, body: `Path ${ctx.request.url.pathname} is not found` };
};

const errorThrowingHandler = (): ResponseLike => {
    throw new Error("test error");
};

///////// Creating server

const server = listen("localhost:3000");

///////// Shared middlewares:

const requests = server.requests.pipe(
    printDebugInfo()
);

///////// Routes:

const router = new Router(requests);

router.get("/posts/:id").pipe(handle(getPostHandler)).subscribe(server);

router.post("/posts").pipe(
    parseBody(),         // middleware applied to only one route
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
