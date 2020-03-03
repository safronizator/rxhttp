import request from "supertest";
import {serve, capture, Context, RequestHeader, Router, StatusCode} from "../../src";
import {map, tap} from "rxjs/operators";
import {parseJson} from "../../src/ext/json";
import {Subject} from "rxjs";
import startSession from "../../src/ext/session";
import {sendCookies} from "../../src/ext/cookies";

const mimeJson = "application/json";


describe("ext/session", () => {

    const requests = new Subject<Context>();
    const agent1 = request.agent(capture(requests));
    const agent2 = request.agent(capture(requests));
    const { errors, send } = serve();
    const router = new Router(requests);

    router.post("/sessionStore").pipe(
        parseJson(),
        startSession(),
        tap(ctx => ctx.state.session.set("data", ctx.state.parsedBody.data)),
        map(ctx => ctx.reply(ctx.state.session.get("data"))),
        sendCookies(),
        send()
    ).subscribe();

    router.get("/sessionGet").pipe(
        startSession(),
        map(ctx => ctx.reply(ctx.state.session.get("data")) || ""),
        send()
    ).subscribe();

    errors.pipe(
        map(err => err.ctx.reply().withStatus(err.httpStatus)),
        send()
    ).subscribe();

    const testValue = "test1";

    it("should store data from session in key 'data' and return it in response", (done) => {
        agent1
            .post("/sessionStore")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`{ "data": "${testValue}" }`)
            .expect(testValue)
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should return same value to same client", done => {
        agent1
            .get("/sessionGet")
            .expect(testValue)
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should not return same value to another client", done => {
        agent2
            .get("/sessionGet")
            .expect("")
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should check additional options: lifetime, security, etc.");

});
