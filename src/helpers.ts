import ReadableStream = NodeJS.ReadableStream;


export function *map<T, U=T>(c: Iterable<T>, cb: (cur: T) => U): Iterable<U> {
    for (const el of c) {
        yield cb(el);
    }
}

export function *filter<T>(c: Iterable<T>, cb: (cur: T) => boolean): Iterable<T> {
    for (const el of c) {
        if (cb(el)) {
            yield el;
        }
    }
}

export function *merge<T>(...cs: Iterable<T>[]): Iterable<T> {
    for (const c of cs) {
        for (const el of c) {
            yield el;
        }
    }
}

export function toArray<T>(c: Iterable<T>): T[] {
    return Array.from(c);
}

export function objectFromMap<T>(m: Map<string, T>): { [key: string]: T } {
    if (Object.hasOwnProperty('fromEntries')) {
        // coming with newest standart
        return (Object as unknown as { fromEntries(m: Map<string, T>): { [key: string]: T } }).fromEntries(m);
    }
    const obj: { [key: string]: T } = {};
    m.forEach ((v,k) => { obj[k] = v });
    return obj;
}

export function streamReadAll(stream: ReadableStream): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const chunks = new Array<string>();
        stream.on('data', (chunk) => {
            chunks.push(chunk.toString());
        });
        stream.on('end', () => {
            resolve(chunks.join(''));
        });
        stream.on('error', reject);
    });
}
