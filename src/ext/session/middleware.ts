import {Middleware, passThrough} from "../../handling";
import {SessionManager, SessionStorage, WithSession} from "./interface";
import Storage from "./storage/memory";
import uniqid from "uniqid";
import useCookies, {WithCookies} from "../cookies";
import {Context} from "../../base";

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

interface SessionOpts {
    storage: SessionStorage;
    cookieName: string;
    lifetime?: number;
    path?: string;
    domain?: string;
}

const normalizeOpts = (opts: Partial<SessionOpts>): SessionOpts => ({
    ...opts,
    storage: opts.storage || getDefStorage(),
    cookieName: opts.cookieName || "sid",
});

const getSessionHandler = (opts: Partial<SessionOpts>) => async <T extends WithCookies>(ctx: Context<T>): Promise<Context<T & WithSession>> => {
    const fopts = normalizeOpts(opts);
    const receivedId = ctx.state.cookies[fopts.cookieName];
    const {session, sid} = await loadOrCreate(fopts.storage, receivedId);
    ctx.state.setCookie(fopts.cookieName, sid, {
        expires: opts.lifetime ? new Date(Date.now() + opts.lifetime) : undefined,
        path: opts.path,
        domain: opts.domain
    });
    return ctx.withState({session});
};

const startSession = <T>(opts: Partial<SessionOpts> = {}): Middleware<T, T & WithCookies & WithSession> => source => source.pipe(
    useCookies(),
    passThrough(getSessionHandler(opts))
);

export default startSession;
