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
    public readonly cache: Collective<string, { name: string; value: any; table: string }>;

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
        this.cache = new Collective();
        this.database = client.database ?? void 0;
        this.tables = Array.isArray(this.database?.tables) ? this.database?.tables : [];
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
}
