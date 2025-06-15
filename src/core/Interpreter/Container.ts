import {
    Context,
    Util,
    Constants,
    sleep,
    Time,
    CheckCondition,
    Interpreter,
    Parser,
    type Objects,
    type SendableChannel,
    type SendData,
    type Interaction,
    type InteractionWithMessage,
    type ShouwClient,
    type CommandData,
    type FunctionsManager
} from '../../index.js';
import * as Discord from 'discord.js';

export interface InterpreterOptions {
    client: ShouwClient;
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
    suppressErrors?: {
        suppress: boolean;
        message: SendData | undefined;
    };
}

export interface TemporarilyData extends Objects {
    arrays: Objects;
    objects: Objects;
    variables: Objects;
    constants: Objects;
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

export interface InterpreterResult {
    id?: string;
    result?: undefined | string;
    error?: boolean;
    data?: Objects;
}

/**
 * Container class to store all the data of the interpreter
 *
 * @class Container
 * @param {CommandData} cmd - The command data
 * @param {InterpreterOptions} options - The interpreter options
 * @param {ExtraOptionsData} [extras] - The extra options
 * @example const container = new Container(cmd, options, extras);
 */
export class Container {
    /**
     * The client instance
     */
    public readonly client: ShouwClient;

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
    public readonly start = performance.now();

    /**
     * The interpreter class
     */
    public readonly interpreter = Interpreter;

    /**
     * The code to execute
     */
    public code: string | ((ctx: Interpreter, context: Context, data: TemporarilyData) => any);

    /**
     * The command data
     */
    public readonly command: CommandData;

    /**
     * The channel the command was sent in
     */
    public readonly channel?: Discord.Channel;

    /**
     * The channel to use for sending messages
     */
    public useChannel?: SendableChannel;

    /**
     * The guild the command was sent in
     */
    public readonly guild?: Discord.Guild;

    /**
     * The member who sent the command
     */
    public readonly member?: Discord.GuildMember;

    /**
     * The user who sent the command
     */
    public readonly user?: Discord.User;

    /**
     * The context of the command
     */
    public readonly context: Context;

    /**
     * The arguments of the command
     */
    public readonly args?: string[];

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
    public readonly noop: () => void = () => {};

    /**
     * The helpers data
     */
    public readonly helpers: HelpersData;

    /**
     * The temporarily data
     */
    public readonly Temporarily: TemporarilyData;

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
    public components: any[] = [];

    /**
     * Whether to suppress errors and not send them to the channel the command was sent in
     */
    public readonly suppressErrors: {
        suppress: boolean;
        message: SendData | undefined;
    };

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
        this.suppressErrors = {
            suppress: options.suppressErrors?.suppress ?? false,
            message: options.suppressErrors?.message ?? void 0
        };

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
            objects: {},
            variables: {},
            constants: {},
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
     * Functions to manage objects
     */
    public setObject(name: string, value: Objects) {
        this.Temporarily.objects[name] = value;
        return this;
    }

    public getObject(name: string) {
        return this.Temporarily.objects[name];
    }

    public getObjectProperty(name: string, property: string) {
        const obj = this.Temporarily.objects[name];
        if (!obj || this.isArray(name)) return void 0;
        return new Function('obj', `return obj.${property}`)(obj);
    }

    public getObjectArrayIndex(name: string, index: number) {
        const obj = this.Temporarily.objects[name];
        if (!obj || !this.isArray(name)) return void 0;
        return obj[index];
    }

    public setObjectProperty(name: string, property: string, value: any) {
        const obj = this.Temporarily.objects[name];
        if (!obj || this.isArray(name)) return this;
        this.setObject(name, new Function('obj', 'value', `obj.${property} = value; return obj;`)(obj, value));
        return this;
    }

    public isArray(name: string) {
        const obj = this.Temporarily.objects[name];
        if (!obj || !Array.isArray(obj)) return false;
        return true;
    }

    public hasObject(name: string) {
        return Object.hasOwn(this.Temporarily.objects, name);
    }

    public deleteObject(name: string) {
        if (this.hasObject(name)) delete this.Temporarily.objects[name];
    }

    /**
     * Functions to manage arrays
     */
    public setArray(name: string, value: any[]) {
        this.Temporarily.arrays[name] = value;
        return this;
    }

    public getArray(name: string) {
        return this.Temporarily.arrays[name];
    }

    public getArrayIndex(name: string, index: number) {
        const arr = this.Temporarily.arrays[name];
        if (!arr || !Array.isArray(arr) || !arr.length) return void 0;
        return arr[index];
    }

    public hasArray(name: string) {
        return Object.hasOwn(this.Temporarily.arrays, name);
    }

    public deleteArray(name: string) {
        if (this.hasArray(name)) delete this.Temporarily.arrays[name];
        return this;
    }

    /**
     * Functions to manage strickers
     */
    public setStickers(stickers: Discord.Sticker[]) {
        this.stickers = stickers;
        return this;
    }

    public pushSticker(sticker: Discord.Sticker) {
        this.stickers.push(sticker);
        return this;
    }

    public getStickers() {
        return this.stickers;
    }

    /**
     * Functions to manage errors
     */
    public setError(error: boolean) {
        this.isError = error;
        return this;
    }

    public getError() {
        return this.isError;
    }

    /**
     * Functions to manage components
     */
    public setComponents(components: any[]) {
        this.components = components;
        return this;
    }

    public pushComponent(component: any, index?: number) {
        if (index !== null && index !== void 0) {
            this.components[index] = component;
            return this;
        }

        this.components.push(component);
        return this;
    }

    public getComponent(index?: number) {
        return index === null || index === void 0 ? this.components[0] : this.components[index];
    }

    public getComponents() {
        return this.components;
    }

