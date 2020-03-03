import {NextObserver, Observable, Subject} from "rxjs";
import {
    DefaultHost,
    DefaultPort,
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

function parseAddrDef(addr: string): Addr {
    const [host, port] = addr.split(":");
    const portNum = parseInt(port);
    return Object.assign({}, defaultAddr, {
        host,
        port: isNaN(portNum) ? DefaultPort : portNum
    });
}

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

export function capture(requests: NextObserver<Context>): RequestListener {
    let lastId = 0;
    return (req, res) => {
        const id = (++lastId).toString();
        dbg("new Request#%d from %s: %s %s", id, req.socket.remoteAddress, req.method, req.url);
        res.on("finish", () => {
            dbg("Request#%d processed", id);
        });
        requests.next(Context.fromNodeContext(id, { req, res  }));
    };
}

interface ServeInterface {
    send(): ResponseHandler;
    responses: Subject<ServerResponseInterface>;
    errors: Observable<HandlingError>;
}

export function serve(): ServeInterface {
    const responses = new Subject<ServerResponseInterface>();
    const errors = new Subject<HandlingError>();
    const captureErrors = (): ResponseHandler => source => source.pipe(catchErrors(errors));
    const send = (): ResponseHandler => source => source.pipe(captureErrors(), tap(r => responses.next(r)));
    responses.subscribe({
        next: flushResponse
    });
    return { send, responses, errors };
}

interface ListenInterface extends ServeInterface {
    requests: Observable<Context>;
    isListening: Promise<void>;
}

export default function listen(addr?: string): ListenInterface {
    const srv = serve();
    const requests = new Subject<Context>();
    const httpSrv = http.createServer(capture(requests));
    srv.responses.subscribe({
        complete: () => requests.complete()
    });
    const parsedAddr = parseAddrDef(addr || "");
    const isListening = new Promise<void>((resolve, reject) => {
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
    return { ...srv, requests, isListening };
}
