import type { Interpreter, InterpreterOptions, FunctionData, TemporarilyData } from '../index.js';
import type { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, Message } from 'discord.js';

export interface FunctionResultData extends Omit<InterpreterOptions, 'client'> {
    result: string | unknown;
    error?: boolean;
    embeds?: EmbedBuilder[];
    attachments?: AttachmentBuilder[];
    components?: ActionRowBuilder[];
    flags?: number | string | bigint;
    message?: Message;
}

export enum ParamType {
    URL = 0,
    String = 1,
    BigInt = 2,
    Void = 3,
    Number = 4,
    Object = 5,
    Array = 6,
    Boolean = 8
}

/**
 * Functions instance for building and managing functions
 *
 * @class Functions
 * @param {FunctionData} data - The data of the function
 */
export class Functions {
    /**
     * The name of the function
     */
    readonly #name?: string;

    /**
     * Whether the function uses brackets
     */
    readonly #brackets?: boolean;

    /**
     * The description of the function
     */
    readonly #description?: string;

    /**
     * The type of the function
     */
    readonly #type?: 'shouw.js' | 'discord.js' | 'djs';

    /**
     * The parameters of the function
     */
    readonly #params?: {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[];

    constructor(data: FunctionData) {
        if (!data) return;
        this.#name = data.name;
        this.#brackets = data.brackets ?? false;
        this.#description = data.description ?? 'No description provided for this function.';
        this.#type = data.type ?? 'shouw.js';
        this.#params = data.params ?? [];
    }

    /**
     * The code of the function. This function is called when the function is executed.
     *
     * @param {Interpreter} ctx - The interpreter context of the function
     * @param {Array<any>} args - The arguments of the function
     * @param {TemporarilyData} data - The temporarily data of the function
     * @return {Promise<FunctionResultData> | FunctionResultData} - The result of the function
     */
    public code(
        _ctx: Interpreter,
        _args: Array<any>,
        _data: TemporarilyData
    ): Promise<FunctionResultData> | FunctionResultData {
        return { result: void 0 };
    }

    /**
     * The name of the function
     *
     * @return {string | undefined} - The name of the function
     */
    public get name(): string | undefined {
        return this.#name;
    }

    /**
     * Whether the function uses brackets
     *
     * @return {boolean | undefined} - Whether the function uses brackets
     */
    public get brackets(): boolean | undefined {
        return this.#brackets;
    }

    /**
     * The description of the function
     *
     * @return {string | undefined} - The description of the function
     */
    public get description(): string | undefined {
        return this.#description;
    }

    /**
     * The type of the function
     *
     * @return {string | undefined} - The type of the function
     */
    public get type(): string | undefined {
        return this.#type;
    }

    /**
     * The parameters of the function
     *
     * @return {Array<{ name?: string; description?: string; required?: boolean; type?: ParamType; }> | undefined} - The parameters of the function
     */
    public get params():
        | {
              name?: string;
              description?: string;
              required?: boolean;
              type?: ParamType;
          }[]
        | undefined {
        return this.#params;
    }

    /**
     * The length of the parameters of the function
     *
     * @return {number} - The length of the parameters of the function
     */
    public get paramsLength(): number {
        return this.params?.length ?? -1;
    }

    /**
     * The name of the function with parameters
     *
     * @return {string} - The name of the function with parameters
     */
    public get withParams(): string {
        return `${this.name}[${this.params?.map((x) => x.name).join(';')}]`;
    }

    /**
     * Get a parameter of the function
     *
     * @param {number} index - The index of the parameter
     * @return {{ name?: string; description?: string; required?: boolean; type?: ParamType; } | undefined} - The parameter of the function
     */
    public getParams(index: number):
        | {
              name?: string;
              description?: string;
              required?: boolean;
              type?: ParamType;
          }
        | undefined {
        return this.params?.[index];
    }

    /**
     * The success result of the function
     *
     * @param {any} [result] - The result of the function
     * @param {boolean} [error] - Whether the function errored
     * @param {FunctionResultData} [data] - The data of the function
     * @return {FunctionResultData} - The success result of the function
     */
    public success(result: any = void 0, error?: boolean, ...data: FunctionResultData[]): FunctionResultData {
        return { ...data, result, error };
    }

    /**
     * The error result of the function
     *
     * @param {FunctionResultData} [data] - The data of the function
     * @return {FunctionResultData} - The error result of the function
     */
    public error(...data: FunctionResultData[]): FunctionResultData {
        return { result: void 0, ...data, error: true };
    }
}
