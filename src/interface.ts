import {Method, StatusCode} from "./http";
import {IncomingMessage, ServerResponse} from "http";
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

export type ResponseLike = StatusCode|BodyLike|ResponseInterface;

export function isResponseInterface(data: any): data is ResponseInterface {
    return typeof data.status === "number" && data.status >= 100 && data.status < 600;
}

export function isReadableStream(data: any): data is ReadableStream {
    return typeof data.read === "function" && typeof data.readable === "boolean";
}

export interface StateContainer {
    [key: string]: any;
}

export interface NodeHttpContext {
    req: IncomingMessage;
    res: ServerResponse;
}

export interface RequestInterface extends HttpMessageInterface {
    method: Method;
    url: URL;
    headers: Headers;
    body: ReadableStream;
}

export interface ServerResponseInterface extends ResponseInterface {
    context: ContextInterface;
}

export interface ContextInterface {
    id: Id;
    original: NodeHttpContext;
    state: StateContainer;
    request: RequestInterface;
}
