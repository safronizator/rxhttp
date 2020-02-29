import listen from "../server";
import {ResponseLike} from "../interface";
import {
    ErrorHandlerFunc,
    handle as defHandle, handleErrors,
    handleUnsafe,
    HandlingError,
    Middleware,
    RequestHandler,
    RequestHandlerFunc
} from "../handling";
import {ResponseHeader, StatusCode} from "../http";
import {Routed, Router} from "../router";
import {map} from "rxjs/operators";
import {Context, Response} from "../base";
import {BodyParsed, CustomResponseData} from "../ext";
import {parseJson, renderJson} from "../ext/json";
import {dumpRequests} from "../ext/debug";


///////// Setting up error handler and overriding default request handle operator

const errHandler: ErrorHandlerFunc = err => Response.for(err.ctx)
    .withStatus(err.httpStatus)
    .withHeader(ResponseHeader.ContentType, "application/json")
    .withJsonBody({ msg: err.message });

const handle = <T={}>(handler: RequestHandlerFunc<T>): RequestHandler<T> => source => source.pipe(defHandle(handler, errHandler));


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

interface TimeResponseData extends CustomResponseData {
    responseData: {
        time: string;
        ts: number;
    }
}

const getTimeHandler = (): Middleware<{}, TimeResponseData> => source => source.pipe(
    map(ctx => ctx.withState({
        responseData: {
            time: (new Date()).toISOString(),
            ts: Date.now()
        }
    }))
);

///////// Creating server

const server = listen("localhost:3000");

///////// Setting up common middlewares:

const requests = server.requests.pipe(
    dumpRequests({ printBody: true })
);

///////// Routes:

const router = new Router(requests);

router.get("/posts/:id").pipe(handle(getPostHandler)).subscribe(server);

router.post("/posts").pipe(
    parseJson(),         // middleware applied to only this one route
    handle(addPostHandler)
).subscribe(server);

router.get("/time").pipe(
    getTimeHandler(),
    renderJson(),
    server.send() // errors will be captured by server.errors stream
).subscribe();

///////// Generationg and handling errors:

// option 1:
// router.get("/error").pipe(
//     handle(errorThrowingHandler),
// ).subscribe(server);

// // option 2:
// router.get("/error").pipe(
//     handleUnsafe(errorThrowingHandler),
//     catchErrors()
// ).subscribe();

// // option 3:
router.get("/error").pipe(
    handleUnsafe(errorThrowingHandler),
    server.send() // errors will be captured by server.errors stream
).subscribe();

///////// Defining custom error handler:

server.errors.pipe(
    handleErrors(errHandler)
).subscribe(server);

///////// Handling unmatched routes:

router.unrouted.pipe(
    handleUnsafe(notFoundHandler),
    server.send() // errors will be captured by server.errors stream
).subscribe();


///////// Exiting

const sigHandler = () => {
    console.log("Exiting ...");
    server.complete();
};
process.on('SIGINT', sigHandler);
process.on('SIGTERM', sigHandler);
