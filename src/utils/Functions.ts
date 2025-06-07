import { setTimeout } from 'node:timers/promises';

/**
 * Sleep function to wait for a certain amount of time
 *
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise<void>} - Promise that resolves after the given amount of time
 */
export async function sleep(ms: number): Promise<void> {
    await setTimeout(Number(ms));
}

/**
 * Wait function to wait for a certain amount of time
 *
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise<void>} - Promise that resolves after the given amount of time
 */
export async function wait(ms: number): Promise<void> {
    await setTimeout(Number(ms));
}

/**
 * Filtering object values
 *
 * @param {T} object - The object to filter
 * @returns {T | undefined} - The filtered object or undefined if the object is empty
 * @template T - The type of the object
 */
export function filterObject<T extends object>(object: T): T | undefined {
    try {
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
    } catch {
        return object;
    }
}

/**
 * Filtering array values
 *
 * @param {T[]} arr - The array to filter
 * @returns {T[] | undefined} - The filtered array or undefined if the array is empty
 * @template T - The type of the array
 */
export function filterArray<T>(arr: T[]): T[] | undefined {
    try {
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
    } catch {
        return arr;
    }
}
