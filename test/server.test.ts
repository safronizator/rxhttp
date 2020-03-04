import request from "supertest";
import {serve, capture, Context, HandlingError, StatusCode} from "../src";
import {filter, map, tap} from "rxjs/operators";
import {Subject} from "rxjs";


describe("Server", () => {

    const requests = new Subject<Context>();
    const agent = request.agent(capture(requests));
    const { responses, errors, send } = serve();

    requests.pipe(
        filter(ctx => !ctx.request.url.searchParams.has("error")),
        map(ctx => ctx.reply("Hello!")),
        send()
    ).subscribe();

    requests.pipe(
        filter(ctx => ctx.request.url.searchParams.has("error")),
        tap(ctx => {
            throw new HandlingError("Test error", ctx);
        }),
        map(ctx => ctx.reply("Should not get there")),
        send()
    ).subscribe();

    errors.pipe(
        map(err => err.ctx.reply(err.message).withStatus(StatusCode.InternalServerError))
    ).subscribe(responses);

    it("should reply with status 200 and text 'Hello!' to 'GET /' request", done => {
        agent
            .get("/")
            .expect("Hello!")
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should reply with status 200 and text 'Hello!' also to any other path", done => {
        agent
            .get("/some/path")
            .expect("Hello!")
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should reply with error status 500 when HandlingError is thrown", done => {
        agent
            .get("/?error=1")
            .expect("Test error")
            .expect(StatusCode.InternalServerError, done)
        ;
    });

    it("should gracefully shutdown on complete() call");

    it("should react some way to errors in subscription");
});
