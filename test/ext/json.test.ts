import request from "supertest";
import {serve, capture, Context, RequestHeader, Router, StatusCode} from "../../src";
import {map} from "rxjs/operators";
import {parseIfJson, parseJson, renderJson} from "../../src/ext/json";
import {Subject} from "rxjs";

const mimeJson = "application/json";
const mimeJsonEnc = "application/json;charset=UTF-8";


describe("ext/json", () => {

    const requests = new Subject<Context>();
    const agent = request.agent(capture(requests));
    const { errors, send } = serve();
    const router = new Router(requests);

    router.post("/onlyJson").pipe(
        parseJson(),
        map(ctx => ctx.withState({ responseData: { ...ctx.state.parsedBody } })),
        renderJson(),
        send()
    ).subscribe();

    router.post("/maybeJson").pipe(
        parseIfJson(),
        map(ctx => ctx.withState({ responseData: { ...ctx.state.parsedBody } })),
        renderJson(),
        send()
    ).subscribe();

    errors.pipe(
        map(err => err.ctx.reply().withStatus(err.httpStatus)),
        send()
    ).subscribe();

    it("should parse JSON from body", done => {
        agent
            .post("/onlyJson")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`{ "test": 1 }`)
            .expect({ test: 1 })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should parse JSON from body with encoding option set in header", done => {
        agent
            .post("/onlyJson")
            .set(RequestHeader.ContentType, mimeJsonEnc)
            .send(`{ "test": 1 }`)
            .expect({ test: 1 })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should not accept non-JSON requests if this option was not set explicitly", done => {
        agent
            .post("/onlyJson")
            .send(`{ "test": 1 }`)
            .expect(StatusCode.BadRequest, done)
        ;
    });

    it("should parse JSON from body if ignoreNonJsonRequests was set to true and request contains JSON", done => {
        agent
            .post("/maybeJson")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`{ "test": 2 }`)
            .expect({ test: 2 })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should skip requests if ignoreNonJsonRequests was set to true and request not contains JSON", done => {
        agent
            .post("/maybeJson")
            .send(`{ "test": 2 }`)
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should return status 400 (Bad Request) when invalid JSON is passed", done => {
        agent
            .post("/maybeJson")
            .set(RequestHeader.ContentType, mimeJson)
            .send(`msg: "we can't parse yaml here :("`)
            .expect(StatusCode.BadRequest, done)
        ;
    });

});
