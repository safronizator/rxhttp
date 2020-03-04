export interface SessionManager {
    get(key: string): any;
    set(key: string, val: any): void;
}

export interface SessionStorage {
    load(sid: string): Promise<SessionManager | void>;
    create(sid: string): Promise<SessionManager>;
}

export interface WithSession {
    session: SessionManager;
}
