import {Observable, Observer, Subject} from "rxjs";
import {
    Context, DefaultHost, DefaultPort,
    isReadableStream,
    ResponseHandler,
    ServerResponseInterface
} from "./interface";
import http from "http";
import {Request} from "./base";
import {catchErrors} from "./handling";
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

interface ServerOpts {

}

const defaultServerOpts: ServerOpts = {

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

    private readonly opts: ServerOpts;
    private readonly _requests = new Subject<Context>();
    private readonly _responses = new Subject<ServerResponseInterface>();
    private _closed: boolean = false;

    constructor(opts: Partial<ServerOpts> = {}) {
        this.opts = Object.assign({}, defaultServerOpts, opts);
    }

    get closed(): boolean {
        return this._closed;
    }

    complete(): void {
        //TODO: what should we do here?
    }

    error(err: any): void {
        //TODO: what should we do here?
    }

    next(r: ServerResponseInterface): void {
        this._responses.next(r);
    }

    /**
     * @todo remove tmp debug output
     * @param addr
     */
    listen(addr?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let lastId = 0;
            const srv = http.createServer((req, res) => {
                const id = (++lastId).toString();
                dbg("New Request#%d from %s: %s %s", id, req.socket.remoteAddress, req.method, req.url);
                res.on("finish", () => {
                    dbg("Request#%d processed", id);
                });
                this._requests.next({
                    id,
                    original: { req, res },
                    state: {},
                    request: Request.fromNodeRequest(req)
                });
            });
            const [host, port] = (addr || "").split(":");
            const portNum = parseInt(port);
            const parsedAddr: Addr = Object.assign({}, defaultAddr, {
                host,
                port: isNaN(portNum) ? DefaultPort : portNum
            });
            srv.listen(parsedAddr.port, parsedAddr.host, () => {
                dbg("listening %s:%d", parsedAddr.host, parsedAddr.port);
                this._responses.subscribe(flushResponse); //TODO: handle errors?
                resolve();
            });
            srv.on("error", err => {
                dbg("Error listening %s: %s", addr, err);
                reject(err);
            });
        });
    }

    get requests(): Observable<Context> {
        return this._requests;
    }

    get responses(): Observable<ServerResponseInterface> {
        return this._responses;
    }

    send(): ResponseHandler {
        return source => source.pipe(
            catchErrors(),
            tap(r => this.next(r))
        );
    }

}


export default function listen(addr: string, opts: Partial<ServerOpts> = {}): Server {
    const server = new Server(opts);
    server.listen(addr).catch(err => console.error(err)); //TODO: handle
    return server;
};
