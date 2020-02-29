import {Middleware} from "../../handling";
import {tap} from "rxjs/operators";
import {objectFromMap, streamReadAllToString} from "../../helpers";

interface DumpOpts {
    printHeaders: boolean;
    printBody: boolean;
}

const defaultDumpOpts: DumpOpts = {
    printHeaders: true,
    printBody: false
};

/**
 * @todo customizable output
 */
export const dumpRequests = (dumpOpts: Partial<DumpOpts> = {}): Middleware => source => {
    const opts = Object.assign({}, defaultDumpOpts, dumpOpts);
    return source.pipe(tap(async ctx => {
        console.info(`${ctx.original.req.connection.remoteAddress} -> ${ctx.request.method} ${ctx.request.url}`);
        if (opts.printHeaders) {
            console.info("Headers:", objectFromMap(ctx.request.headers.build()));
        }
        if (opts.printBody) {
            const body = (await streamReadAllToString(ctx.request.body)).trim();
            body.length && console.info("Body:", body);
        }
    }));
};
