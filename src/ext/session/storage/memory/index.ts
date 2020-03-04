import {SessionManager, SessionStorage} from "../../interface";


export default class Storage implements SessionStorage {

    private readonly data: Map<string, Map<string, any>>;

    constructor(data: Map<string, Map<string, any>> = new Map<string, Map<string, any>>()) {
        this.data = data;
    }

    async create(sid: string): Promise<SessionManager> {
        const session = new Map<string, any>();
        this.data.set(sid, session);
        return session;
    }

    async load(sid: string): Promise<SessionManager | void> {
        return this.data.get(sid);
    }

}
