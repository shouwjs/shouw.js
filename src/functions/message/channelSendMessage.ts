import { ParamType, type SendableChannel, Functions, type Interpreter } from '../../index.js';

export default class ChannelSendMessage extends Functions {
    constructor() {
        super({
            name: '$channelSendMessage',
            description: 'Sending a message into the spesific channel',
            brackets: true,
            params: [
                {
                    name: 'channelId',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'content',
                    description: 'The content of the message',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'returnId',
                    description: 'Return the message id',
                    required: false,
                    type: ParamType.Boolean
                }
            ]
        });
    }

    async code(ctx: Interpreter, [channelId, content, returnId]: [string, string, boolean?]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const channel = (ctx.client.channels.cache.get(channelId) ??
            (await ctx.client.channels.fetch(channelId).catch(() => void 0))) as SendableChannel;

        if (!channel) return await ctx.error(`Channel with ID: ${channelId} not found!`, this.name);
        const msg = await channel.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
