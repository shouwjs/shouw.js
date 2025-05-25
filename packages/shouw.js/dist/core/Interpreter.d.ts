import type { Channel, TopLevelComponent } from 'discord.js';
import type { FunctionResultData, CommandData, HelpersData, ExtraOptionsData, TemporarilyData, InterpreterOptions } from '../typings';
import type { Context, FunctionsManager, ShouwClient as Client } from '../classes';
import * as Discord from 'discord.js';
export declare class Interpreter {
    readonly client: Client;
    readonly functions: FunctionsManager;
    readonly debug: boolean | undefined;
    start: number;
    interpreter: typeof Interpreter;
    code: string | ((ctx: Interpreter) => any);
    command: CommandData;
    channel?: Channel;
    guild?: Discord.Guild;
    member?: Discord.GuildMember;
    user?: Discord.User;
    context?: Context;
    args?: string[];
    embeds: Discord.EmbedBuilder[];
    attachments: Discord.AttachmentBuilder[];
    stickers: Discord.Sticker[];
    flags: number | string | bigint | undefined;
    message: Discord.Message | undefined;
    noop: () => void;
    helpers: HelpersData;
    Temporarily: TemporarilyData;
    discord: typeof Discord;
    readonly extras: ExtraOptionsData;
    isError: boolean;
    components: TopLevelComponent[];
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
    }): Promise<FunctionResultData>;
    private switchArg;
}
