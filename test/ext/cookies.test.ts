import {Subject} from "rxjs";
import {capture, Context, RequestHeader, Router, serve, StatusCode} from "../../src";
import request from "supertest";
import {parseJson, renderJson} from "../../src/ext/json";
import {map, tap} from "rxjs/operators";
import useCookies, {sendCookies} from "../../src/ext/cookies";

const mimeJson = "application/json";


describe("ext/cookies", () => {

    const requests = new Subject<Context>();
    const agent = request.agent(capture(requests));
    const { errors, send } = serve();
    const router = new Router(requests.pipe(useCookies()));

    router.post("/setCookie").pipe(
        parseJson(),
        tap(ctx => Array.from(Object.entries(ctx.state.parsedBody)).forEach(
            ([name, val]) => ctx.state.setCookie(name, (val as any).toString())
        )),
        map(ctx => ctx.reply(ctx.state.cookiesToSet.size.toString())),
        sendCookies(),
        send()
    ).subscribe();

    router.get("/getCookies").pipe(
        map(ctx => ctx.withState({ responseData: ctx.state.cookies })),
        renderJson(),
        send()
    ).subscribe();

    errors.pipe(
        map(err => err.ctx.reply().withStatus(err.httpStatus)),
        send()
    ).subscribe();

    it("should set cookie from request body", done => {
        agent
            .post("/setCookie")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`{ "name1": "value1", "name2": "value2" }`)
            .expect("2") // count of keys
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should send all received cookies in request body", done => {
        agent
            .get("/getCookies")
            .expect({ "name1": "value1", "name2": "value2" })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should check additional options: expiring, security, etc.");

});
