import {Method, StatusCode} from "./http";
import {IncomingMessage, ServerResponse as NodeServerResponse} from "http";
import ReadableStream = NodeJS.ReadableStream;
import debugFactory from "debug";

export const debug = debugFactory("rxhttp");

export type Id = string;

export const DefaultStatus = StatusCode.Ok;
export const DefaultHost = "localhost";
export const DefaultPort = 80;


export interface Headers {
    build(): Map<string, string>;
    getValue(name: string): string|undefined;
    add(name: string, value: string | string[]): Headers;
    set(name: string, value: string | string[]): Headers;
    entries(): Iterable<[string, string[]]>;
    has(name: string, value?: string): boolean;
}

export type HeadersLike = Headers | Map<string, string | string[]>;

export type BodyLike = string|ReadableStream|Buffer

export interface HttpMessageInterface {
    headers: HeadersLike;
    body: BodyLike;
}

export interface ResponseInterface extends Partial<HttpMessageInterface> {
    status: StatusCode;
    reason?: string;
}

export function isResponseInterface(data: any): data is ResponseInterface {
    return typeof data.status === "number" && data.status >= 100 && data.status < 600;
}

export type ResponseLike = StatusCode|BodyLike|ResponseInterface;

export type StateContainer<T={}> = T & { [key: string]: any };

export interface NodeHttpContext {
    req: IncomingMessage;
    res: NodeServerResponse;
}

export interface RequestInterface extends HttpMessageInterface {
    method: Method;
    url: URL;
    headers: Headers;
    body: ReadableStream;
}

export interface RequestContext {
    id: Id;
    original: NodeHttpContext;
    request: RequestInterface;
}

export interface ServerResponse extends ResponseInterface {
    context: RequestContext; //TODO: change to Context?
    withStatus(status: StatusCode, reasonMsg?: string): ServerResponse;
    withHeader(name: string, values: string | string[]): ServerResponse;
    withBody(body: BodyLike): ServerResponse;
    withJsonBody(data: any): ServerResponse;
}

export interface Context<T={}> extends RequestContext {
    state: StateContainer<T>;
    reply(body?: BodyLike): ServerResponse;
    withState<U>(s: StateContainer<U>): Context<T & U>;
}
