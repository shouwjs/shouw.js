import type { Message } from 'discord.js';
import { type ShouwClient, Interpreter, type CommandData } from '../../index.js';

/**
 * Message Create Event
 *
 * @param {Message} message
 * @param {ShouwClient} client
 * @return {Promise<void>}
 */
export default async function Events(message: Message, client: ShouwClient): Promise<void> {
    if (message.author.bot && !client.shouwOptions.respondToBots) return;
    if (!message.inGuild() && client.shouwOptions.guildOnly) return;
    const commands = client.commands?.messageCreate?.V;
    if (!commands || !commands.length) return;
    AlwaysExecute(message, client, commands);

    /**
     * Prefixes
     * @type {(string | undefined)[]}
     */
    const prefixes: (string | undefined)[] = await Promise.all(
        client.prefix.map(async (prefix: string | undefined) => {
            if (!prefix) return void 0;
            if (!prefix.match(/\$/g) || prefix === '$') return prefix;
            return await INIT({ code: prefix }, message, message.content?.split(/ +/g) ?? [], client);
        })
    );

    /**
     * Run the commands
     * @type {Promise<void>[]}
     */
    for (const prefix of prefixes.filter((p) => p && p !== '')) {
        if (!prefix) continue;
        if (!message.content || !message.content.startsWith(prefix)) continue;
        const args = message.content?.slice(prefix.length).split(/ +/g) ?? [];
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) continue;
        const command = commands.find(
            (cmd: CommandData) => cmd.name === commandName || cmd.aliases?.includes(commandName)
        );
        if (!command || !command.code) break;

        await INIT(command, message, args, client);
        break;
    }
}

/**
 * Always Execute Command
 *
 * @param {Message} message - The message
 * @param {ShouwClient} client - The client
 * @param {CommandData[]} commands - The commands to execute
 * @return {Promise<void>}
 */
async function AlwaysExecute(message: Message<boolean>, client: ShouwClient, commands: CommandData[]): Promise<void> {
    const alwaysExecute: CommandData[] = commands.filter((v: CommandData) =>
        !Array.isArray(v.name) ? v.name?.toLowerCase() === '$alwaysexecute' : false
    );

    if (Array.isArray(alwaysExecute) && alwaysExecute.length > 0) {
        for (const command of alwaysExecute) {
            if (!command || !command.code) break;
            await INIT(command, message, message.content?.split(/ +/g) ?? [], client);
        }
    }
}

/**
 * Initialize the command
 *
 * @param {CommandData} command
 * @param {Message} message
 * @param {string[]} args
 * @param {ShouwClient} client
 * @return {Promise<string | undefined>}
 */
async function INIT(
    command: CommandData,
    message: Message,
    args: string[],
    client: ShouwClient
): Promise<string | undefined> {
    return (
        (
            await Interpreter.run(command, {
                client: client,
                channel: message.channel,
                args: args,
                message: message,
                guild: message.guild ?? void 0,
                user: message.author,
                member: message.member ?? void 0
            })
        ).result ?? void 0
    );
}
