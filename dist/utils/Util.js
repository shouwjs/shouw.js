"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const Constants_js_1 = require("./Constants.js");
class Util extends Constants_js_1.Constants {
    static async getChannel(ctx, channelInput) {
        if (!channelInput)
            return;
        let foundChannel;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { channelInput }) => {
                const channel = client.channels.cache.find((c) => c.name?.toLowerCase() === channelInput.toLowerCase() || c.id === channelInput);
                return channel ?? null;
            }, { context: { channelInput } });
            foundChannel = results.find((c) => c);
        }
        else {
            foundChannel = ctx.client.channels.cache.find((c) => c.name?.toLowerCase() === channelInput.toLowerCase() || c.id === channelInput);
        }
        if (foundChannel)
            return Array.isArray(foundChannel) ? foundChannel[0] : foundChannel;
        return (await ctx.client.channels.fetch(channelInput, { force: true }).catch(() => void 0)) ?? void 0;
    }
    static async getGuild(ctx, guildInput) {
        if (!guildInput)
            return;
        let foundGuild;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { guildInput }) => {
                const guild = client.guilds.cache.find((g) => g.name?.toLowerCase() === guildInput.toLowerCase() || g.id === guildInput);
                return guild ?? null;
            }, { context: { guildInput } });
            foundGuild = results.find((g) => g);
        }
        else {
            foundGuild = ctx.client.guilds.cache.find((g) => g.name?.toLowerCase() === guildInput.toLowerCase() || g.id === guildInput);
        }
        if (foundGuild)
            return Array.isArray(foundGuild) ? foundGuild[0] : foundGuild;
        return (await ctx.client.guilds.fetch(guildInput).catch(() => void 0)) ?? void 0;
    }
    static async getMember(ctx, guildInput, memberInput) {
        if (!guildInput || !memberInput)
            return;
        const guild = await Util.getGuild(ctx, guildInput);
        if (!guild)
            return;
        let foundMember;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { guildId, memberInput }) => {
                const guild = client.guilds.cache.get(guildId);
                if (!guild)
                    return null;
                const member = guild.members.cache.find((m) => m.user.username?.toLowerCase() === memberInput.toLowerCase() ||
                    m.user.id === memberInput ||
                    m.user.displayName?.toLowerCase() === memberInput.toLowerCase() ||
                    m.nickname?.toLowerCase() === memberInput.toLowerCase());
                return member ?? null;
            }, { context: { guildId: guild.id, memberInput } });
            foundMember = results.find((m) => m);
        }
        else {
            foundMember = guild.members.cache.find((m) => m.user.username?.toLowerCase() === memberInput.toLowerCase() ||
                m.user.id === memberInput ||
                m.user.displayName?.toLowerCase() === memberInput.toLowerCase() ||
                m.nickname?.toLowerCase() === memberInput.toLowerCase());
        }
        if (foundMember)
            return Array.isArray(foundMember) ? foundMember[0] : foundMember;
        return (await guild.members.fetch(memberInput).catch(() => void 0)) ?? void 0;
    }
    static async getRole(ctx, guildInput, roleInput) {
        if (!guildInput || !roleInput)
            return;
        const guild = await Util.getGuild(ctx, guildInput);
        if (!guild)
            return;
        let foundRole;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { guildId, roleInput }) => {
                const guild = client.guilds.cache.get(guildId);
                if (!guild)
                    return null;
                const role = guild.roles.cache.find((r) => r.name?.toLowerCase() === roleInput.toLowerCase() || r.id === roleInput);
                return role ?? null;
            }, { context: { guildId: guild.id, roleInput } });
            foundRole = results.find((r) => r);
        }
        else {
            foundRole = guild.roles.cache.find((r) => r.name?.toLowerCase() === roleInput.toLowerCase() || r.id === roleInput);
        }
        if (foundRole)
            return Array.isArray(foundRole) ? foundRole[0] : foundRole;
        return (await guild.roles.fetch(roleInput, { force: true }).catch(() => void 0)) ?? void 0;
    }
    static async getUser(ctx, userInput) {
        if (!userInput)
            return;
        let foundUser;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { userInput }) => {
                const user = client.users.cache.find((u) => u.username?.toLowerCase() === userInput.toLowerCase() ||
                    u.id === userInput ||
                    u.displayName?.toLowerCase() === userInput.toLowerCase());
                return user ?? null;
            }, { context: { userInput } });
            foundUser = results.find((u) => u);
        }
        else {
            foundUser = ctx.client.users.cache.find((u) => u.username?.toLowerCase() === userInput.toLowerCase() ||
                u.id === userInput ||
                u.displayName?.toLowerCase() === userInput.toLowerCase());
        }
        if (foundUser)
            return Array.isArray(foundUser) ? foundUser[0] : foundUser;
        return (await ctx.client.users.fetch(userInput, { force: true }).catch(() => void 0)) ?? void 0;
    }
    static async getMessage(ctx, channelInput, messageInput) {
        if (!channelInput || !messageInput)
            return;
        const channel = await Util.getChannel(ctx, channelInput);
        if (!channel)
            return;
        let foundMessage;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { channelId, messageInput }) => {
                const channel = client.channels.cache.get(channelId);
                if (!channel)
                    return null;
                const message = channel.messages?.cache.get(messageInput);
                return message ?? null;
            }, { context: { channelId: channel.id, messageInput } });
            foundMessage = results.find((m) => m);
        }
        else {
            foundMessage = channel.messages?.cache.get(messageInput);
        }
        if (foundMessage)
            return Array.isArray(foundMessage) ? foundMessage[0] : foundMessage;
        return (await channel.messages?.fetch(messageInput).catch(() => void 0)) ?? void 0;
    }
    static isUnicodeEmoji(str) {
        const emojiRegex = /(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?))*)|\d\uFE0F\u20E3/gu;
        return emojiRegex.test(str);
    }
    static async getEmoji(ctx, _emojiInput, onlyId = false) {
        let emojiInput = _emojiInput?.unescape().trim();
        if (!emojiInput)
            return;
        if (Util.isUnicodeEmoji(emojiInput)) {
            return onlyId
                ? emojiInput.trim()
                : {
                    id: null,
                    name: emojiInput.trim(),
                    animated: false
                };
        }
        if (emojiInput.includes(':'))
            emojiInput = emojiInput.split(':')[2]?.split('>')[0];
        let foundEmoji;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval((client, { emojiInput }) => {
                const emoji = client.emojis.cache.find((e) => e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                    e.id === emojiInput ||
                    e.toString() === emojiInput);
                return (onlyId ? emoji?.id : emoji) ?? null;
            }, { context: { emojiInput } });
            foundEmoji = results.find((e) => e);
        }
        else {
            const emoji = ctx.client.emojis.cache.find((e) => e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                e.id === emojiInput ||
                e.toString() === emojiInput);
            foundEmoji = (onlyId ? emoji?.id : emoji) ?? void 0;
        }
        if (foundEmoji)
            return Array.isArray(foundEmoji) ? foundEmoji[0] : foundEmoji;
        if (ctx.client.application?.emojis) {
            if (!ctx.client.application.emojis.cache.size) {
                await ctx.client.application.emojis.fetch();
            }
            const appEmoji = ctx.client.application.emojis.cache.find((e) => e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                e.id === emojiInput ||
                e.toString() === emojiInput);
            if (appEmoji)
                return onlyId
                    ? Array.isArray(appEmoji)
                        ? appEmoji[0]?.id
                        : appEmoji.id
                    : Array.isArray(appEmoji)
                        ? appEmoji[0]
                        : appEmoji;
        }
        return;
    }
}
exports.Util = Util;
