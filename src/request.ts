import {Headers, RequestInterface} from "./interface";
import {Method} from "./http";
import {IncomingMessage} from "http";
import HeadersContainer from "./headers";


export default class Request implements RequestInterface {

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
