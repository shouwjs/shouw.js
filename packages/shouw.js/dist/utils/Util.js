"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const discord_js_1 = require("discord.js");
// biome-ignore lint: static members
class UtilTypes {
}
// LOWERCASE CHANNEL TYPES
UtilTypes.ChannelType = {
    text: discord_js_1.ChannelType.GuildText,
    voice: discord_js_1.ChannelType.GuildVoice,
    category: discord_js_1.ChannelType.GuildCategory,
    newsthread: discord_js_1.ChannelType.AnnouncementThread,
    publicthread: discord_js_1.ChannelType.PublicThread,
    privatethread: discord_js_1.ChannelType.PrivateThread,
    stage: discord_js_1.ChannelType.GuildStageVoice,
    forum: discord_js_1.ChannelType.GuildForum,
    directory: discord_js_1.ChannelType.GuildDirectory,
    guild: discord_js_1.ChannelType.GuildText,
    thread: discord_js_1.ChannelType.PublicThread,
    announcement: discord_js_1.ChannelType.GuildAnnouncement,
    dm: discord_js_1.ChannelType.DM,
    group: discord_js_1.ChannelType.GroupDM,
    media: discord_js_1.ChannelType.GuildMedia,
    [discord_js_1.ChannelType.GuildText]: 'text',
    [discord_js_1.ChannelType.GuildVoice]: 'voice',
    [discord_js_1.ChannelType.GuildCategory]: 'category',
    [discord_js_1.ChannelType.GuildAnnouncement]: 'announcement',
    [discord_js_1.ChannelType.AnnouncementThread]: 'newsthread',
    [discord_js_1.ChannelType.PublicThread]: 'publicthread',
    [discord_js_1.ChannelType.PrivateThread]: 'privatethread',
    [discord_js_1.ChannelType.GuildStageVoice]: 'stage',
    [discord_js_1.ChannelType.GuildForum]: 'forum',
    [discord_js_1.ChannelType.GuildDirectory]: 'directory',
    [discord_js_1.ChannelType.DM]: 'dm',
    [discord_js_1.ChannelType.GroupDM]: 'group',
    [discord_js_1.ChannelType.GuildMedia]: 'media'
};
// LOWERCASE MESSAGE FLAGS
UtilTypes.Flags = {
    crossposted: discord_js_1.MessageFlags.Crossposted,
    ephemeral: discord_js_1.MessageFlags.Ephemeral,
    failedtomentionsomerolesinthread: discord_js_1.MessageFlags.FailedToMentionSomeRolesInThread,
    hassnapshot: discord_js_1.MessageFlags.HasSnapshot,
    hasthread: discord_js_1.MessageFlags.HasThread,
    iscomponentsv2: discord_js_1.MessageFlags.IsComponentsV2,
    isvoicemessage: discord_js_1.MessageFlags.IsVoiceMessage,
    iscrosspost: discord_js_1.MessageFlags.IsCrosspost,
    loading: discord_js_1.MessageFlags.Loading,
    shouldshowlinknotdiscordwarning: discord_js_1.MessageFlags.ShouldShowLinkNotDiscordWarning,
    sourcemessagedeleted: discord_js_1.MessageFlags.SourceMessageDeleted,
    suppressembeds: discord_js_1.MessageFlags.SuppressEmbeds,
    suppressnotifications: discord_js_1.MessageFlags.SuppressNotifications,
    urgent: discord_js_1.MessageFlags.Urgent,
    [discord_js_1.MessageFlags.Crossposted]: 'crossposted',
    [discord_js_1.MessageFlags.Ephemeral]: 'ephemeral',
    [discord_js_1.MessageFlags.FailedToMentionSomeRolesInThread]: 'failedtomentionsomerolesinthread',
    [discord_js_1.MessageFlags.HasSnapshot]: 'hassnapshot',
    [discord_js_1.MessageFlags.HasThread]: 'hasthread',
    [discord_js_1.MessageFlags.IsComponentsV2]: 'iscomponentsv2',
    [discord_js_1.MessageFlags.IsVoiceMessage]: 'isvoicemessage',
    [discord_js_1.MessageFlags.IsCrosspost]: 'iscrosspost',
    [discord_js_1.MessageFlags.Loading]: 'loading',
    [discord_js_1.MessageFlags.ShouldShowLinkNotDiscordWarning]: 'shouldshowlinknotdiscordwarning',
    [discord_js_1.MessageFlags.SourceMessageDeleted]: 'sourcemessagedeleted',
    [discord_js_1.MessageFlags.SuppressEmbeds]: 'suppressembeds',
    [discord_js_1.MessageFlags.SuppressNotifications]: 'suppressnotifications',
    [discord_js_1.MessageFlags.Urgent]: 'urgent'
};
class Util extends UtilTypes {
    // CHECK IF STRING IS UNICODE EMOJI
    static isUnicodeEmoji(str) {
        const emojiRegex = /(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?))*)|\d\uFE0F\u20E3/gu;
        return emojiRegex.test(str);
    }
    // GET EMOJI FROM STRING
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
                return emoji ? (onlyId ? emoji.id : emoji.toJSON()) : null;
            }, { context: { emojiInput } });
            foundEmoji = results.find((e) => e);
        }
        else {
            const emoji = ctx.client.emojis.cache.find((e) => e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                e.id === emojiInput ||
                e.toString() === emojiInput);
            foundEmoji = emoji ? (onlyId ? emoji.id : emoji.toJSON()) : void 0;
        }
        if (foundEmoji)
            return foundEmoji;
        if (ctx.client.application?.emojis) {
            if (!ctx.client.application.emojis.cache.size) {
                await ctx.client.application.emojis.fetch();
            }
            const appEmoji = ctx.client.application.emojis.cache.find((e) => e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                e.id === emojiInput ||
                e.toString() === emojiInput);
            if (appEmoji)
                return onlyId ? appEmoji.id : appEmoji.toJSON();
        }
        return;
    }
}
exports.Util = Util;
