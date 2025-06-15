import type { Interpreter, InterpreterOptions, FunctionData, TemporarilyData, CustomFunctionData } from '../index.js';
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
    URL = 'URL',
    String = 'String',
    BigInt = 'BigInt',
    Void = 'Void',
    Number = 'Number',
    Color = 'Color',
    Object = 'Object',
    Array = 'Array',
    Boolean = 'Boolean',
    Any = 'Any'
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
    readonly #name: string;

    /**
     * Whether the function uses brackets
     */
    readonly #brackets?: boolean;

    /**
     * The description of the function
     */
    readonly #description?: string;

    /**
     * Whether the function escapes the arguments
     */
    readonly escapeArgs: boolean = false;

    /**
     * The parameters of the function
     */
    readonly #params?: {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    }[];

    constructor(data: FunctionData) {
        this.#name = data.name;
        this.#brackets = data.brackets ?? false;
        this.#description = data.description ?? 'No description provided for this function.';
        this.#params = data.params ?? [];
        this.escapeArgs = data.escapeArgs ?? false;
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
    public get name(): string {
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
     * Get whether the function escapes the arguments
     *
     * @return {boolean} - Whether the function escapes the arguments
     */
    public get escapeArguments(): boolean {
        return this.escapeArgs;
    }

    /**
     * The parameters of the function
     *
     * @return {Array<{ name?: string; description?: string; required?: boolean; type?: ParamType; }> | undefined} - The parameters of the function
     */
    public get params():
        | {
              name: string;
              description?: string;
              required: boolean;
              type: ParamType;
              rest?: boolean;
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
    public getParam(index: number): {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    } {
        return (
            this.params?.[index] ?? {
                name: 'arg',
                type: ParamType.Any,
                required: false
            }
        );
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

/**
 * The custom function class to create custom functions
 *
 * @class CustomFunction
 * @param {CustomFunctionData} data - The custom function data
 * @example const func = new CustomFunction({ code: '$log[Hello wold]', type: 'shouw.js', name: '$console.log' });
 * client.functions.createFunction(func);
 */
export class CustomFunction extends Functions {
    /**
     * The code of the function
     */
    readonly #code: CustomFunctionData['code'];

    /**
     * The type of the function
     */
    readonly #type: CustomFunctionData['type'];

    constructor(data: CustomFunctionData) {
        data.name = data.name.startsWith('$') ? data.name : `$${data.name}`;
        super({
            name: data.name,
            brackets: data.brackets ?? false,
            escapeArgs: data.escapeArgs ?? false,
            params: data.params?.map((x) => {
                return {
                    name: x.name,
                    type: x.type ?? ParamType.Any,
                    required: false
                };
            })
        });

        this.#code = data.code;
        this.#type = data.type;
    }

    /**
     * The code of the function. This function is called when the function is executed
     *
     * @return {string} - The code of the function
     */
    public get codeType(): string {
        return typeof this.#code;
    }

    /**
     * The type of the function
     *
     * @return {string} - The type of the function
     */
    public get type(): string {
        return this.#type;
    }

    /**
     * The code of the function. This function is called when the function is executed
     *
     * @return {string} - The code of the function
     */
    public get stringCode(): string {
        if (typeof this.#code !== 'string') return '';
        return this.#code as string;
    }

    /**
     * The code of the function. This function is called when the function is executed
     *
     * @param {Interpreter} ctx - The interpreter context of the function
     * @param {Array<any>} args - The arguments of the function
     * @param {TemporarilyData} data - The temporarily data of the function
     * @return {Promise<FunctionResultData> | FunctionResultData} - The result of the function
     */
    public async code(ctx: Interpreter, args: any[], data: TemporarilyData): Promise<FunctionResultData> {
        if (typeof this.#code === 'string') return this.success();
        return await this.#code(ctx, args, data);
    }
}
