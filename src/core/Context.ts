import {
    type User,
    type Guild,
    type GuildMember,
    type OmitPartialGroupDMChannel,
    type InteractionCallbackResponse,
    type MessagePayload,
    type MessageReplyOptions,
    type MessageCreateOptions,
    type Channel,
    type CategoryChannel,
    type PartialGroupDMChannel,
    type PartialDMChannel,
    type ForumChannel,
    type MediaChannel,
    type InteractionReplyOptions,
    type InteractionEditReplyOptions,
    type InteractionResponse,
    Message,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    ContextMenuCommandInteraction
} from 'discord.js';

export type Interaction =
    | ChatInputCommandInteraction
    | MessageComponentInteraction
    | ModalSubmitInteraction
    | ContextMenuCommandInteraction;

export type InteractionEdit = string | MessagePayload | InteractionEditReplyOptions;

export type InteractionWithMessage = Interaction | Message;

export type SendData = string | MessagePayload | MessageReplyOptions | MessageCreateOptions;

export type MessageReplyData = string | MessagePayload | MessageReplyOptions;

export type InteractionReplyData =
    | string
    | (InteractionReplyOptions & {
          fetchReply?: boolean;
          withResponse?: boolean;
      });

export type SendableChannel = Exclude<
    Channel,
    CategoryChannel | PartialGroupDMChannel | PartialDMChannel | ForumChannel | MediaChannel
> | null;

/**
 * The context instance for managing the message and interaction context
 *
 * @class Context
 * @param {InteractionWithMessage} ctx - The context of the command
 * @param {Array<string>} [args] - The arguments of the command
 * @example const ctx = new Context(message, ['arg1', 'arg2']);
 * ctx.send('Hello World!'); // Send a message to the channel the command was sent in
 */
export class Context {
    /**
     * The arguments of the command
     */
    public args?: Array<string>;

    /**
     * The channel the command was sent in
     */
    public channel?: SendableChannel;

    /**
     * The user who sent the command
     */
    public user?: User | null;

    /**
     * The member who sent the command
     */
    public member?: GuildMember | null;

    /**
     * The guild the command was sent in
     */
    public guild?: Guild | null;

    /**
     * The message the command was sent in
     */
    public message?: Message | null;

    /**
     * The interaction the command was sent in
     */
    public interaction?: Interaction | null;

    constructor(ctx: InteractionWithMessage, args?: Array<string>) {
        this.interaction = ctx instanceof Message ? void 0 : ctx;
        this.user = ctx instanceof Message ? ctx.author : ctx.user;
        this.message = ctx instanceof Message ? ctx : void 0;
        this.channel = ctx.channel as SendableChannel;
        this.args = args ?? [];
        this.member = ctx.member as GuildMember;
        this.guild = ctx.guild;
    }

    /**
     * Check if the command was sent in an interaction
     *
     * @returns {boolean} - Whether the command was sent in an interaction
     * @private
     */
    private get isInteraction(): boolean {
        return (
            !!this.interaction &&
            (this.interaction instanceof ChatInputCommandInteraction ||
                this.interaction instanceof MessageComponentInteraction ||
                this.interaction instanceof ModalSubmitInteraction ||
                this.interaction instanceof ContextMenuCommandInteraction)
        );
    }

    /**
     * Check if the interaction has already been replied to
     *
     * @returns {boolean} - Whether the interaction has already been replied to
     */
    private get isReplied(): boolean {
        if (!this.isInteraction) return false;
        return (this.interaction?.replied || this.interaction?.deferred) ?? false;
    }

    /**
     * Send a message to the channel the command was sent in
     *
     * @param {SendData} data - The data to send
     * @returns {Promise<Message<boolean> | undefined>} - The message sent
     * @example <Context>.send('Hello World!'); // Send a message to the channel the command was sent in
     */
    public async send(data: SendData): Promise<Message<boolean> | undefined> {
        if (this.isInteraction && !this.isReplied) return await this.reply(data);

        if (!this.channel) return void 0;
        if (this.channel.partial) await this.channel.fetch();
        return await this.channel.send(data);
    }

    /**
     * Reply to the message the command was sent in
     *
     * @param {MessageReplyData | InteractionReplyData} data - The data to reply with
     * @returns {Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | InteractionCallbackResponse | undefined>} - The message sent
     * @example <Context>.reply('Hello World!'); // Reply to the message the command was sent in
     */
    public async reply(
        data: MessageReplyData
    ): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;

    public async reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;

    public async reply(data: any): Promise<any> {
        if (this.isInteraction && this.interaction && !this.isReplied) return await this.interaction.reply(data);

        if (!this.message) return await this.send(data);
        if (this.message.partial) await this.message.fetch();
        return await this.message.reply(data);
    }

    /**
     * Edit the reply to the message the command was sent in
     *
     * @param {InteractionEdit} data - The data to edit the reply with
     * @returns {Promise<Message<boolean> | undefined>} - The message sent
     */
    public async editReply(data: InteractionEdit): Promise<Message<boolean> | undefined> {
        return await this.interaction?.editReply(data);
    }

    /**
     * Delete the reply to the message the command was sent in
     *
     * @returns {Promise<void>} - The message sent
     */
    public async deleteReply(): Promise<void> {
        return await this.interaction?.deleteReply();
    }

    /**
     * Fetch the reply to the message the command was sent in
     *
     * @returns {Promise<Message<boolean> | undefined>} - The message sent
     */
    public async fetchReply(): Promise<Message<boolean> | undefined> {
        return await this.interaction?.fetchReply();
    }

    /**
     * Defer the reply to the message the command was sent in
     *
     * @param {boolean} [ephemeral] - Whether the reply should be ephemeral
     * @returns {Promise<InteractionResponse<boolean> | undefined>} - The message sent
     */
    public async deferReply(ephemeral = false): Promise<InteractionCallbackResponse | undefined> {
        return await this.interaction?.deferReply({
            flags: ephemeral ? 64 : void 0,
            withResponse: true
        });
    }

    /**
     * Follow up to the reply to the message the command was sent in
     *
     * @param {InteractionReplyData} data - The data to follow up with
     * @returns {Promise<Message<boolean> | undefined>} - The message sent
     */
    public async followUp(data: InteractionReplyData): Promise<Message<boolean> | undefined> {
        return await this.interaction?.followUp(data);
    }

    /**
     * Defer the update to the message the command was sent in
     *
     * @returns {Promise<InteractionResponse<boolean> | undefined>} - The message sent
     */
    public async deferUpdate(): Promise<InteractionCallbackResponse | undefined> {
        if (!this.interaction?.isMessageComponent()) return;
        return await this.interaction?.deferUpdate({ withResponse: true });
    }

    /**
     * Update the message the command was sent in
     *
     * @param {InteractionEdit} data - The data to update the message with
     * @returns {Promise<InteractionResponse<boolean> | undefined>} - The message sent
     */
    public async update(data: InteractionEdit): Promise<InteractionResponse<boolean> | undefined> {
        if (!this.interaction?.isMessageComponent()) return;
        return await this.interaction?.update(data);
    }
}
