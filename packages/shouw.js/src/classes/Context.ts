import type {
    APIInteractionGuildMember,
    User,
    Guild,
    GuildMember,
    OmitPartialGroupDMChannel,
    InteractionCallbackResponse
} from 'discord.js';
import type {
    Interaction,
    InteractionWithMessage,
    SendData,
    MessageReplyData,
    InteractionReplyData,
    SendableChannel
} from '../typings';
import {
    Message,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    ContextMenuCommandInteraction
} from 'discord.js';

export class Context {
    public args?: Array<string>;
    public channel?: SendableChannel;
    public user?: User | null;
    public member?: GuildMember | APIInteractionGuildMember | null;
    public guild?: Guild | null;
    public message?: Message | null;
    public interaction?: Interaction | null;

    constructor(ctx: InteractionWithMessage, args: Array<string>) {
        this.interaction = ctx instanceof Message ? void 0 : ctx;
        this.user = ctx instanceof Message ? ctx.author : ctx.user;
        this.message = ctx instanceof Message ? ctx : void 0;
        this.channel = ctx.channel as SendableChannel;
        this.args = args ?? [];
        this.member = ctx.member;
        this.guild = ctx.guild;
    }

    // CHECK IF INTERACTION
    private get isInteraction(): boolean {
        return (
            !!this.interaction &&
            (this.interaction instanceof ChatInputCommandInteraction ||
                this.interaction instanceof MessageComponentInteraction ||
                this.interaction instanceof ModalSubmitInteraction ||
                this.interaction instanceof ContextMenuCommandInteraction)
        );
    }

    // SEND MESSAGE OR REPLY TO INTERACTION
    public async send(data: SendData): Promise<Message<boolean> | undefined> {
        if (this.isInteraction) return await this.reply(data);

        if (!this.channel) return void 0;
        if (this.channel.partial) await this.channel.fetch();
        return await this.channel.send(data);
    }

    // REPLY TO MESSAGE OR INTERACTION
    public async reply(
        data: MessageReplyData
    ): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;

    public async reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;

    public async reply(data: any): Promise<any> {
        if (this.isInteraction && this.interaction) return await this.interaction.reply(data);

        if (!this.message) return void 0;
        if (this.message.partial) await this.message.fetch();
        return await this.message.reply(data);
    }
}
