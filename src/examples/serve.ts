import listen from "../server";
import {ResponseLike} from "../interface";
import {
    handle as defHandle, handleErrors,
    handleUnsafe,
    HandlingError,
    Middleware,
    RequestHandler,
    RequestHandlerFunc
} from "../handling";
import {StatusCode} from "../http";
import Router, {Routed} from "../router";
import {map} from "rxjs/operators";
import {Context} from "../interface";
import {BodyParsed, CustomResponseData} from "../ext";
import {errorHandler as errorsAsJson, parseJson, renderJson} from "../ext/json";
import {dumpRequests} from "../ext/debug";


///////// Overriding default request handle operator - just convert errors to JSON

const handle = <T={}>(handler: RequestHandlerFunc<T>): RequestHandler<T> => source => source.pipe(
    defHandle(handler, errorsAsJson)
);


///////// Defining request handlers

let postId = 0;

const getPostHandler = (ctx: Context<Routed>): ResponseLike => ctx.reply()
    .withJsonBody({ id: ctx.state.router.id, title: "Some post" });

const addPostHandler = (ctx: Context<BodyParsed>): ResponseLike => {
    const contents = ctx.state.parsedBody;
    if (!contents || !contents.title || typeof contents.title !== "string") {
        throw new HandlingError("Missing required field: title", ctx, StatusCode.BadRequest);
    }
    return ctx.reply().withJsonBody({
        id: ++postId,
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

const { isListening, requests, responses, errors, send } = listen("localhost:3000");

isListening.then(
    () => console.log("Server is listening"),
    err => console.error("Error starting server:", err)
);

///////// Setting up common middlewares:

const dumpedRequests = requests.pipe(
    dumpRequests({ printBody: true })
);

///////// Routes:

const router = new Router(dumpedRequests);

router.post("/posts").pipe(
    parseJson(),             // middleware applied to only this one route
    handle(addPostHandler),  // maps Context to Response
).subscribe(responses);

router.get("/posts/:id").pipe(handle(getPostHandler)).subscribe(responses);

router.get("/time").pipe(
    getTimeHandler(),
    renderJson(),
).subscribe(responses);

///////// Generating and handling errors:

// option 1:
// router.get("/error").pipe(
//     handle(errorThrowingHandler)        // also hanling errors by default (or overriden) handler
// ).subscribe(responses);

// // option 2:
// const errors = new Subject<HandlingError>();
// router.get("/error").pipe(
//     handleUnsafe(errorThrowingHandler),
//     catchErrors(errors)                 // catch errors and send it to errors stream manually
// ).subscribe(responses);

// option 3:
router.get("/error").pipe(
    handleUnsafe(errorThrowingHandler),
    send()                                 // also catching errors and sending it to errors stream
).subscribe();

///////// Defining common error handler

errors.pipe(
    handleErrors(errorsAsJson)
).subscribe(responses);


///////// Handling unmatched routes:

router.unrouted.pipe(
    handle(notFoundHandler)
).subscribe(responses);


///////// Exiting

const sigHandler = () => {
    console.log("Exiting ...");
    responses.complete();
};
process.on('SIGINT', sigHandler);
process.on('SIGTERM', sigHandler);
