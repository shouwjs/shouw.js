import {
    type FunctionResultData,
    type CommandData,
    type Objects,
    type Flags,
    type InteractionWithMessage,
    type FunctionsManager,
    type ShouwClient as Client,
    type Interaction,
    type SendData,
    type Functions,
    ParamType,
    Parser,
    CheckCondition,
    IF,
    Time,
    Util,
    filterArray,
    sleep,
    Context
} from '../index.js';
import * as Discord from 'discord.js';

export interface InterpreterOptions {
    client: Client;
    guild?: Discord.Guild;
    channel?: Discord.Channel;
    member?: Discord.GuildMember;
    user?: Discord.User;
    context?: Context;
    args?: string[];
    debug?: boolean;
    Temporarily?: TemporarilyData;
    message?: Discord.Message;
    interaction?: Interaction;
    isAutocomplete?: boolean;
}

export interface TemporarilyData extends Objects {
    arrays: Objects;
    variables: Objects;
    splits: Array<string>;
    randoms: Objects;
    timezone: string | undefined;
}

export interface HelpersData {
    parser: (ctx: Interpreter, input: string) => Promise<SendData>;
    sleep: (ms: number) => Promise<void>;
    time: typeof Time;
    condition: (input: string) => boolean;
    interpreter: typeof Interpreter;
    unescape: (str: string) => string;
    escape: (str: string) => string;
    mustEscape: (str: string) => string;
}

export interface ExtraOptionsData {
    sendMessage?: boolean;
    returnId?: boolean;
    returnResult?: boolean;
    returnError?: boolean;
    returnData?: boolean;
}

/**
 * Interpreter responsible for executing the command code and handling the command data and options to send the result to the channel the command was sent in
 *
 * @class Interpreter
 * @param {CommandData} cmd - The command data
 * @param {InterpreterOptions} options - The interpreter options
 * @param {ExtraOptionsData} [extras] - The extra options
 * @example const interpreter = new Interpreter(cmd, options, extras);
 * interpreter.initialize(); // Initialize the interpreter
 */
export class Interpreter {
    /**
     * The client instance
     */
    public readonly client: Client;

    /**
     * The functions manager instance
     */
    public readonly functions: FunctionsManager;

    /**
     * Whether to enable debug mode
     */
    public readonly debug: boolean | undefined;

    /**
     * The start time of the interpreter
     */
    public start = performance.now();

    /**
     * The interpreter class
     */
    public interpreter = Interpreter;

    /**
     * The code to execute
     */
    public code: string | ((ctx: Interpreter, context: Context, data: TemporarilyData) => any);

    /**
     * The command data
     */
    public command: CommandData;

    /**
     * The channel the command was sent in
     */
    public channel?: Discord.Channel;

    /**
     * The guild the command was sent in
     */
    public guild?: Discord.Guild;

    /**
     * The member who sent the command
     */
    public member?: Discord.GuildMember;

    /**
     * The user who sent the command
     */
    public user?: Discord.User;

    /**
     * The context of the command
     */
    public context: Context;

    /**
     * The arguments of the command
     */
    public args?: string[];

    /**
     * The embeds to send
     */
    public embeds: Discord.EmbedBuilder[] = [];

    /**
     * The attachments to send
     */
    public attachments: Discord.AttachmentBuilder[] = [];

    /**
     * The stickers to send
     */
    public stickers: Discord.Sticker[] = [];

    /**
     * The flags to send
     */
    public flags: Array<number | string | bigint> = [];

    /**
     * The message the command was sent in
     */
    public message: Discord.Message | undefined = void 0;

    /**
     * The interaction the command was sent in
     */
    public interaction: Interaction | undefined = void 0;

    /**
     * The noop function
     */
    public noop: () => void = () => {};

    /**
     * The helpers data
     */
    public helpers: HelpersData;

    /**
     * The temporarily data
     */
    public Temporarily: TemporarilyData;

