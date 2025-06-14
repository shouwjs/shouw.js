import {
    ChannelType,
    MessageFlags,
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    InteractionType,
    ComponentType
} from 'discord.js';
import type { Functions, CustomFunction } from '../index.js';

/**
 * Constant class that contains all the constants used in the bot
 *
 * @class Constants
 */
export class Constants {
    static Errors = {
        build: (options: string | { message: string; solution?: string }, functionName?: string) => {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            return `\`\`\`\n${functionName ? `${functionName}: ` : ''}🚫 ${message}${solution ? `\n\nSo, what is the solution?\n${solution}` : ''}\`\`\``;
        },
        buildLog: (options: string | { message: string; solution?: string }) => {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            return `${message} ${solution ? solution : ''}`;
        },
        missingBrackets: (func: string, functionData: Functions | CustomFunction) => ({
            message: `Invalid ${func} usage: Missing brackets`,
            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
        }),
        missingRequiredArgument: (func: string, field: string) => ({
            message: `Missing required argument "${field}" on function ${func}!`,
            solution: 'Make sure to add all required argument to the function.'
        }),
        invalidArgumentType: (func: string, type: string, parsed: any) => ({
            message: `Invalid argument type for ${func}, Expected "${type}", got "${typeof parsed}"`,
            solution: 'Ensure the argument type is correct and matches the expected type.'
        }),
        constantVariable: (varname: string) => ({
            message: `Cannot redefine to "${varname}" because it is a constant variable`,
            solution: 'Make sure to not redefine a constant variable.'
        }),
        variableNotFound: (varname: string) => ({
            message: `Variable with the name "${varname}" does not exist!`,
            solution: 'Make sure to define the variable before using it.'
        }),
        invalidGuildId: (guildId: string) => ({
            message: `Invalid guild id provided: ${guildId}`,
            solution: 'Ensure the guild id is correct and the bot is in the guild.'
        }),
        invalidUserId: (userId: string) => ({
            message: `Invalid user id provided: ${userId}`,
            solution: 'Ensure the user id is correct and the user is in the guild.'
        }),
        invalidChannelId: (channelId: string) => ({
            message: `Invalid channel id provided: ${channelId}`,
            solution: 'Ensure the channel id is correct and the channel exists.'
        }),
        invalidMessageId: (messageId: string) => ({
            message: `Invalid message id provided: ${messageId}`,
            solution: 'Ensure the message id is correct and the message exists.'
        }),
        invalidRoleId: (roleId: string) => ({
            message: `Invalid role id provided: ${roleId}`,
            solution: 'Ensure the role id is correct and the role exists.'
        }),
        invalidEmojiId: (emojiId: string) => ({
            message: `Invalid emoji id provided: ${emojiId}`,
            solution: 'Ensure the emoji id is correct and the emoji exists.'
        }),
        channelNotFound: (channelId: string) => ({
            message: `Channel with ID: ${channelId} not found!`,
            solution: 'Ensure the channel id is correct and the channel exists.'
        }),
        objectNotFound: (name: string) => ({
            message: `Object with name "${name}" does not exist`,
            solution: 'Ensure the object name is correct and the object exists.'
        }),
        outsideIfStatement: {
            message: 'This function is not meant to be used outside of an $if statement',
            solution: 'Ensure that this function is used inside an $if statement'
        },
        missingEndif: {
            message: 'Invalid $if usage. Malformed or missing $endif',
            solution: 'Ensure that every $if has a corresponding $endif'
        }
    };

    /**
     * Interaction Types (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type)
     * @type {Record<number, string>}
     */
    static InteractionType: Record<number, string> = {
        [InteractionType.Ping]: 'ping',
        [InteractionType.ApplicationCommand]: 'slash',
        [InteractionType.MessageComponent]: 'component',
        [InteractionType.ApplicationCommandAutocomplete]: 'autocomplete',
        [InteractionType.ModalSubmit]: 'modal'
    };

    /**
     * Component Types (https://discord.com/developers/docs/components/reference#component-object)
     * @type {Record<number, string>}
     */
    static ComponentType: Record<number, string> = {
        [ComponentType.ActionRow]: 'actionRow',
        [ComponentType.Button]: 'button',
        [ComponentType.StringSelect]: 'selectMenu',
        [ComponentType.ChannelSelect]: 'selectMenu',
        [ComponentType.RoleSelect]: 'selectMenu',
        [ComponentType.UserSelect]: 'selectMenu',
        [ComponentType.MentionableSelect]: 'selectMenu',
        [ComponentType.TextInput]: 'modal'
    };

    /**
     * Slash Command Types (https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types)
     * @type {Record<string, number>}
     */
    static SlashType: Record<string, number> = {
        slash: ApplicationCommandType.ChatInput,
        user: ApplicationCommandType.User,
        message: ApplicationCommandType.Message
    };

    /**
     * Context Types (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
     * @type {Record<string, number>)
     */
    static ContextType: Record<string, number> = {
        botdm: InteractionContextType.BotDM,
        dm: InteractionContextType.PrivateChannel,
        guild: InteractionContextType.Guild
    };

    /**
     * Integration Types (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
     * @type {Record<string, number>}
     */
    static IntegrationType: Record<string, number> = {
        guild: ApplicationIntegrationType.GuildInstall,
        user: ApplicationIntegrationType.UserInstall
    };

    /**
     * Channel Types (https://discord.com/developers/docs/resources/channel#channel-object-channel-types)
     * @type {Record<string | ChannelType, ChannelType | string>}
     */
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

    /**
     * Message Flags (https://discord.com/developers/docs/resources/message#message-object-message-flags)
     * @type {Record<string | MessageFlags, MessageFlags | string>}
     */
    static Flags: Record<string | MessageFlags, MessageFlags | string> = {
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
