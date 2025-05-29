import type { Interpreter } from '../core/Interpreter';
import { ChannelType, MessageFlags } from 'discord.js';

// biome-ignore lint: static members
class UtilTypes {
    // LOWERCASE CHANNEL TYPES
    static ChannelType: Record<string | ChannelType, ChannelType | string> = {
        text: ChannelType.GuildText,
        voice: ChannelType.GuildVoice,
        category: ChannelType.GuildCategory,
        newsthread: ChannelType.AnnouncementThread,
        publicthread: ChannelType.PublicThread,
        privatethread: ChannelType.PrivateThread,
        stage: ChannelType.GuildStageVoice,
        forum: ChannelType.GuildForum,
        directory: ChannelType.GuildDirectory,
        guild: ChannelType.GuildText,
        thread: ChannelType.PublicThread,
        announcement: ChannelType.GuildAnnouncement,
        dm: ChannelType.DM,
        group: ChannelType.GroupDM,
        media: ChannelType.GuildMedia,
        [ChannelType.GuildText]: 'text',
        [ChannelType.GuildVoice]: 'voice',
        [ChannelType.GuildCategory]: 'category',
        [ChannelType.GuildAnnouncement]: 'announcement',
        [ChannelType.AnnouncementThread]: 'newsthread',
        [ChannelType.PublicThread]: 'publicthread',
        [ChannelType.PrivateThread]: 'privatethread',
        [ChannelType.GuildStageVoice]: 'stage',
        [ChannelType.GuildForum]: 'forum',
        [ChannelType.GuildDirectory]: 'directory',
        [ChannelType.DM]: 'dm',
        [ChannelType.GroupDM]: 'group',
        [ChannelType.GuildMedia]: 'media'
    };

    // LOWERCASE MESSAGE FLAGS
    static Flags = {
        crossposted: MessageFlags.Crossposted,
        ephemeral: MessageFlags.Ephemeral,
        failedtomentionsomerolesinthread: MessageFlags.FailedToMentionSomeRolesInThread,
        hassnapshot: MessageFlags.HasSnapshot,
        hasthread: MessageFlags.HasThread,
        iscomponentsv2: MessageFlags.IsComponentsV2,
        isvoicemessage: MessageFlags.IsVoiceMessage,
        iscrosspost: MessageFlags.IsCrosspost,
        loading: MessageFlags.Loading,
        shouldshowlinknotdiscordwarning: MessageFlags.ShouldShowLinkNotDiscordWarning,
        sourcemessagedeleted: MessageFlags.SourceMessageDeleted,
        suppressembeds: MessageFlags.SuppressEmbeds,
        suppressnotifications: MessageFlags.SuppressNotifications,
        urgent: MessageFlags.Urgent,
        [MessageFlags.Crossposted]: 'crossposted',
        [MessageFlags.Ephemeral]: 'ephemeral',
        [MessageFlags.FailedToMentionSomeRolesInThread]: 'failedtomentionsomerolesinthread',
        [MessageFlags.HasSnapshot]: 'hassnapshot',
        [MessageFlags.HasThread]: 'hasthread',
        [MessageFlags.IsComponentsV2]: 'iscomponentsv2',
        [MessageFlags.IsVoiceMessage]: 'isvoicemessage',
        [MessageFlags.IsCrosspost]: 'iscrosspost',
        [MessageFlags.Loading]: 'loading',
        [MessageFlags.ShouldShowLinkNotDiscordWarning]: 'shouldshowlinknotdiscordwarning',
        [MessageFlags.SourceMessageDeleted]: 'sourcemessagedeleted',
        [MessageFlags.SuppressEmbeds]: 'suppressembeds',
        [MessageFlags.SuppressNotifications]: 'suppressnotifications',
        [MessageFlags.Urgent]: 'urgent'
    };
}

export class Util extends UtilTypes {
    // CHECK IF STRING IS UNICODE EMOJI
    static isUnicodeEmoji(str: string) {
        const emojiRegex =
            /(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?))*)|\d\uFE0F\u20E3/gu;
        return emojiRegex.test(str);
    }

    // GET EMOJI FROM STRING
    static async getEmoji(ctx: Interpreter, _emojiInput: string, onlyId = false) {
        let emojiInput = _emojiInput?.unescape().trim();
        if (!emojiInput) return;
        if (Util.isUnicodeEmoji(emojiInput)) {
            return onlyId
                ? emojiInput.trim()
                : {
                      id: null,
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
                    return emoji ? (onlyId ? emoji.id : emoji.toJSON()) : null;
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
            foundEmoji = emoji ? (onlyId ? emoji.id : emoji.toJSON()) : void 0;
        }

        if (foundEmoji) return foundEmoji;
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

            if (appEmoji) return onlyId ? appEmoji.id : appEmoji.toJSON();
        }

        return;
    }
}
