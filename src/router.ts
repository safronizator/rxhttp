import {Observable, Subject, Subscription} from "rxjs";
import {Context} from "./interface";
import FMW from "find-my-way";
import {Method} from "./http";


type FMWInstance = FMW.Instance<any>;


const subscribe = (fmv: FMWInstance, src: Observable<Context>): Subscription => {
    return src.subscribe(ctx => {
        fmv.lookup(ctx.original.req, ctx.original.res, ctx);
    });
};

const addRoute = (fmv: FMWInstance, method: Method, path: string): Observable<Context> => {
    const routed = new Subject<Context>();
    fmv.on(method, path, function (this: Context, req, res, params) {
        this.state = {
            ...this.state,
            router: params
        };
        routed.next(this);
    });
    return routed;
};


export class Router {

    private readonly r: FMWInstance;
    private readonly _unrouted = new Subject<Context>();
    private subscription?: Subscription;

    constructor(private readonly src: Observable<Context>) {
        const unrouted = this._unrouted;
        this.r = FMW({
            defaultRoute: function (this: Context, req, res) {
                unrouted.next(this);
            }
        });
    }

    route(method: Method, path: string): Observable<Context> {
        if (!this.subscription) {
            this.subscription = subscribe(this.r, this.src);
        }
        return addRoute(this.r, method, path);
    }

    get(path: string): Observable<Context> {
        return this.route(Method.Get, path);
    }

    put(path: string): Observable<Context> {
        return this.route(Method.Put, path);
    }

    post(path: string): Observable<Context> {
        return this.route(Method.Post, path);
    }

    delete(path: string): Observable<Context> {
        return this.route(Method.Delete, path);
    }

    head(path: string): Observable<Context> {
        return this.route(Method.Head, path);
    }

    options(path: string): Observable<Context> {
        return this.route(Method.Options, path);
    }

    patch(path: string): Observable<Context> {
        return this.route(Method.Patch, path);
    }

    all(path: string): Observable<Context> {
        //TODO: implement
        throw new Error("Not implemented");
    }

    get unrouted(): Subject<Context> {
        return this._unrouted;
    }
}
