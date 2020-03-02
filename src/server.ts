import {Observable, Observer, Subject} from "rxjs";
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


export class Server implements Observer<ServerResponseInterface> {

    private readonly _requests = new Subject<Context>();
    private readonly _responses = new Subject<ServerResponseInterface>();
    private readonly _errors = new Subject<HandlingError>();
    private _closed: boolean = false;
    private lastId: number = 0;

    constructor() {
        this._responses.subscribe({
            next: flushResponse
            //TODO: handle errors?
        });
    }

    get closed(): boolean {
        return this._closed;
    }

    complete(): void {
        this._closed = true;
        this._requests.complete();
        this._responses.complete();
    }

    error(err: any): void {
        console.error("Server: error caught in subscription:", err);
        //TODO: what else should we do here?
    }

    next(r: ServerResponseInterface): void {
        this._responses.next(r);
    }

    listen(addr?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const srv = http.createServer(this.requestListener);
            const [host, port] = (addr || "").split(":");
            const portNum = parseInt(port);
            const parsedAddr: Addr = Object.assign({}, defaultAddr, {
                host,
                port: isNaN(portNum) ? DefaultPort : portNum
            });
            srv.listen(parsedAddr.port, parsedAddr.host, () => {
                dbg("listening %s:%d", parsedAddr.host, parsedAddr.port);
                this._responses.subscribe({
                    complete: () => srv.close()
                });
                resolve();
            });
            srv.on("error", err => {
                dbg("error listening %s: %s", addr, err);
                reject(err);
            });
            srv.on("close", () => {
                dbg("stopped");
            });
        });
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
    requests: Observable<Context>;
    errors: Observable<HandlingError>;
    requestListener: RequestListener;
}

export function serve(): ServerInterface {
    const srv = new Server();
    return {
        send: srv.send.bind(srv),
        requests: srv.requests,
        errors: srv.errors,
        requestListener: srv.requestListener
    };
}

export default function listen(addr: string): Server {
    const server = new Server();
    server.listen(addr).catch(err => console.error(err)); //TODO: handle
    return server;
};
