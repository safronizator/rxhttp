import request from "supertest";
import {serve, capture, Context, RequestHeader, Router, StatusCode} from "../../src";
import {map, tap} from "rxjs/operators";
import {parseJson} from "../../src/ext/json";
import {Subject} from "rxjs";
import startSession from "../../src/ext/session";
import {sendCookies} from "../../src/ext/cookies";
const assert = require('assert').strict;


const mimeJson = "application/json";
const lifetime = 1000 * 60 * 60; // 1 hour
const cookieName = "testId";
const testValue = "test1";


describe("ext/session", () => {

    const requests = new Subject<Context>();
    const agent1 = request.agent(capture(requests));
    const agent2 = request.agent(capture(requests));
    const { errors, send } = serve();
    const router = new Router(requests.pipe(startSession({ lifetime, cookieName })));

    router.post("/sessionStore").pipe(
        parseJson(),
        tap(ctx => ctx.state.session.set("data", ctx.state.parsedBody.data)),
        map(ctx => ctx.reply(ctx.state.session.get("data"))),
        sendCookies(),
        send()
    ).subscribe();

    router.get("/sessionGet").pipe(
        map(ctx => ctx.reply(ctx.state.session.get("data")) || ""),
        send()
    ).subscribe();

    errors.pipe(
        map(err => err.ctx.reply().withStatus(err.httpStatus)),
        send()
    ).subscribe();

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

    it("should check additional option: cookieName & lifetime", done => {
        const expiration = (new Date(Date.now() + lifetime)).toUTCString();
        const re = `${cookieName}=[^;]+; Expires=${expiration}`;
        const checkRe = new RegExp(re);
        agent2
            .post("/sessionStore")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`{ "data": "${testValue}" }`)
            .expect(StatusCode.Ok)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                assert.ok(checkRe.test(res.get("Set-Cookie")[0]), `Set-Cookie header should match Regexp /${re}/`);
                return done();
            })
        ;
    });

});
