"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const discord_js_1 = require("discord.js");
class Constants {
    static InteractionType = {
        [discord_js_1.InteractionType.Ping]: 'ping',
        [discord_js_1.InteractionType.ApplicationCommand]: 'slash',
        [discord_js_1.InteractionType.MessageComponent]: 'component',
        [discord_js_1.InteractionType.ApplicationCommandAutocomplete]: 'autocomplete',
        [discord_js_1.InteractionType.ModalSubmit]: 'modal'
    };
    static ComponentType = {
        [discord_js_1.ComponentType.ActionRow]: 'actionRow',
        [discord_js_1.ComponentType.Button]: 'button',
        [discord_js_1.ComponentType.StringSelect]: 'selectMenu',
        [discord_js_1.ComponentType.ChannelSelect]: 'selectMenu',
        [discord_js_1.ComponentType.RoleSelect]: 'selectMenu',
        [discord_js_1.ComponentType.UserSelect]: 'selectMenu',
        [discord_js_1.ComponentType.MentionableSelect]: 'selectMenu',
        [discord_js_1.ComponentType.TextInput]: 'modal'
    };
    static SlashType = {
        slash: discord_js_1.ApplicationCommandType.ChatInput,
        user: discord_js_1.ApplicationCommandType.User,
        message: discord_js_1.ApplicationCommandType.Message
    };
    static ContextType = {
        botdm: discord_js_1.InteractionContextType.BotDM,
        dm: discord_js_1.InteractionContextType.PrivateChannel,
        guild: discord_js_1.InteractionContextType.Guild
    };
    static IntegrationType = {
        guild: discord_js_1.ApplicationIntegrationType.GuildInstall,
        user: discord_js_1.ApplicationIntegrationType.UserInstall
    };
    static ChannelType = {
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
    static Flags = {
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
}
exports.Constants = Constants;
