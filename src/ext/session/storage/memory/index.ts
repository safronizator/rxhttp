import {SessionManager, SessionStorage} from "../../interface";


export default class Storage implements SessionStorage {

    private readonly data: Map<string, Map<string, any>>;

    constructor(data: Map<string, Map<string, any>> = new Map<string, Map<string, any>>()) {
        this.data = data;
    }

    create(sid: string): SessionManager {
        const session = new Map<string, any>();
        this.data.set(sid, session);
        return session;
    }

    load(sid: string): SessionManager | undefined {
        return this.data.get(sid);
    }

}
