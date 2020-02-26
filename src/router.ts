import {Observable, Subject, Subscription} from "rxjs";
import {ContextInterface} from "./interface";
import FMW from "find-my-way";
import {Method} from "./http";
import {Context} from "./base";


type FMWInstance = FMW.Instance<any>;


const subscribe = (fmv: FMWInstance, src: Observable<ContextInterface>): Subscription => {
    return src.subscribe(ctx => {
        fmv.lookup(ctx.original.req, ctx.original.res, ctx);
    });
};

const addRoute = (fmv: FMWInstance, method: Method, path: string): Observable<ContextInterface> => {
    const routed = new Subject<ContextInterface>();
    fmv.on(method, path, function (this: ContextInterface, req, res, params) {
        routed.next(Context.from(this).withStateField("router", params));
    });
    return routed;
};


export class Router {

    private readonly r: FMWInstance;
    private readonly _unrouted = new Subject<ContextInterface>();
    private subscription?: Subscription;

    constructor(private readonly src: Observable<ContextInterface>) {
        const unrouted = this._unrouted;
        this.r = FMW({
            defaultRoute: function (this: ContextInterface, req, res) {
                unrouted.next(this);
            }
        });
    }

    route(method: Method, path: string): Observable<ContextInterface> {
        if (!this.subscription) {
            this.subscription = subscribe(this.r, this.src);
        }
        return addRoute(this.r, method, path);
    }

    get(path: string): Observable<ContextInterface> {
        return this.route(Method.Get, path);
    }

    put(path: string): Observable<ContextInterface> {
        return this.route(Method.Put, path);
    }

    post(path: string): Observable<ContextInterface> {
        return this.route(Method.Post, path);
    }

    delete(path: string): Observable<ContextInterface> {
        return this.route(Method.Delete, path);
    }

    head(path: string): Observable<ContextInterface> {
        return this.route(Method.Head, path);
    }

    options(path: string): Observable<ContextInterface> {
        return this.route(Method.Options, path);
    }

    patch(path: string): Observable<ContextInterface> {
        return this.route(Method.Patch, path);
    }

    all(path: string): Observable<ContextInterface> {
        //TODO: implement
        throw new Error("Not implemented");
    }

    get unrouted(): Subject<ContextInterface> {
        return this._unrouted;
    }
}
