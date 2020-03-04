import {
    BodyLike,
    DefaultStatus,
    HeadersLike,
    isResponseInterface,
    RequestContext,
    ResponseLike,
    ServerResponse
} from "./interface";
import {ResponseHeader, StatusCode} from "./http";
import {STATUS_CODES} from "http";
import HeadersContainer from "./headers";


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


export default class Response implements ServerResponse {

    private readonly _body: BodyLike;
    private readonly _context: RequestContext;
    private readonly _headers: HeadersContainer;
    private readonly _reason?: string;
    private readonly _status: StatusCode;

    protected constructor(ctx: RequestContext, opts: ResponseOpts) {
        this._context = ctx;
        this._body = opts.body;
        this._headers = HeadersContainer.from(opts.headers);
        this._reason = opts.reason;
        this._status = opts.status;
    }

    static for(context: RequestContext): Response {
        return new Response(context, responseDefaultOpts);
    }

    static from(r: ResponseLike, ctx: RequestContext): Response {
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

    get context(): RequestContext {
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
