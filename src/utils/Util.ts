import type { Interpreter } from '../index.js';
import { Constants } from './Constants.js';
import type { Emoji, Channel, Guild, Role, User, GuildMember, Message } from 'discord.js';

/**
 * Util class that contains all the utility functions used in the bot
 *
 * @class Util
 */
export class Util extends Constants {
    /**
     * Get channel data from channel id or name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} channelInput - The channel id or name
     * @return {Promise<Channel | undefined>} - The channel data or undefined if not found
     */
    public static async getChannel(ctx: Interpreter, channelInput: string): Promise<Channel | undefined> {
        if (!channelInput) return;
        let foundChannel: Channel | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { channelInput }) => {
                    const channel = client.channels.cache.find(
                        (c: any) => c.name?.toLowerCase() === channelInput.toLowerCase() || c.id === channelInput
                    );
                    return channel ?? null;
                },
                { context: { channelInput } }
            );
            foundChannel = results.find((c) => c) as Channel;
        } else {
            foundChannel = ctx.client.channels.cache.find(
                (c: any) => c.name?.toLowerCase() === channelInput.toLowerCase() || c.id === channelInput
            );
        }

        if (foundChannel) return Array.isArray(foundChannel) ? foundChannel[0] : foundChannel;
        return (await ctx.client.channels.fetch(channelInput, { force: true }).catch(() => void 0)) ?? void 0;
    }

    /**
     * Get guild data from guild id or name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} guildInput - The guild id or name
     * @return {Promise<Guild | undefined>} - The guild data or undefined if not found
     */
    public static async getGuild(ctx: Interpreter, guildInput: string): Promise<Guild | undefined> {
        if (!guildInput) return;
        let foundGuild: Guild | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { guildInput }) => {
                    const guild = client.guilds.cache.find(
                        (g: Guild) => g.name?.toLowerCase() === guildInput.toLowerCase() || g.id === guildInput
                    );
                    return guild ?? null;
                },
                { context: { guildInput } }
            );
            foundGuild = results.find((g) => g) as Guild;
        } else {
            foundGuild = ctx.client.guilds.cache.find(
                (g: Guild) => g.name?.toLowerCase() === guildInput.toLowerCase() || g.id === guildInput
            );
        }

        if (foundGuild) return Array.isArray(foundGuild) ? foundGuild[0] : foundGuild;
        return (await ctx.client.guilds.fetch(guildInput).catch(() => void 0)) ?? void 0;
    }

    /**
     * Get member data from guild id or name and member id, username or display name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} guildInput - The guild id or name
     * @param {string} memberInput - The member id, username or display name
     * @return {Promise<GuildMember | undefined>} - The member data or undefined if not found
     */
    public static async getMember(
        ctx: Interpreter,
        guildInput: string,
        memberInput: string
    ): Promise<GuildMember | undefined> {
        if (!guildInput || !memberInput) return;
        const guild = await Util.getGuild(ctx, guildInput);
        if (!guild) return;
        let foundMember: GuildMember | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { guildId, memberInput }) => {
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) return null;
                    const member = guild.members.cache.find(
                        (m: GuildMember) =>
                            m.user.username?.toLowerCase() === memberInput.toLowerCase() ||
                            m.user.id === memberInput ||
                            m.user.displayName?.toLowerCase() === memberInput.toLowerCase() ||
                            m.nickname?.toLowerCase() === memberInput.toLowerCase()
                    );
                    return member ?? null;
                },
                { context: { guildId: guild.id, memberInput } }
            );
            foundMember = results.find((m) => m) as GuildMember;
        } else {
            foundMember = guild.members.cache.find(
                (m: GuildMember) =>
                    m.user.username?.toLowerCase() === memberInput.toLowerCase() ||
                    m.user.id === memberInput ||
                    m.user.displayName?.toLowerCase() === memberInput.toLowerCase() ||
                    m.nickname?.toLowerCase() === memberInput.toLowerCase()
            );
        }

        if (foundMember) return Array.isArray(foundMember) ? foundMember[0] : foundMember;
        return (await guild.members.fetch(memberInput).catch(() => void 0)) ?? void 0;
    }

    /**
     * Get role data from guild id or name and role id or name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} guildInput - The guild id or name
     * @param {string} roleInput - The role id or name
     * @return {Promise<Role | undefined>} - The role data or undefined if not found
     */
    public static async getRole(ctx: Interpreter, guildInput: string, roleInput: string): Promise<Role | undefined> {
        if (!guildInput || !roleInput) return;
        const guild = await Util.getGuild(ctx, guildInput);
        if (!guild) return;
        let foundRole: Role | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { guildId, roleInput }) => {
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) return null;
                    const role = guild.roles.cache.find(
                        (r: Role) => r.name?.toLowerCase() === roleInput.toLowerCase() || r.id === roleInput
                    );
                    return role ?? null;
                },
                { context: { guildId: guild.id, roleInput } }
            );
            foundRole = results.find((r) => r) as Role;
        } else {
            foundRole = guild.roles.cache.find(
                (r: Role) => r.name?.toLowerCase() === roleInput.toLowerCase() || r.id === roleInput
            );
        }

        if (foundRole) return Array.isArray(foundRole) ? foundRole[0] : foundRole;
        return (await guild.roles.fetch(roleInput, { force: true }).catch(() => void 0)) ?? void 0;
    }

    /**
     * Get user data from user id or username or display name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} userInput - The user id or username or display name
     * @return {Promise<User | undefined>} - The user data or undefined if not found
     */
    public static async getUser(ctx: Interpreter, userInput: string): Promise<User | undefined> {
        if (!userInput) return;
        let foundUser: User | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { userInput }) => {
                    const user = client.users.cache.find(
                        (u: User) =>
                            u.username?.toLowerCase() === userInput.toLowerCase() ||
                            u.id === userInput ||
                            u.displayName?.toLowerCase() === userInput.toLowerCase()
                    );
                    return user ?? null;
                },
                { context: { userInput } }
            );
            foundUser = results.find((u) => u) as User;
        } else {
            foundUser = ctx.client.users.cache.find(
                (u: User) =>
                    u.username?.toLowerCase() === userInput.toLowerCase() ||
                    u.id === userInput ||
                    u.displayName?.toLowerCase() === userInput.toLowerCase()
            );
        }

        if (foundUser) return Array.isArray(foundUser) ? foundUser[0] : foundUser;
        return (await ctx.client.users.fetch(userInput, { force: true }).catch(() => void 0)) ?? void 0;
    }

    /**
     * Get message data from channel id or name and message id
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} channelInput - The channel id or name
     * @param {string} messageInput - The message id
     * @return {Promise<Message | undefined>} - The message data or undefined if not found
     */
    public static async getMessage(
        ctx: Interpreter,
        channelInput: string,
        messageInput: string
    ): Promise<Message | undefined> {
        if (!channelInput || !messageInput) return;
        const channel = await Util.getChannel(ctx, channelInput);
        if (!channel) return;
        let foundMessage: Message | undefined;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { channelId, messageInput }) => {
                    const channel = client.channels.cache.get(channelId) as any;
                    if (!channel) return null;
                    const message = channel.messages?.cache.get(messageInput);
                    return message ?? null;
                },
                { context: { channelId: channel.id, messageInput } }
            );
            foundMessage = results.find((m) => m) as Message;
        } else {
            foundMessage = (channel as any).messages?.cache.get(messageInput);
        }

        if (foundMessage) return Array.isArray(foundMessage) ? foundMessage[0] : foundMessage;
        return (await (channel as any).messages?.fetch(messageInput).catch(() => void 0)) ?? void 0;
    }

    /**
     * Check if string is unicode emoji
     *
     * @param {string} str - The string to check
     * @return {boolean} - True if string is unicode emoji, false otherwise
     */
    public static isUnicodeEmoji(str: string): boolean {
        const emojiRegex =
            /(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?))*)|\d\uFE0F\u20E3/gu;
        return emojiRegex.test(str);
    }

    /**
     * Get emoji data from emoji id or name
     *
     * @param {Interpreter} ctx - The interpreter context
     * @param {string} _emojiInput - The emoji id or name
     * @return {Promise<APIMessageComponentEmoji | undefined>} - The emoji data or undefined if not found
     */
    public static async getEmoji(
        ctx: Interpreter,
        _emojiInput: string
    ): Promise<
        | Emoji
        | {
              id: string | undefined;
              name: string | null;
              animated: boolean;
          }
        | undefined
    > {
        let emojiInput = _emojiInput?.unescape().trim();
        if (!emojiInput) return;

        if (Util.isUnicodeEmoji(emojiInput) || (emojiInput.startsWith(':') && emojiInput.endsWith(':'))) {
            return {
                id: void 0,
                name: emojiInput.trim(),
                animated: false
            };
        }

        if (emojiInput.includes(':')) emojiInput = emojiInput.split(':')[2]?.split('>')[0];
        let foundEmoji: any;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { emojiInput }) => {
                    const emoji = client.emojis.cache.find(
                        (e) =>
                            e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                            e.id === emojiInput ||
                            e.toString() === emojiInput
                    );
                    return emoji ?? void 0;
                },
                { context: { emojiInput } }
            );
            foundEmoji = results.find((e) => e);
        } else {
            const emoji = ctx.client.emojis.cache.find(
                (e) =>
                    e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                    e.id === emojiInput ||
                    e.toString() === emojiInput
            );
            foundEmoji = emoji ?? void 0;
        }

        if (foundEmoji) return Array.isArray(foundEmoji) ? foundEmoji[0] : foundEmoji;
        if (ctx.client.application?.emojis) {
            if (!ctx.client.application.emojis.cache.size) {
                await ctx.client.application.emojis.fetch();
            }

            const appEmoji = ctx.client.application.emojis.cache.find(
                (e) =>
                    e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                    e.id === emojiInput ||
                    e.toString() === emojiInput
            );

            if (appEmoji) return appEmoji;
        }

        return;
    }

    /**
     * Get the event path based on the event category
     *
     * @param {string} type - The event type to get the path for
     * @return {string} - The event path based on the event category
     * @private
     */
    public static getEventPath(type: string): string {
        if (type.startsWith('message')) return `../events/message/${type}`;
        if (type.startsWith('guild')) return `../events/guild/${type}`;
        if (type.startsWith('role')) return `../events/role/${type}`;
        if (type.startsWith('channel')) return `../events/channel/${type}`;
        if (type.startsWith('stageInstance')) return `../events/stage/${type}`;
        if (type.startsWith('sticker')) return `../events/sticker/${type}`;
        if (type.startsWith('thread')) return `../events/thread/${type}`;
        if (type.startsWith('invite')) return `../events/invite/${type}`;
        if (type.startsWith('member')) return `../events/member/${type}`;
        if (type.startsWith('emoji')) return `../events/emoji/${type}`;
        if (type.startsWith('ban')) return `../events/ban/${type}`;
        if (type.startsWith('reaction')) return `../events/reaction/${type}`;
        if (type.startsWith('shard')) return `../events/shard/${type}`;
        if (type.startsWith('autoMod')) return `../events/automod/${type}`;
        if (type.startsWith('entitlement')) return `../events/entitlement/${type}`;
        return `../events/misc/${type}`;
    }
}
