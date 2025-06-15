import * as fs from 'node:fs';
import * as path from 'node:path';
import { cyan } from 'chalk';
import {
    type Objects,
    type ParamType,
    type Interpreter,
    type FunctionResultData,
    type TemporarilyData,
    type ShouwClient,
    type Functions,
    CustomFunction
} from '../index.js';
import { Collective } from '../utils/Collective.js';

export interface FunctionData extends Objects {
    name: string;
    description?: string;
    brackets?: boolean;
    escapeArgs?: boolean;
    params?: {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    }[];
    code?: (int: Interpreter, args: any[], data: TemporarilyData) => FunctionResultData | Promise<FunctionResultData>;
}

export interface CustomFunctionData {
    code:
        | string
        | ((int: Interpreter, args: any[], data: TemporarilyData) => FunctionResultData | Promise<FunctionResultData>);
    type: 'shouw.js' | 'discord.js' | 'djs';
    escapeArgs?: boolean;
    brackets?: boolean;
    params?: FunctionData['params'];
    name: string;
}

/**
 * The functions manager instance to manage client functions
 *
 * @class FunctionsManager
 * @extends {Collective<string, Functions>}
 * @param {ShouwClient} client - The client instance
 * @example const functions = new FunctionsManager(client);
 * functions.load('./functions', true); // Load functions from the functions directory
 * functions.createFunction(<FunctionData>) // Create a new function
 */
export class FunctionsManager extends Collective<string, Functions | CustomFunction> {
    /**
     * The client instance
     */
    public readonly client: ShouwClient;

    constructor(client: ShouwClient) {
        super();
        this.client = client;
    }

    /**
     * Load functions from the functions directory
     *
     * @param {string} basePath - The base path to load functions from
     * @param {boolean} debug - Whether to enable debug mode
     * @return {Promise<void>} - Nothing
     */
    public async load(basePath: string, debug: boolean): Promise<undefined> {
        const files = fs.readdirSync(basePath);
        for (const file of files) {
            const filePath = path.join(basePath, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                this.load(filePath, debug);
            } else if (file.endsWith('.js')) {
                try {
                    let RawFunction = require(filePath);
                    RawFunction = RawFunction ? (RawFunction?.default ?? RawFunction) : void 0;
                    if (!RawFunction) {
                        this.client.debug(`Function ${cyan(file)} has no default export`, 'WARN');
                        continue;
                    }

                    const func = new RawFunction();
                    this.create(func.name, func);
                    this.client.debug(`Function loaded: ${cyan(func.name)}`);
                } catch (err: any) {
                    this.client.debug(`Error in function ${cyan(file)}:\n${err.stack}`, 'ERROR');
                }
            }
        }
    }

    /**
     * Create a new function
     *
     * @param {FunctionData} data - The function data
     * @return {FunctionsManager} - The functions manager class
     */
    public createFunction(data: CustomFunctionData): FunctionsManager {
        if (!data.name || !data.code || !Array.isArray(data.params)) {
            this.client.debug('Failed to creating function: Missing required function data', 'ERROR');
            return this;
        }

        data.name = data.name.startsWith('$') ? data.name : `$${data.name}`;
        if (this.has(data.name)) this.delete(data.name);
        data.type = !['shouw.js', 'discord.js', 'djs'].includes(data.type) ? 'shouw.js' : data.type;

        const func = new CustomFunction(data);
        this.create(func.name, func);

        this.client.debug(`Function created: ${cyan(func.name)}`);
        return this;
    }
}
