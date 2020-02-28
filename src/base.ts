import {
    BodyLike,
    DefaultStatus,
    HeadersLike,
    Headers,
    ContextInterface,
    isResponseInterface,
    RequestInterface,
    ResponseLike,
    ServerResponseInterface, NodeHttpContext, Id, StateContainer
} from "./interface";
import {Method, ResponseHeader, StatusCode} from "./http";
import {IncomingHttpHeaders, IncomingMessage, STATUS_CODES} from "http";
import {map, merge} from "./helpers";


class HeadersContainer implements Headers {

    private readonly h: Map<string, string[]>;

    constructor(iterable: Iterable<readonly [string, string[]]>) {
        this.h = new Map<string, string[]>(iterable);
    }

    static from(h: HeadersLike) {
        return new HeadersContainer(map(h.entries(), ([name, vals]) => [
            name,
            typeof vals === "string" ? [vals] : vals
        ]));
    }

    static fromNodeHeaders(h: IncomingHttpHeaders): HeadersContainer {
        return new HeadersContainer(map(Object.entries(h), ([name, vals]) => [
            name,
            vals === undefined ? [""] : (typeof vals === "string" ? [vals] : vals)
        ]));
    }

    set(key: string, value: string[]): HeadersContainer {
        return new HeadersContainer(this.clone().entries());
    }

    add(name: string, value: string | string[]): Headers {
        const adding: [string, string[]] = [
            name,
            typeof value === "string" ? [value]: value
        ];
        return new HeadersContainer(merge(this.clone(), [adding]));
    }

    build(): Map<string, string> {
        return new Map<string, string>(map(this.h.entries(), ([name, vals]) => [
            name,
            HeadersContainer.join(vals)
        ]));
    }

    getValue(name: string): string|undefined {
        const vals = this.h.get(name);
        if (vals === undefined) {
            return vals;
        }
        return HeadersContainer.join(vals);
    }

    entries(): Iterable<[string, string[]]> {
        return this.h.entries();
    }

    has(name: string, value?: string): boolean {
        const norm = name.toLowerCase();
        if (value === undefined) {
            return this.h.has(norm);
        }
        const vals = this.h.get(norm);
        if (vals === undefined) {
            return false;
        }
        return vals.includes(value);
    }

    static join(vals: string[]): string {
        return vals.join('; ');
    }

    private clone(): Map<string, string[]> {
        return new Map(map(this.h.entries(), ([name, vals]) => [
            name,
            [...vals]
        ]));
    }

}


export class Request implements RequestInterface {

    private readonly _body: NodeJS.ReadableStream;
    private readonly _headers: HeadersContainer;
    private readonly _method: Method;
    private readonly _url: URL;

    constructor(method: Method, url: URL, headers: Headers, body: NodeJS.ReadableStream) {
        this._body = body;
        this._headers = headers instanceof HeadersContainer ? headers : new HeadersContainer(headers.entries());
        this._method = method;
        this._url = url;
    }

    static from(r: RequestInterface): Request {
        throw new Error("Not implemented");
    }

    static fromNodeRequest(req: IncomingMessage): Request {
        //TODO: check X-Forwarded-Proto header?
        // (look ex. in Express: https://github.com/expressjs/express/blob/master/lib/request.js#L306)
        const isSecure = !!(req.socket as { encrypted?: boolean }).encrypted;
        const proto = isSecure ? "https" : "http";
        const host = req.headers.host || "unknown";
        return new Request(
            (req.method || Method.Get) as Method,
            new URL(req.url || "/", `${proto}://${host}`),
            HeadersContainer.fromNodeHeaders(req.headers),
            req //TODO: wrap to expose just ReadableStream?
        );
    }

    get url(): URL {
        return this._url;
    }

    get method(): Method {
        return this._method;
    }

    get headers(): HeadersContainer {
        return this._headers;
    }

    get body(): NodeJS.ReadableStream {
        return this._body;
    }

}


