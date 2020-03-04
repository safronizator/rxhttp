import {BodyLike, Context, Id, NodeHttpContext, RequestInterface, StateContainer} from "./interface";
import Request from "./request";
import Response from "./response";


interface ContextOpts<T={}> {
    original: NodeHttpContext;
    request: RequestInterface;
    state: StateContainer<T>;
}


export default class Ctx<T={}> implements Context<T> {

    private readonly _id: Id;
    private readonly _original: NodeHttpContext;
    private readonly _request: RequestInterface;
    private readonly _state: StateContainer<T>;

    protected constructor(id: Id, opts: ContextOpts<T>) {
        this._id = id;
        this._original = opts.original;
        this._request = opts.request;
        this._state = opts.state;
    }

    static fromNodeContext(id: Id, nodeCtx: NodeHttpContext): Ctx {
        return new Ctx(id, {
            original: nodeCtx,
            request: Request.fromNodeRequest(nodeCtx.req),
            state: {}
        });
    }

    static from<T>(context: Context<T>): Ctx<T> {
        if (context instanceof Ctx) {
            return context;
        }
        return new Ctx(context.id, { ...context });
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

    get state(): StateContainer<T> {
        return this._state;
    }

    reply(body: BodyLike = ""): Response {
        return Response.for(this).withBody(body);
    }

    withState<U>(s: StateContainer<U>): Context<T & U> {
        const { id, original, state, request } = this;
        return new Ctx<T & U>(id, {
            state: { ...state, ...s },
            original,
            request
        });
    }

    /**
     * @todo: set proper result type
     */
    withStateField<U>(name: string, value: U) /*: Context<T & { [name]: U }> */ {
        const { id, original, state, request } = this;
        return new Ctx(id, {
            state: { ...state, [name]: value },
            original,
            request
        });
    }
}