    /**
     * Functions to manage flags
     */
    public setFlags(flags: Array<number | string | bigint>) {
        this.flags = flags;
        return this;
    }

    public pushFlag(flag: number | string | bigint) {
        this.flags.push(flag);
        return this;
    }

    public getFlags() {
        return this.flags;
    }

    /**
     * Functions to manage attachments
     */
    public setAttachments(attachments: Discord.AttachmentBuilder[]) {
        this.attachments = attachments;
        return this;
    }

    public pushAttachment(attachment: Discord.AttachmentBuilder, index?: number) {
        if (index !== null && index !== void 0) {
            this.attachments[index] = attachment;
            return this;
        }

        this.attachments.push(attachment);
        return this;
    }

    public getAttachment(index?: number) {
        return index === null || index === void 0 ? this.attachments[0] : this.attachments[index];
    }

    public getAttachments() {
        return this.attachments;
    }

    /**
     * Functions to manage embeds
     */
    public setEmbeds(embeds: Discord.EmbedBuilder[]) {
        this.embeds = embeds;
        return this;
    }

    public pushEmbed(embed: Discord.EmbedBuilder, index?: number) {
        if (index !== null && index !== void 0) {
            this.embeds[index] = embed;
            return this;
        }

        this.embeds.push(embed);
        return this;
    }

    public getEmbed(index?: number) {
        return index === null || index === void 0 ? this.embeds[0] : this.embeds[index];
    }

    public getEmbeds() {
        return this.embeds;
    }

    /**
     * Functions to manage suppress errors
     */
    public setSuppress(suppress: boolean, message?: SendData) {
        this.setSuppressSuppress(suppress);
        if (message) this.setSuppressMessage(message);
        return this;
    }

    public setSuppressMessage(message: SendData) {
        this.suppressErrors.message = message;
        return this;
    }

    public setSuppressSuppress(suppress: boolean) {
        this.suppressErrors.suppress = suppress;
        return this;
    }

    public getSuppress() {
        return this.suppressErrors;
    }

    /**
     * Functions to manage the channel to use for sending messages
     */
    public setUseChannel(channel: SendableChannel): Container {
        this.useChannel = channel;
        return this;
    }

    public getUseChannel(): SendableChannel | undefined {
        return this.useChannel ?? (this.channel as SendableChannel);
    }

    public getSendableChannel(): SendableChannel | Context | undefined {
        return this.useChannel ?? this.context;
    }

    /**
     * Functions to manage variables
     */
    public setVariable(name: string, value: any) {
        this.Temporarily.variables[name] = value;
        return this;
    }

    public getVariable(name: string) {
        return this.Temporarily.variables[name];
    }

    public hasVariable(name: string) {
        return Object.hasOwn(this.Temporarily.variables, name);
    }

    public deleteVariable(name: string) {
        if (this.hasVariable(name)) delete this.Temporarily.variables[name];
        if (this.hasConstantVariable(name)) delete this.Temporarily.constants[name];
        return this;
    }

    /**
     * Functions to manage constants variables
     */
    public setConstantVariable(name: string, value: any) {
        this.Temporarily.constants[name] = value;
        return this;
    }

    public getConstantVariable(name: string) {
        return this.Temporarily.constants[name];
    }

    public hasConstantVariable(name: string) {
        return Object.hasOwn(this.Temporarily.constants, name);
    }

    /**
     * Functions to manage splits
     */
    public setSplits(split: any[]) {
        this.Temporarily.splits = split;
        return this;
    }

    public getSplit(index?: number) {
        return !index || Number.isNaN(index) ? this.Temporarily.splits[0] : this.Temporarily.splits[index];
    }

    public getSplits() {
        return this.Temporarily.splits;
    }

    /**
     * Functions to manage randoms
     */
    public setRandom(name: string, value: any) {
        this.Temporarily.randoms[name] = value;
        return this;
    }

    public getRandom(name: string) {
        return this.Temporarily.randoms[name];
    }

    /**
     * Functions to manage timezone
     */
    public setTimezone(timezone: string) {
        this.Temporarily.timezone = timezone;
        return this;
    }

    public getTimezone() {
        return this.Temporarily.timezone;
    }

    /**
     * Functions to manage cache
     */
    public createCache(name: string) {
        return this.client.cacheManager.createCache(name);
    }

    public getCache(name: string) {
        return this.client.cacheManager.getCache(name);
    }

    public hasCache(name: string) {
        return this.client.cacheManager.hasCache(name);
    }

    public deleteCache(name: string) {
        return this.client.cacheManager.deleteCache(name);
    }

    public getCacheData(name: string, key: any) {
        return this.client.cacheManager.get(name, key);
    }

    public setCacheData(name: string, key: any, value: any) {
        return this.client.cacheManager.set(name, key, value);
    }

    public deleteCacheData(name: string, key: any) {
        return this.client.cacheManager.delete(name, key);
    }

    public clearCache(name: string) {
        return this.client.cacheManager.clear(name);
    }

    public hasCacheData(name: string, key: any) {
        return this.client.cacheManager.has(name, key);
    }

    public getCacheSize(name: string) {
        return this.client.cacheManager.size(name);
    }

    /**
     * Helpers functions
     */
    public async parser(ctx: Interpreter, input: string) {
        return await Parser(ctx, input);
    }

    public async sleep(ms: number) {
        await sleep(ms);
    }

    public get time() {
        return Time;
    }

    public condition(input: string) {
        return CheckCondition(input);
    }

    public unescape(str: string) {
        return str.unescape();
    }

    public escape(str: string) {
        return str.escape();
    }

    public mustEscape(str: string) {
        return str.mustEscape();
    }

    public get constants() {
        return Constants;
    }
}
