import { setTimeout } from 'node:timers/promises';

// SLEEP FUNCTION FOR WAITING/DELAY
export async function sleep(ms: number): Promise<void> {
    await setTimeout(Number(ms));
}

export async function wait(ms: number): Promise<void> {
    await setTimeout(Number(ms));
}

// FILTERING OBJECT VALUES (DON'T TOUCH)
export function filterObject<T extends object>(object: T): T | undefined {
    const result = {} as T;
    const entries = Object.entries(object);
    if (!entries.length) return void 0;

    for (const [key, value] of entries) {
        if (value === void 0 || value === null || value === '') continue;
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                if (!value.length) continue;
                result[key] = filterArray(value);
                continue;
            }

            const obj = filterObject(value);
            if (obj) result[key] = obj;
            continue;
        }
        result[key] = value;
    }

    return result;
}

// FILTERING ARRAY VALUES (DON'T TOUCH)
export function filterArray<T>(arr: T[]): T[] | undefined {
    const result = [] as T[];
    if (!arr.length) return void 0;

    for (const item of arr) {
        if (item === void 0 || item === null || item === '') continue;
        if (typeof item === 'object') {
            if (Array.isArray(item)) {
                result.push(...(filterArray(item) ?? []));
                continue;
            }

            const obj = filterObject(item);
            if (obj) result.push(obj);
            continue;
        }
        result.push(item);
    }

    return result;
}
