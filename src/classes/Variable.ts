import { type ShouwClient, Collective } from '../index.js';

/**
 * The variables manager to manage client variables
 *
 * @class Variables
 * @param {ShouwClient} client - The client instance
 */
export class Variables {
    /**
     * The client instance
     */
    public readonly client: ShouwClient;

    /**
     * The cache for the variables
     */
    readonly #cache: Collective<string, { name: string; value: any; table: string }>;

    /**
     * The database instance
     */
    public readonly database: any;

    /**
     * The tables for the variables
     */
    public readonly tables: string[];

    constructor(client: ShouwClient) {
        this.client = client;
        this.#cache = new Collective();
        this.database = client.database ?? void 0;
        this.tables = Array.isArray(this.database?.tables) ? this.database?.tables : [];
    }

    /**
     * Get the cache
     *
     * @return {Collective<string, { name: string; value: any; table: string }>} - The cache
     */
    public get cache(): Collective<string, { name: string; value: any; table: string }> {
        return this.#cache;
    }

    /**
     * Set a new variable
     *
     * @param {string} name - The name of the variable
     * @param {any} value - The value of the variable
     * @param {string} table - The table to set the variable in
     * @return {Variables} - The variables manager instance
     * @example <Variables>.set('ping', 'pong', 'table_name');
     */
    public set(name: string, value: any, table: string = this.tables[0]): Variables {
        if (!name || !value || !table) return this;
        this.cache.set(`${table}_${name}`, {
            name,
            value,
            table
        });

        return this;
    }

    /**
     * Get a variable
     *
     * @param {string} name - The name of the variable
     * @param {string} table - The table to get the variable from
     * @return {<{ name: string; value: any; table: string }> | undefined} - The variable data
     * @example <Variables>.get('ping', 'table_name');
     */
    public get(
        name: string,
        table: string = this.tables[0]
    ):
        | {
              name: string;
              value: any;
              table: string;
          }
        | undefined {
        return this.cache.get(`${table}_${name}`);
    }

    /**
     * Delete a variable
     *
     * @param {string} name - The name of the variable
     * @param {string} table - The table to delete the variable from
     * @return {Variables} - The variables manager instance
     * @example <Variables>.delete('ping', 'table_name');
     */
    public delete(name: string, table: string = this.tables[0]): Variables {
        this.cache.delete(`${table}_${name}`);
        return this;
    }

    /**
     * Clear all variables
     *
     * @return {Variables} - The variables manager instance
     * @example <Variables>.clear();
     */
    public clear(): Variables {
        this.cache.clear();
        return this;
    }

    /**
     * Check if a variable exists
     *
     * @param {string} name - The name of the variable
     * @param {string} [table] - The table to check the variable in
     * @return {boolean} - Whether the variable exists
     */
    public has(name: string, table: string = this.tables[0]): boolean {
        return this.cache.has(`${table}_${name}`);
    }

    /**
     * Get the size of the cache
     *
     * @return {number} - The size of the cache
     */
    public get size(): number {
        return this.cache.size;
    }

    /**
     * Get the keys of the cache
     *
     * @return {string[]} - The keys of the cache
     */
    public get keys(): string[] {
        return this.cache.K;
    }

    /**
     * Get the values of the cache
     *
     * @return {{ name: string; value: any; table: string }[]} - The values of the cache
     */
    public get values(): { name: string; value: any; table: string }[] {
        return this.cache.V;
    }
}
