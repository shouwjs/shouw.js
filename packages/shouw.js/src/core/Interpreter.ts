import type { Channel, TopLevelComponent } from 'discord.js';
import type {
    FunctionResultData,
    CommandData,
    HelpersData,
    ExtraOptionsData,
    TemporarilyData,
    InterpreterOptions,
    Flags
} from '../typings';
import type { Functions } from './Functions';
import type { Context, FunctionsManager, ShouwClient as Client } from '../classes';

import { CheckCondition, IF, Time } from './';
import { ParamType } from '../typings';
import { filterObject, filterArray, sleep } from '../utils';
import * as Discord from 'discord.js';

export class Interpreter {
    public readonly client: Client;
    public readonly functions: FunctionsManager;
    public readonly debug: boolean | undefined;

    public start = performance.now();
    public interpreter = Interpreter;
    public code: string | ((ctx: Interpreter) => any);
    public command: CommandData;
    public channel?: Channel;
    public guild?: Discord.Guild;
    public member?: Discord.GuildMember;
    public user?: Discord.User;
    public context?: Context;
    public args?: string[];
    public embeds: Discord.EmbedBuilder[] = [];
    public attachments: Discord.AttachmentBuilder[] = [];
    public stickers: Discord.Sticker[] = [];
    public flags: number | string | bigint | undefined = void 0;
    public message: Discord.Message | undefined = void 0;
    public noop: () => void = () => {};
    public helpers: HelpersData;
    public Temporarily: TemporarilyData;
    public discord: typeof Discord = Discord;
    public readonly extras: ExtraOptionsData;
    public isError = false;
    public components: TopLevelComponent[] = [];

    constructor(cmd: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData) {
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context;
        this.args = options.args;
        this.helpers = {
            sleep: sleep,
            time: Time,
            condition: CheckCondition,
            interpreter: Interpreter,
            unescape: (str: string) => str.unescape(),
            escape: (str: string) => str.escape(),
            mustEscape: (str: string) => str.mustEscape()
        };
        this.Temporarily = (options.Temporarily ?? {
            arrays: {},
            variables: {},
            splits: [],
            randoms: {},
            timezone: void 0
        }) as TemporarilyData;
        this.extras = (extras ?? {
            sendMessage: true,
            returnId: false,
            returnResult: true,
            returnError: false,
            returnData: false
        }) as ExtraOptionsData;
    }

    public async initialize(): Promise<{
        id?: string;
        result?: undefined | string;
        error?: boolean;
        data?: object;
    }> {
        try {
            if (typeof this.code === 'function') {
                await this.code(this);
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
                                    message: `Missing required argument ${field.name} on function ${func}!`,
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
                                message: `Missing required argument ${field.name} on function ${func}!`,
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
                    const DATA =
                        filterObject(await functionData.code(this, processedArgs, this.Temporarily)) ??
                        ({} as FunctionResultData);
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

            return (
                filterObject({
                    result: this.code ?? '',
                    id: this.message?.id ?? void 0,
                    error: this.isError ?? false,
                    data: {
                        ...this.Temporarily,
                        embeds: this.embeds ?? [],
                        components: this.components ?? [],
                        attachments: this.attachments ?? [],
                        flags: this.flags ?? void 0
                    }
                }) ?? {}
            );
        } catch (err: any) {
            this.client.debug(`${err?.stack ?? err}`, 'ERROR', true);
            return {};
        }
    }

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
        if (openBracketIndex === -1) return { func, args: [], brackets: false, all: func };

        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return { func, args: [], brackets: false, all: func };

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

        if (closeBracketIndex >= code.length || bracketStack > 0) return { func, args: [], brackets: false, all: func };
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return { func, args: args, brackets: true, all };
    }

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

    private extractFunctions(code: string): Array<string> {
        const functions: string[] = [];
        const splited = code.split(/\$/g);

        for (const part of splited) {
            const matchingFunctions = this.functions.K.filter(
                (func) => func && func.toLowerCase() === `$${part.toLowerCase()}`.slice(0, func.length)
            );

            if (matchingFunctions.length === 1) {
                functions.push(matchingFunctions[0]);
            } else if (matchingFunctions.length > 1) {
                functions.push(matchingFunctions.sort((a, b) => b.length - a.length)[0]);
            }
        }

        return filterArray(functions) ?? [];
    }

    public success(result: any = void 0, error?: boolean, ...data: FunctionResultData[]): FunctionResultData {
        return { ...data, result, error };
    }

    public async error(options: string | { message: string; solution?: string }): Promise<FunctionResultData> {
        try {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            this.isError = true;
            this.message = await this.context?.send(
                `\`\`\`\n🚫 ${message}${solution ? `\n\nSo, what is the solution?\n${solution}` : ''}\`\`\``
            );
        } catch {
            this.isError = true;
            this.client.debug(typeof options === 'string' ? options : options.message, 'ERROR', true);
        }

        return { result: void 0, error: true };
    }

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