interface ResponseOpts {
    body: BodyLike;
    status: StatusCode;
    headers: HeadersLike;
    reason?: string;
}

const responseDefaultOpts: ResponseOpts = {
    body: "",
    status: DefaultStatus,
    headers: new Map(),
};

export class Response implements ServerResponseInterface {

    private readonly _body: BodyLike;
    private readonly _context: ContextInterface;
    private readonly _headers: HeadersContainer;
    private readonly _reason?: string;
    private readonly _status: StatusCode;

    protected constructor(ctx: ContextInterface, opts: ResponseOpts) {
        this._context = ctx;
        this._body = opts.body;
        this._headers = HeadersContainer.from(opts.headers);
        this._reason = opts.reason;
        this._status = opts.status;
    }

    static for(context: ContextInterface): Response {
        return new Response(context, responseDefaultOpts);
    }

    static from(r: ResponseLike, ctx: ContextInterface): Response {
        if (r instanceof Response) {
            return r;
        }
        if (isResponseInterface(r)) {
            return new Response(ctx, Object.assign({}, responseDefaultOpts, r));
        }
        if (typeof r === "number") {
            // just a status
            return new Response(ctx, Object.assign({}, responseDefaultOpts, { status: r }));
        }
        // just body
        return new Response(ctx, Object.assign({}, responseDefaultOpts, { body: r }));
    }

    get status(): StatusCode {
        return this._status;
    }

    get reason(): string {
        return this._reason || STATUS_CODES[this.status] || "";
    }

    get headers(): HeadersContainer {
        return this._headers;
    }

    get context(): ContextInterface {
        return this._context;
    }

    get body(): BodyLike {
        return this._body;
    }

    withStatus(status: StatusCode, reasonMsg?: string): Response {
        const { headers, reason, body } = this;
        return new Response(this.context, { body, status, headers, reason: reasonMsg || reason });
    }

    withHeader(name: string, values: string | string[]): Response {
        const { status, headers, body, reason } = this;
        return new Response(this.context, {
            headers: headers.add(name, values),
            body,
            status,
            reason
        });
    }

    withBody(body: BodyLike): Response {
        const { status, headers, reason } = this;
        return new Response(this.context, { body, status, headers, reason });
    }

    withJsonBody(data: any): Response {
        const { status, headers, reason } = this;
        return new Response(this.context, {
            headers: headers.add(ResponseHeader.ContentType, "application/json"),
            body: JSON.stringify(data),
            status,
            reason
        });
    }

}


interface ContextOpts {
    original: NodeHttpContext;
    request: RequestInterface;
    state?: StateContainer;
}


export class Context implements ContextInterface {

    private readonly _id: Id;
    private readonly _original: NodeHttpContext;
    private readonly _request: RequestInterface;
    private readonly _state: StateContainer;

    protected constructor(id: Id, opts: ContextOpts) {
        this._id = id;
        this._original = opts.original;
        this._request = opts.request;
        this._state = opts.state || {};
    }

    static fromNodeContext(id: Id, nodeCtx: NodeHttpContext): Context {
        return new Context(id, {
            original: nodeCtx,
            request: Request.fromNodeRequest(nodeCtx.req)
        });
    }

    static from(context: ContextInterface): Context {
        if (context instanceof Context) {
            return context;
        }
        return new Context(context.id, { ...context });
    }

    get id(): string {
        return this._id;
    }

    get original(): NodeHttpContext {
        return this._original;
    }

    get request(): RequestInterface {
        return this._request;
    }

    get state(): StateContainer {
        return this._state;
    }

    reply(body: BodyLike = ""): Response {
        return Response.for(this).withBody(body);
    }

    withState(s: StateContainer): Context {
        const { id, original, state, request } = this;
        return new Context(id, {
            state: { ...state, ...s },
            original,
            request
        });
    }

    withStateField(name: string, value: any): Context {
        const { id, original, state, request } = this;
        return new Context(id, {
            state: { ...state, [name]: value },
            original,
            request
        });
    }
}
