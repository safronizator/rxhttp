export interface SessionManager {
    get(key: string): any;
    set(key: string, val: any): void;
}

export interface SessionStorage {
    load(sid: string): SessionManager | undefined;
    create(sid: string): SessionManager;
}

export interface WithSession {
    session: SessionManager;
}
