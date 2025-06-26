import { type ShouwClient, Constants } from '../index.js';
import { Collective } from '../utils/Collective.js';
import { Options, type CacheWithLimitsOptions, type CacheFactory } from 'discord.js';

/**
 * @class CacheManager
 *
 * @param {ShouwClient} client - The client instance.
 */
export class CacheManager {
    /**
     * The cache.
     */
    readonly #cache: {
        [name: string]: Collective<any, any>;
    };

    /**
     * The client instance.
     */
    public readonly client: ShouwClient;

    constructor(client: ShouwClient) {
        this.client = client;
        this.#cache = {};
    }

    /**
     * Gets the cache.
     *
     * @returns {Collective<any, any>} The cache.
     */
    public get cache(): {
        [name: string]: Collective<any, any>;
    } {
        return this.#cache;
    }

    /**
     * Creates a new cache.
     *
     * @param {string} name - The name of the cache.
     * @returns {Collective<K, V>} The created cache.
     */
    public createCache<K, V>(name: string): Collective<K, V> {
        this.cache[name] = new Collective<K, V>();
        return this.#cache[name];
    }

    /**
     * Gets a cache by name.
     *
     * @param {string} name - The name of the cache.
     * @returns {Collective<any, any>} The cache.
     */
    public getCache(name: string): Collective<any, any> {
        return this.cache[name];
    }

    /**
     * Deletes a cache by name.
     *
     * @param {string} name - The name of the cache.
     * @returns {void}
     */
    public deleteCache(name: string): void {
        delete this.cache[name];
    }

    /**
     * Checks if a cache exists.
     *
     * @param {string} name - The name of the cache.
     * @returns {boolean} Whether the cache exists.
     */
    public hasCache(name: string): boolean {
        return Object.hasOwn(this.cache, name);
    }
    /**
     * Get all cache names.
     *
     * @returns {string[]} The cache names.
     */
    public get cacheNames(): string[] {
        return Object.keys(this.cache);
    }

    /**
     * Get all caches.
     *
     * @returns {Collective<any, any>[]} The caches.
     */
    public get caches(): Collective<any, any>[] {
        return Object.values(this.cache);
    }

    /**
     * Gets a value from a cache.
     *
     * @param {string} name - The name of the cache.
     * @param {any} key - The key of the value.
     * @returns {any} The value.
     */
    public get(name: string, key: any): any {
        return this.cache[name]?.get(key);
    }

    /**
     * Sets a value in a cache.
     *
     * @param {string} name - The name of the cache.
     * @param {any} key - The key of the value.
     * @param {any} value - The value to set.
     * @returns {Collective<any, any>} The cache.
     */
    public set(name: string, key: any, value: any): Collective<any, any> | undefined {
        return this.cache[name]?.set(key, value) ?? void 0;
    }

    /**
     * Deletes a value from a cache.
     *
     * @param {string} name - The name of the cache.
     * @param {any} key - The key of the value.
     * @returns {boolean} Whether the value was deleted.
     */
    public delete(name: string, key: any): boolean {
        return this.cache[name]?.delete(key) ?? false;
    }

    /**
     * Clears a cache.
     *
     * @param {string} name - The name of the cache.
     * @returns {void}
     */
    public clear(name: string): void {
        this.cache[name]?.clear();
    }

    /**
     * Checks if a cache has a value.
     *
     * @param {string} name - The name of the cache.
     * @param {any} key - The key of the value.
     * @returns {boolean} Whether the cache has the value.
     */
    public has(name: string, key: any): boolean {
        return this.cache[name]?.has(key) ?? false;
    }

    /**
     * Gets the size of a cache.
     *
     * @param {string} name - The name of the cache.
     * @returns {number} The size of the cache.
     */
    public size(name: string): number {
        return this.cache[name]?.size ?? 0;
    }

    /**
     * Gets the keys of a cache.
     *
     * @param {string} name - The name of the cache.
     * @returns {any[]} The keys of the cache.
     */
    public keys(name: string): any[] {
        return this.cache[name]?.K ?? [];
    }

    /**
     * Gets the values of a cache.
     *
     * @param {string} name - The name of the cache.
     * @returns {any[]} The values of the cache.
     */
    public values(name: string): any[] {
        return this.cache[name]?.V ?? [];
    }

    /**
     * create a cache factory from discord.js cache options
     *
     * @param {Record<string, number | {
     *     maxSize?: number;
     *     keepOverLimit?: (value: any, key: any, collection: Collective<any, any>) => boolean | Promise<boolean>;
     * }>} caches - The caches to create.
     * @returns {CacheFactory} The cache factory.
     */
    public static __discordJSCacheOptions(caches: {
        [K: string]:
            | number
            | {
                  maxSize?: number;
                  keepOverLimit?: (
                      value: any,
                      key: any,
                      collection: Collective<any, any>
                  ) => boolean | Promise<boolean>;
              };
    }): CacheFactory {
        const entries = Object.entries(caches);
        if (entries.length === 0) return Options.cacheWithLimits({});
        const managers: CacheWithLimitsOptions = {};
        for (let [key, value] of entries) {
            key = Constants.Caches[key];
            if (!key) continue;
            if (typeof value === 'object' && !Array.isArray(value)) {
                const { keepOverLimit, maxSize } = value;
                managers[key] = {
                    keepOverLimit: typeof keepOverLimit === 'function' ? keepOverLimit : void 0,
                    maxSize: typeof maxSize === 'number' ? maxSize : void 0
                };
            } else if (typeof value === 'number') {
                managers[key] = Number.parseInt(value.toString());
            }
        }

        return Options.cacheWithLimits(managers);
    }
}