    /**
     * The discord.js library
     */
    public readonly discord: typeof Discord = Discord;

    /**
     * The util library
     */
    public readonly util: typeof Util = Util;

    /**
     * The extra options
     */
    public readonly extras: ExtraOptionsData;

    /**
     * Whether the interpreter is in error mode
     */
    public isError = false;

    /**
     * The components to send
     */
    public components: Discord.TopLevelComponent[] = [];

    constructor(cmd: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData) {
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.message = options.message;
        this.interaction = options.interaction;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context as Context;
        this.args = options.args;
        this.helpers = {
            parser: Parser,
            sleep: sleep,
            time: Time,
            condition: CheckCondition,
            interpreter: Interpreter,
            unescape: (str: string) => str.unescape(),
            escape: (str: string) => str.escape(),
            mustEscape: (str: string) => str.mustEscape()
        };
        this.Temporarily = {
            ...options.Temporarily,
            arrays: {},
            variables: {},
            splits: [],
            randoms: {},
            timezone: void 0
        };
        this.extras = {
            sendMessage: extras?.sendMessage ?? true,
            returnId: extras?.returnId ?? false,
            returnResult: extras?.returnResult ?? true,
            returnError: extras?.returnError ?? false,
            returnData: extras?.returnData ?? false
        };

        if (!this.context || !(this.context instanceof Context)) {
            this.context = new Context(
                this.message ??
                    this.interaction ??
                    ({
                        client: this.client as Discord.Client<true>,
                        channel: this.channel as Discord.TextBasedChannel,
                        guild: this.guild as Discord.Guild,
                        member: this.member as Discord.GuildMember,
                        user: this.user as Discord.User
                    } as InteractionWithMessage),
                this.args ?? []
            );
        }
    }

