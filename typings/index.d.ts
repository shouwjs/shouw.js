import * as Discord from 'discord.js';
import { Client, ClientOptions, ClientEvents, Channel, CategoryChannel, PartialGroupDMChannel, PartialDMChannel, ForumChannel, MediaChannel, User, GuildMember, Guild, Message, ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, ContextMenuCommandInteraction, MessagePayload, MessageReplyOptions, MessageCreateOptions, OmitPartialGroupDMChannel, InteractionReplyOptions, InteractionCallbackResponse, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ChannelType, MessageFlags, Role } from 'discord.js';

interface Objects {
    [key: string | symbol | number | `${any}`]: unknown;
}
declare class BaseClient extends Client {
    constructor({ token, intents, partials, ...options }: ShouwClientOptions);
}

interface ShouwClientOptions extends ClientOptions {
    token: undefined | string;
    events: Array<keyof ClientEvents>;
    prefix: string | string[];
    debug?: boolean;
    extensions?: any[];
}
declare class ShouwClient extends BaseClient {
    functions: FunctionsManager;
    commands: CommandsManager;
    database?: any;
    music?: any;
    readonly variablesManager: Variables;
    readonly prefix: Array<string>;
    readonly shouwOptions: ShouwClientOptions;
    constructor(options: ShouwClientOptions);
    command(data: CommandData): ShouwClient;
    loadCommands(dir: string, _logging?: boolean): ShouwClient;
    variables(variables: Record<string, any>, table?: any): ShouwClient;
    debug(message: string, type?: 'ERROR' | 'DEBUG' | 'WARN', force?: boolean): ShouwClient;
}

interface CommandData extends Objects {
    name?: string;
    aliases?: string | string[];
    channel?: string;
    code: string | ((ctx: Interpreter) => any);
    type?: string;
    prototype?: string;
    [key: string | number | symbol | `${any}`]: any;
}
type CommandsEventMap = {
    [K in keyof typeof EventsMap]?: Collective<number, CommandData>;
};
declare const EventsMap: Record<string, string>;
declare class CommandsManager implements CommandsEventMap {
    readonly client: ShouwClient;
    events?: string[];
    [key: string]: CommandsEventMap | any;
    interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };
    constructor(client: ShouwClient, events?: string[]);
    private loadEvents;
    private getEventPath;
}

declare class Collective<K, V> extends Map<K, V> {
    create(key: K, value: V): Collective<K, V>;
    filter(fn: (value: V, index: number, array: V[]) => V[]): V[];
    filterKeys(fn: (value: K, index: number, array: K[]) => K[]): K[];
    find(fn: (value: V, index: number, array: V[]) => V | undefined): V | undefined;
    findKey(fn: (value: K, index: number, array: K[]) => K | undefined): K | undefined;
    some(fn: (value: V, index: number, array: V[]) => boolean): boolean;
    someKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean;
    every(fn: (value: V, index: number, array: V[]) => boolean): boolean;
    everyKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean;
    has(key: K): boolean;
    get K(): Array<K>;
    get V(): Array<V>;
}

