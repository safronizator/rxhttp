import request from "supertest";
import {serve, capture, Context, handle, ResponseLike, Routed, Router, StatusCode} from "../src";
import {map} from "rxjs/operators";
import {Subject} from "rxjs";


describe("Router", () => {

    const requests = new Subject<Context>();
    const agent = request.agent(capture(requests));
    const { responses } = serve();
    const router = new Router(requests);

    const dumpRouterParamsHandler = (ctx: Context<Routed>): ResponseLike => ctx.reply()
        .withJsonBody({
            routerParams: { ...ctx.state.router }
        });

    router.get("/").pipe(map(ctx => ctx.reply("GET /"))).subscribe(responses);

    router.post("/login").pipe(map(ctx => ctx.reply("POST /login"))).subscribe(responses);

    router.delete("/posts/:id").pipe(handle(dumpRouterParamsHandler)).subscribe(responses);

    router.get("/posts/:year(^\\d{4})/:month(^\\d{2})/:day(^\\d{2})").pipe(handle(dumpRouterParamsHandler)).subscribe(responses);

    router.get("/wildcard/*").pipe(map(ctx => ctx.reply().withJsonBody({
        path: ctx.request.url.pathname
    }))).subscribe(responses);

    router.unrouted.pipe(map(ctx => ctx.reply().withStatus(StatusCode.NotFound))).subscribe(responses);

    it("should correctly route 'GET /' request", done => {
        agent
            .get("/")
            .expect("GET /")
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should correctly route 'POST /login' request", done => {
        agent
            .post("/login")
            .expect("POST /login")
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should correctly route request with given param", done => {
        agent
            .delete("/posts/100500")
            .expect({ routerParams: { id: "100500" } })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should correctly route request with multiple params", done => {
        agent
            .get("/posts/2020/03/02")
            .expect({ routerParams: { year: "2020", month: "03", day: "02" } })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should correctly match paths by wildcard", done => {
        agent
            .get("/wildcard/any/path/here/example.png")
            .expect({ path: "/wildcard/any/path/here/example.png" })
            .expect(StatusCode.Ok, done)
        ;
    });

    it("should reply with 404 status to requests with not matched path", done => {
        agent
            .get("/some/404/url")
            .expect(StatusCode.NotFound, done)
        ;
    });

    it("should not route 'GET /login' request", done => {
        agent
            .get("/login")
            .expect(StatusCode.NotFound, done)
        ;
    });

    it("should not route paths with variables given in invalid format", done => {
        agent
            .get("/posts/2020/Mar/02")
            .expect(StatusCode.NotFound, done)
        ;
    });

    it("should correctly handle any method for routes described with all()");

    it("should correctly handle any method given in array to route()");

});
