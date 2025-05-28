import type { MessagePayload, MessageReplyOptions, MessageCreateOptions, InteractionReplyOptions, Message, ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, ContextMenuCommandInteraction, Channel, CategoryChannel, ForumChannel, MediaChannel, PartialGroupDMChannel, PartialDMChannel, BitFieldResolvable, MessageFlags, StringSelectMenuBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, MentionableSelectMenuBuilder, UserSelectMenuBuilder } from 'discord.js';
export type Interaction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction | ContextMenuCommandInteraction;
export type InteractionWithMessage = Interaction | Message;
export type SendData = string | MessagePayload | MessageReplyOptions | MessageCreateOptions;
export type MessageReplyData = string | MessagePayload | MessageReplyOptions;
export type InteractionReplyData = string | (InteractionReplyOptions & {
    fetchReply?: boolean;
    withResponse?: boolean;
});
export type SendableChannel = Exclude<Channel, CategoryChannel | PartialGroupDMChannel | PartialDMChannel | ForumChannel | MediaChannel> | null;
export type Flags = BitFieldResolvable<'SuppressEmbeds' | 'SuppressNotifications' | 'IsComponentsV2', MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications | MessageFlags.IsComponentsV2> | undefined;
export type SelectMenuTypes = StringSelectMenuBuilder | RoleSelectMenuBuilder | ChannelSelectMenuBuilder | MentionableSelectMenuBuilder | UserSelectMenuBuilder;
export type Operator = '&&' | '||' | '==' | '!=' | '>=' | '<=' | '>' | '<';
