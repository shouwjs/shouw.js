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
    Functions
} from '../index.js';
import { Collective } from '../utils/Collective.js';

export interface FunctionData extends Objects {
    name: string;
    description?: string;
    brackets?: boolean;
    type?: 'shouw.js' | 'discord.js' | 'djs';
    params?: {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    }[];
    code?:
        | string
        | ((int: Interpreter, args: any[], data: TemporarilyData) => FunctionResultData | Promise<FunctionResultData>);
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
export class FunctionsManager extends Collective<string, Functions> {
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
    public createFunction(data: FunctionData): FunctionsManager {
        const func = new Functions(data);
        if (!func.name) return this;
        if ((func.type === 'discord.js' || func.type === 'djs') && typeof data.code === 'function')
            func.code = data.code;
        else if (func.type === 'shouw.js' && typeof data.code === 'string')
            func.code =
                data.code !== ''
                    ? async (ctx: Interpreter) => {
                          const result = await ctx.interpreter.run(
                              {
                                  ...func,
                                  code: (data.code ?? '') as string
                              },
                              ctx,
                              {
                                  sendMessage: true,
                                  returnId: false,
                                  returnResult: true,
                                  returnError: true,
                                  returnData: true
                              }
                          );
                          if (result.error) return func.error();
                          return func.success(result.result, result.error, result.data as any);
                      }
                    : func.code;

        if (this.has(func.name)) this.delete(func.name);
        this.create(func.name, func);

        this.client.debug(`Function created: ${cyan(func.name)}`);
        return this;
    }
}
