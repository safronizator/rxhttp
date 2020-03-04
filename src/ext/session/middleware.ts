import {Middleware} from "../../handling";
import {mergeMap} from "rxjs/operators";
import {SessionManager, SessionStorage, WithSession} from "./interface";
import Storage from "./storage/memory";
import uniqid from "uniqid";
import useCookies, {WithCookies} from "../cookies";

let defStorage: SessionStorage;


const getDefStorage = (): SessionStorage => {
    if (!defStorage) {
        defStorage = new Storage();
    }
    return defStorage;
};

const loadOrCreate = async (storage: SessionStorage, sid: string): Promise<{ sid: string, session: SessionManager }> => {
    const session = await storage.load(sid);
    if (session) {
        return { sid, session };
    }
    const newKey = uniqid();
    return { sid: newKey, session: await storage.create(newKey) };
};

/**
 * @todo proper errors handling
 * @todo additional parameters: lifetime, cookie opts, etc
 */
const startSession = <T>(storage: SessionStorage = getDefStorage()): Middleware<T, T & WithCookies & WithSession> => source => {
    return source.pipe(
        useCookies(), //TODO: options?
        mergeMap(async ctx => {
            const receivedId = ctx.state.cookies["sid"]; //TODO: hardcoded key!
            const {session, sid} = await loadOrCreate(storage, receivedId);
            ctx.state.setCookie("sid", sid); //TODO: remove hardcode; add expiration and other opts
            return ctx.withState({session});
        })
    );
};

export default startSession;
