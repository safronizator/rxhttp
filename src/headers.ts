import {Headers, HeadersLike} from "./interface";
import {map, merge} from "./helpers";
import {IncomingHttpHeaders} from "http";


export default class HeadersContainer implements Headers {

    private readonly h: Map<string, string[]>;

    constructor(iterable: Iterable<readonly [string, string[]]>) {
        this.h = new Map<string, string[]>(iterable);
    }

    static from(h: HeadersLike) {
        return new HeadersContainer(map(h.entries(), ([name, vals]) => [
            name,
            typeof vals === "string" ? [vals] : vals
        ]));
    }

    static fromNodeHeaders(h: IncomingHttpHeaders): HeadersContainer {
        return new HeadersContainer(map(Object.entries(h), ([name, vals]) => [
            name,
            vals === undefined ? [""] : (typeof vals === "string" ? [vals] : vals)
        ]));
    }

    set(key: string, value: string[]): HeadersContainer {
        return new HeadersContainer(this.clone().entries());
    }

    add(name: string, value: string | string[]): Headers {
        const adding: [string, string[]] = [
            name,
            typeof value === "string" ? [value]: value
        ];
        return new HeadersContainer(merge(this.clone(), [adding]));
    }

    build(): Map<string, string> {
        return new Map<string, string>(map(this.h.entries(), ([name, vals]) => [
            name,
            HeadersContainer.join(vals)
        ]));
    }

    getValue(name: string): string|undefined {
        const vals = this.h.get(name) || this.h.get(name.toLowerCase()); //TODO: should be set only in one format?
        if (vals === undefined) {
            return vals;
        }
        return HeadersContainer.join(vals);
    }

    entries(): Iterable<[string, string[]]> {
        return this.h.entries();
    }

    has(name: string, value?: string): boolean {
        const norm = name.toLowerCase();
        if (value === undefined) {
            return this.h.has(norm);
        }
        const vals = this.h.get(norm);
        if (vals === undefined) {
            return false;
        }
        return vals.includes(value);
    }

    static join(vals: string[]): string {
        return vals.join('; ');
    }

    private clone(): Map<string, string[]> {
        return new Map(map(this.h.entries(), ([name, vals]) => [
            name,
            [...vals]
        ]));
    }

}
