import {NextObserver, Observable, Subject} from "rxjs";
import {
    DefaultHost, DefaultPort,
    isReadableStream,
    ServerResponseInterface
} from "./interface";
import http, {RequestListener} from "http";
import {Context} from "./base";
import {catchErrors, HandlingError, ResponseHandler} from "./handling";
import {tap} from "rxjs/operators";
import { debug } from "./interface";

const dbg = debug.extend("server");


interface Addr {
    host: string;
    port: number;
}

const defaultAddr: Addr = {
    host: DefaultHost,
    port: DefaultPort
};

function flushResponse(r: ServerResponseInterface): void {
    const res = r.context.original.res;
    res.statusCode = r.status;
    if (r.headers) {
        for (const [key, v] of r.headers.entries()) {
            res.setHeader(key, v);
        }
    }
    if (isReadableStream(r.body)) {
        r.body.pipe(res);
    } else {
        res.write(r.body);
    }
    res.end();
}


export class Server implements NextObserver<ServerResponseInterface> {

    private readonly _requests = new Subject<Context>();
    private readonly _responses = new Subject<ServerResponseInterface>();
    private readonly _errors = new Subject<HandlingError>();
    private _closed: boolean = false;
    private lastId: number = 0;

    constructor() {
        this._responses.subscribe({
            next: flushResponse,
            complete: () => { this._requests.complete() }
        });
    }

    get closed(): boolean {
        return this._closed;
    }

    close(): void {
        this._closed = true;
        this._responses.complete();
    }

    next(r: ServerResponseInterface): void {
        this._responses.next(r);
    }

    get requestListener(): RequestListener {
        return (req, res) => {
            const id = (++this.lastId).toString();
            dbg("new Request#%d from %s: %s %s", id, req.socket.remoteAddress, req.method, req.url);
            res.on("finish", () => {
                dbg("Request#%d processed", id);
            });
            this._requests.next(Context.fromNodeContext(id, { req, res  }));
        };
    }

    get requests(): Observable<Context> {
        return this._requests;
    }

    get responses(): Observable<ServerResponseInterface> {
        return this._responses;
    }

    get errors(): Observable<HandlingError> {
        return this._errors;
    }

    send(): ResponseHandler {
        return source => source.pipe(
            this.captureErrors(),
            tap(r => this.next(r))
        );
    }

    captureErrors(): ResponseHandler {
        return source => source.pipe(
            catchErrors(err => {
                this._errors.next(err);
            })
        );
    }

}

interface ServerInterface {
    send(): ResponseHandler;
    close(): void;
    requests: Observable<Context>;
    responses: Observable<ServerResponseInterface>;
    errors: Observable<HandlingError>;
    requestListener: RequestListener;
}

export default function serve(): ServerInterface {
    const srv = new Server();
    return {
        send: srv.send.bind(srv),
        close: srv.close.bind(srv),
        requests: srv.requests,
        responses: srv.responses,
        errors: srv.errors,
        requestListener: srv.requestListener
    };
}

interface ListenerInterface extends ServerInterface {
    ready: Promise<void>;
}

export function listen(addr: string): ListenerInterface {
    const srv = serve();
    const httpSrv = http.createServer(srv.requestListener);
    const [host, port] = (addr || "").split(":");
    const portNum = parseInt(port);
    const parsedAddr: Addr = Object.assign({}, defaultAddr, {
        host,
        port: isNaN(portNum) ? DefaultPort : portNum
    });
    const ready = new Promise<void>((resolve, reject) => {
        httpSrv.once("error", err => {
            dbg("error listening %s: %s", addr, err);
            reject(err);
        });
        httpSrv.listen(parsedAddr.port, parsedAddr.host, () => {
            dbg("listening %s:%d", parsedAddr.host, parsedAddr.port);
            srv.responses.subscribe({
                complete: () => httpSrv.close()
            });
            resolve();
        });
    });
    httpSrv.once("close", () => {
        dbg("stopped");
    });
    return { ...srv, ready };

};