interface FunctionData extends Objects {
    name: string;
    description?: string;
    brackets?: boolean;
    type?: 'shouw.js' | 'discord.js' | 'djs';
    params?: {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[];
    code?: string | ((ctx: Interpreter) => any);
}
declare class FunctionsManager extends Collective<string, Functions> {
    readonly client: ShouwClient;
    constructor(client: ShouwClient);
    load(basePath: string, debug: boolean): Promise<undefined>;
    new(data: FunctionData): FunctionsManager;
}

declare class Variables {
    readonly client: ShouwClient;
    readonly cache: Collective<string, {
        name: string;
        value: any;
        table: string;
    }>;
    readonly database: any;
    readonly tables: string[];
    constructor(client: ShouwClient);
    set(name: string, value: any, table?: string): Variables;
    get(name: string, table?: string): {
        name: string;
        value: any;
        table: string;
    } | undefined;
    delete(name: string, table?: string): Variables;
    clear(): Variables;
}

interface InterpreterOptions {
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
}
interface TemporarilyData {
    arrays: Objects;
    variables: Objects;
    splits: Array<string>;
    randoms: Objects;
    timezone: string | undefined;
}
interface HelpersData {
    parser: (ctx: Interpreter, input: string) => Promise<SendData>;
    sleep: (ms: number) => Promise<void>;
    time: typeof Time;
    condition: (input: string) => boolean;
    interpreter: typeof Interpreter;
    unescape: (str: string) => string;
    escape: (str: string) => string;
    mustEscape: (str: string) => string;
}
interface ExtraOptionsData {
    sendMessage?: boolean;
    returnId?: boolean;
    returnResult?: boolean;
    returnError?: boolean;
    returnData?: boolean;
}
declare class Interpreter {
    readonly client: ShouwClient;
    readonly functions: FunctionsManager;
    readonly debug: boolean | undefined;
    start: number;
    interpreter: typeof Interpreter;
    code: string | ((ctx: Interpreter) => any);
    command: CommandData;
    channel?: Discord.Channel;
    guild?: Discord.Guild;
    member?: Discord.GuildMember;
    user?: Discord.User;
    context?: Context;
    args?: string[];
    embeds: Discord.EmbedBuilder[];
    attachments: Discord.AttachmentBuilder[];
    stickers: Discord.Sticker[];
    flags: Array<number | string | bigint>;
    message: Discord.Message | undefined;
    interaction: Interaction | undefined;
    noop: () => void;
    helpers: HelpersData;
    Temporarily: TemporarilyData;
    readonly discord: typeof Discord;
    readonly util: typeof Util;
    readonly extras: ExtraOptionsData;
    isError: boolean;
    components: Discord.TopLevelComponent[];
    constructor(cmd: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData);
    initialize(): Promise<{
        id?: string;
        result?: undefined | string;
        error?: boolean;
        data?: object;
    }>;
    private unpack;
    private extractArguments;
    private extractFunctions;
    success(result?: any, error?: boolean, ...data: FunctionResultData[]): FunctionResultData;
    error(options: string | {
        message: string;
        solution?: string;
    }, functionName?: string): Promise<FunctionResultData>;
    private switchArg;
}

type Interaction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction | ContextMenuCommandInteraction;
type InteractionWithMessage = Interaction | Message;
type SendData = string | MessagePayload | MessageReplyOptions | MessageCreateOptions;
type MessageReplyData = string | MessagePayload | MessageReplyOptions;
type InteractionReplyData = string | (InteractionReplyOptions & {
    fetchReply?: boolean;
    withResponse?: boolean;
});
type SendableChannel = Exclude<Channel, CategoryChannel | PartialGroupDMChannel | PartialDMChannel | ForumChannel | MediaChannel> | null;
declare class Context {
    args?: Array<string>;
    channel?: SendableChannel;
    user?: User | null;
    member?: GuildMember | null;
    guild?: Guild | null;
    message?: Message | null;
    interaction?: Interaction | null;
    constructor(ctx: InteractionWithMessage, args?: Array<string>);
    private get isInteraction();
    send(data: SendData): Promise<Message<boolean> | undefined>;
    reply(data: MessageReplyData): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;
    reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;
}

interface FunctionResultData extends Omit<InterpreterOptions, 'client'> {
    result: string | unknown;
    error?: boolean;
    embeds?: EmbedBuilder[];
    attachments?: AttachmentBuilder[];
    components?: ActionRowBuilder[];
    flags?: number | string | bigint;
    message?: Message;
}
declare enum ParamType {
    URL = 0,
    String = 1,
    BigInt = 2,
    Void = 3,
    Number = 4,
    Object = 5,
    Array = 6,
    Boolean = 8
}
declare class Functions {
    #private;
    constructor(data: FunctionData);
    code(_ctx: Interpreter, _args: Array<any>, _data: TemporarilyData): Promise<FunctionResultData> | FunctionResultData;
    get name(): string | undefined;
    get brackets(): boolean | undefined;
    get description(): string | undefined;
    get type(): string | undefined;
    get params(): {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[] | undefined;
    get paramsLength(): number;
    get withParams(): string;
    getParams(index: number): {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    } | undefined;
    success(result?: any, error?: boolean, ...data: FunctionResultData[]): FunctionResultData;
    error(...data: FunctionResultData[]): FunctionResultData;
}

declare function CheckCondition(input: string): boolean;

declare function IF(code: string, oldCode: string, ctx: Interpreter): Promise<{
    error: boolean;
    code: string;
    oldCode: string;
}>;

declare class Time {
    private static units;
    static format(_time: number, useLongName?: boolean): string;
    static parse(time: string | number): {
        ms: number;
        format: string;
    };
    static parseDigital(time: string): {
        ms: number;
        format: string;
    };
    static digital(time: number): string;
    private static pluralize;
}

declare class Reader {
    private readonly filePath;
    private fileContent;
    constructor(filePath: string);
    private readFile;
    removeComments(code?: string): string;
    private parse;
    execute(): CommandData[];
}

type Flags = Discord.BitFieldResolvable<'SuppressEmbeds' | 'SuppressNotifications' | 'IsComponentsV2', Discord.MessageFlags.SuppressEmbeds | Discord.MessageFlags.SuppressNotifications | Discord.MessageFlags.IsComponentsV2> | undefined;
type SelectMenuTypes = Discord.StringSelectMenuBuilder | Discord.RoleSelectMenuBuilder | Discord.ChannelSelectMenuBuilder | Discord.MentionableSelectMenuBuilder | Discord.UserSelectMenuBuilder;
type ComponentTypes = Discord.ActionRowBuilder | Discord.APIContainerComponent | Discord.APITextDisplayComponent | Discord.APISectionComponent | Discord.APIMediaGalleryComponent | Discord.APISeparatorComponent | undefined;
declare function Parser(ctx: Interpreter, input: string): Promise<SendData>;
declare function EmbedParser(_ctx: Interpreter, content: string): Discord.EmbedBuilder;
declare function ActionRowParser(ctx: Interpreter, content: string): Promise<Discord.ActionRowBuilder | null>;
declare function AttachmentParser(_ctx: Interpreter, rawContent: string, type?: 'attachment' | 'file'): Discord.AttachmentBuilder | null;
declare function FlagsParser(ctx: Interpreter, rawContent: string, type?: 'flags' | 'flag'): Array<Discord.MessageFlags | null>;
declare function PollParser(ctx: Interpreter, rawContent: string): Promise<Discord.PollData | null>;
declare function ComponentsV2Parser(ctx: Interpreter, content: string): Promise<Discord.APIContainerComponent>;
declare function parseSeparatorV2(_ctx: Interpreter, content: string): Discord.APISeparatorComponent;
declare function parseSectionV2(ctx: Interpreter, content: string): Promise<Discord.APISectionComponent>;
declare function parseGalleryV2(_ctx: Interpreter, rawContent: string): Discord.APIMediaGalleryComponent;
declare function parseButton(ctx: Interpreter, content: string): Promise<Discord.ButtonBuilder | undefined>;

declare global {
    interface String {
        unescape(): string;
        escape(): string;
        mustEscape(): string;
        toObject(): object;
        toURL(): string | undefined;
        toBoolean(): boolean;
    }
}

declare function sleep(ms: number): Promise<void>;
declare function wait(ms: number): Promise<void>;
declare function filterObject<T extends object>(object: T): T | undefined;
declare function filterArray<T>(arr: T[]): T[] | undefined;

declare class Constants {
    static InteractionType: Record<number, string>;
    static ComponentType: Record<number, string>;
    static SlashType: Record<string, number>;
    static ContextType: Record<string, number>;
    static IntegrationType: Record<string, number>;
    static ChannelType: Record<string | ChannelType, ChannelType | string>;
    static Flags: Record<string | MessageFlags, MessageFlags | string>;
}

declare class Util extends Constants {
    static getChannel(ctx: Interpreter, channelInput: string): Promise<Channel | undefined>;
    static getGuild(ctx: Interpreter, guildInput: string): Promise<Guild | undefined>;
    static getMember(ctx: Interpreter, guildInput: string, memberInput: string): Promise<GuildMember | undefined>;
    static getRole(ctx: Interpreter, guildInput: string, roleInput: string): Promise<Role | undefined>;
    static getUser(ctx: Interpreter, userInput: string): Promise<User | undefined>;
    static getMessage(ctx: Interpreter, channelInput: string, messageInput: string): Promise<Message | undefined>;
    static isUnicodeEmoji(str: string): boolean;
    static getEmoji(ctx: Interpreter, _emojiInput: string, onlyId?: boolean): Promise<any>;
}

export { ActionRowParser, AttachmentParser, BaseClient, CheckCondition, Collective, type CommandData, type CommandsEventMap, CommandsManager, type ComponentTypes, ComponentsV2Parser, Constants, Context, EmbedParser, type ExtraOptionsData, type Flags, FlagsParser, type FunctionData, type FunctionResultData, Functions, FunctionsManager, type HelpersData, IF, type Interaction, type InteractionReplyData, type InteractionWithMessage, Interpreter, type InterpreterOptions, type MessageReplyData, type Objects, ParamType, Parser, PollParser, Reader, type SelectMenuTypes, type SendData, type SendableChannel, ShouwClient, type ShouwClientOptions, type TemporarilyData, Time, Util, Variables, filterArray, filterObject, parseButton, parseGalleryV2, parseSectionV2, parseSeparatorV2, sleep, wait };
