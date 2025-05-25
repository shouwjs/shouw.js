import type * as Discord from 'discord.js';
import type * as DiscordType from 'discord.js';
import type { Context, ShouwClient } from '../classes';
import type { CheckCondition, Interpreter, Time } from '../core';
import type { ParamType } from './enums';
import type { sleep } from '../utils';
interface Objects {
    [key: string | symbol | number | `${any}`]: unknown;
}
export interface InterpreterOptions {
    client: ShouwClient;
    guild?: Discord.Guild;
    channel?: DiscordType.Channel;
    member?: Discord.GuildMember;
    user?: Discord.User;
    context?: Context;
    args?: string[];
    debug?: boolean;
    Temporarily?: TemporarilyData;
}
export interface FunctionData extends Objects {
    name: string;
    description?: string;
    brackets?: boolean;
    type?: string;
    params?: {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[];
}
export interface CommandData extends Objects {
    name?: string;
    aliases?: string | string[];
    channel?: string;
    code: string | ((ctx: Interpreter) => any);
    type: string;
    prototype?: string;
    [key: string | number | symbol]: any;
}
export interface FunctionResultData extends Omit<InterpreterOptions, 'client'> {
    result: string | unknown;
    error?: boolean;
    embeds?: Discord.EmbedBuilder[];
    attachments?: Discord.AttachmentBuilder[];
    components?: Discord.ActionRowBuilder[];
    flags?: number | string | bigint;
    message?: Discord.Message;
}
export interface TemporarilyData {
    arrays: Objects;
    variables: Objects;
    splits: Array<string>;
    randoms: Objects;
    timezone: string | undefined;
}
export interface HelpersData {
    sleep: typeof sleep;
    time: typeof Time;
    condition: typeof CheckCondition;
    interpreter: typeof Interpreter;
    unescape: (str: string) => string;
    escape: (str: string) => string;
    mustEscape: (str: string) => string;
}
export interface ShouwClientOptions extends DiscordType.ClientOptions {
    token: undefined | string;
    events: Array<keyof DiscordType.ClientEvents>;
    prefix: string | string[];
    debug?: boolean;
}
export interface ExtraOptionsData {
    sendMessage?: boolean;
    returnId?: boolean;
    returnResult?: boolean;
    returnError?: boolean;
    returnData?: boolean;
}
export {};
