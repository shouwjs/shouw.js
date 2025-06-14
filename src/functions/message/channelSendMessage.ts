import { ParamType, type SendableChannel, Functions, type Interpreter, Constants } from '../../index.js';

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
        const channel = (await ctx.util.getChannel(ctx, channelId)) as any as SendableChannel;

        if (!channel) return await ctx.error(Constants.Errors.channelNotFound(channelId), this.name);
        const msg = await channel.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