    /**
     * Initialize the interpreter and execute the command code
     *
     * @returns {Promise<{ id?: string; result?: string; error?: boolean; data?: object }>} - The result of the interpreter
     */
    public async initialize(): Promise<{
        id?: string;
        result?: undefined | string;
        error?: boolean;
        data?: object;
    }> {
        try {
            if (typeof this.code === 'function') {
                await this.code(this, this.context, this.Temporarily);
                return {};
            }

            const processFunction = async (code: string): Promise<string> => {
                const functions = this.extractFunctions(code);
                if (functions.length === 0) return code;
                let oldCode = code;
                let currentCode = code;

                for (const func of functions) {
                    if (this.isError || !oldCode || oldCode.trim() === '') break;
                    const unpacked = this.unpack(func, oldCode);
                    const functionData: Functions | undefined = this.functions.get(func);
                    if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                        continue;

                    if (functionData.brackets && !unpacked.brackets) {
                        await this.error({
                            message: `Invalid ${func} usage: Missing brackets`,
                            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
                        });
                        break;
                    }

                    if (this.isError) break;
                    const processedArgs: Array<unknown> = [];

                    for (let i = 0; i < functionData.paramsLength; i++) {
                        const field = functionData.getParams(i);
                        if (!field) break;
                        const arg = this.switchArg((unpacked.args[i] ?? '') as string, field.type ?? ParamType.String);

                        if (field.type !== ParamType.Boolean && (!arg || arg === '')) {
                            if (field.required) {
                                await this.error({
                                    message: `Missing required argument "${field.name}" on function ${func}!`,
                                    solution: 'Make sure to add all required argument to the function.'
                                });
                                break;
                            }

                            processedArgs.push(void 0);
                            continue;
                        }

                        if ((typeof arg === 'string' && !arg.match(/\$/g)) || typeof arg !== 'string') {
                            processedArgs.push(arg);
                            continue;
                        }

                        const processed = this.switchArg(await processFunction(arg), field.type ?? ParamType.String);
                        if ((!processed || processed === '') && field.required && field.type !== ParamType.Boolean) {
                            await this.error({
                                message: `Missing required argument "${field.name}" on function ${func}!`,
                                solution: 'Make sure to add all required argument to the function.'
                            });
                            break;
                        }

                        processedArgs.push(processed);
                    }

                    if (this.isError) break;
                    if (func.match(/\$if$/i)) {
                        const {
                            code: ifCode,
                            error: isError,
                            oldCode: ifOldCode
                        } = await IF(currentCode, oldCode, this);

                        this.isError = isError;
                        currentCode = isError ? ifCode : await processFunction(ifCode);
                        oldCode = ifOldCode;
                        break;
                    }

                    unpacked.args = processedArgs;
                    if (this.isError) break;
                    let DATA: FunctionResultData = { result: void 0 };
                    try {
                        DATA =
                            (await functionData.code(this, processedArgs, this.Temporarily)) ??
                            ({} as FunctionResultData);
                    } catch (err: any) {
                        await this.error(err, func);
                        this.client.debug(`${err?.stack ?? err}`, 'ERROR', true);
                        DATA = { result: void 0, error: true };
                    }

                    currentCode = currentCode.replace(unpacked.all, () => DATA.result?.toString() ?? '');
                    oldCode = oldCode.replace(unpacked.all, '');

                    if (this.isError || DATA.error === true) {
                        this.isError = true;
                        break;
                    }

                    for (const [key, value] of Object.entries(DATA)) {
                        if (!key || !value || !Object.hasOwn(this, key)) continue;
                        this[key] = value;
                    }
                }

                return currentCode.trim();
            };

            const result = (await processFunction(this.code)).unescape();
            const end = (performance.now() - this.start).toFixed(2).toString();
            this.code = result.replace(/\$executionTime/gi, end);
            this.embeds = JSON.parse(JSON.stringify(this.embeds).replace(/\$executionTime/gi, end));

            if (
                this.extras.sendMessage === true &&
                this.isError === false &&
                ((this.code && this.code !== '') ||
                    this.components.length > 0 ||
                    this.embeds.length > 0 ||
                    this.attachments.length > 0 ||
                    this.stickers.length > 0)
            ) {
                this.message = (await this.context?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds.filter(Boolean),
                    components: this.components.filter(Boolean),
                    files: this.attachments.filter(Boolean),
                    flags: (Array.isArray(this.flags) ? this.flags.filter(Boolean) : this.flags) as Flags
                })) as Discord.Message;
            }

            return {
                ...(this.extras.returnResult ? { result: this.code } : {}),
                ...(this.extras.returnId ? { id: this.message?.id } : {}),
                ...(this.extras.returnError ? { error: this.isError } : {}),
                ...(this.extras.returnData
                    ? {
                          data: {
                              ...this.Temporarily,
                              embeds: this.embeds,
                              components: this.components,
                              attachments: this.attachments,
                              flags: this.flags
                          }
                      }
                    : {})
            };
        } catch (err: any) {
            this.client.debug(`${err?.stack ?? err}`, 'ERROR', true);
            return {};
        }
    }

    /**
     * Unpack a function arguments from the code with brackets and arguments
     *
     * @param {string} func - The function to unpack
     * @param {string} code - The code to unpack from
     * @return {{ func: string; args: Array<unknown>; brackets: boolean; all: string | null }} - The unpacked function
     * @private
     */
    private unpack(
        func: string,
        code: string
    ): {
        func: string;
        args: Array<unknown>;
        brackets: boolean;
        all: string | null;
    } {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1) return { func, args: [], brackets: false, all: null };
        const openBracketIndex = code.indexOf('[', funcStart);
        const onlyFunction = code.slice(funcStart, funcStart + func.length);
        if (openBracketIndex === -1) return { func, args: [], brackets: false, all: onlyFunction };

        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return { func, args: [], brackets: false, all: onlyFunction };

        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;

        while (closeBracketIndex < code.length) {
            if (code.charAt(closeBracketIndex) === '[') {
                bracketStack++;
            } else if (code.charAt(closeBracketIndex) === ']') {
                bracketStack--;
                if (bracketStack === 0) break;
            }

            closeBracketIndex++;
        }

        if (closeBracketIndex >= code.length || bracketStack > 0)
            return { func, args: [], brackets: false, all: onlyFunction };
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return { func, args: args, brackets: true, all };
    }

    /**
     * Extract arguments from a function arguments string
     *
     * @param {string} argsStr - The string to extract arguments from
     * @return {Array<string | undefined>} - The extracted arguments
     * @private
     */
    private extractArguments(argsStr: string): Array<string | undefined> {
        const args: string[] = [];
        let depth = 0;
        let currentArg = '';

        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr.charAt(i);
            if (char === '[') {
                depth++;
                currentArg += char;
            } else if (char === ']') {
                depth--;
                currentArg += char;
            } else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            } else {
                currentArg += char;
            }
        }

        if (currentArg.trim()) args.push(currentArg.trim());

        return args.map((arg: string) => {
            if (arg !== '') return arg;
            return void 0;
        });
    }

    /**
     * Extract all functions from the code and return them as an array of strings
     *
     * @param {string} code - The code to extract functions from
     * @return {Array<string>} - The extracted functions
     * @private
     */
    private extractFunctions(code: string): Array<string> {
        const functions: string[] = [];
        const regex = /\$([^\$\[\];\s]+)/g;
        let depth = 0;
        let index = 0;

        while (index < code.length) {
            const char = code[index];
            if (char === '[') {
                depth++;
                index++;
                continue;
            }
            if (char === ']') {
                depth--;
                index++;
                continue;
            }

            if (depth === 0 && char === '$') {
                regex.lastIndex = index;
                const match = regex.exec(code);
                if (match && match.index === index) {
                    const fullName = `$${match[1]}`;
                    const matched = this.functions.K.filter((f) =>
                        fullName.toLowerCase().startsWith(f.toLowerCase())
                    ).sort((a, b) => b.length - a.length)[0];

                    if (matched) functions.push(matched);
                    index = regex.lastIndex;
                    continue;
                }
            }
            index++;
        }

        return filterArray(functions) ?? [];
    }

    /**
     * Success result of the function to return the result of the function
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
     * Error result of the function to return the error result of the function
     *
     * @param {string | { message: string; solution?: string }} options - The options of the function
     * @param {string} [functionName] - The name of the function
     * @return {Promise<FunctionResultData>} - The error result of the function
     */
    public async error(
        options: string | { message: string; solution?: string },
        functionName?: string
    ): Promise<FunctionResultData> {
        try {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            this.isError = true;
            this.message = await this.context?.send(
                `\`\`\`\n${functionName ? `${functionName}: ` : ''}🚫 ${message}${solution ? `\n\nSo, what is the solution?\n${solution}` : ''}\`\`\``
            );
        } catch {
            this.isError = true;
            this.client.debug(typeof options === 'string' ? options : options.message, 'ERROR', true);
        }

        return { result: void 0, error: true };
    }

    /**
     * Switch the argument to the correct type
     *
     * @param {string} arg - The argument to switch
     * @param {ParamType} type - The type of the argument
     * @return {any} - The switched argument
     * @private
     */
    private switchArg(arg: string, type: ParamType): any {
        if (!arg || arg === '' || ParamType.Void === type) return void 0;

        switch (type) {
            case ParamType.String:
                return arg.toString();
            case ParamType.BigInt:
                return BigInt(arg);
            case ParamType.Number:
                return Number(arg);
            case ParamType.Boolean:
                return arg.toBoolean();
            case ParamType.Object:
                return arg.toObject();
            case ParamType.Array:
                return arg.toObject();
            case ParamType.URL:
                return arg.toURL();
            default:
                return void 0;
        }
    }
}
