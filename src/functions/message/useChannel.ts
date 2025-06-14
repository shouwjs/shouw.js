import { ParamType, Functions, type Interpreter, type SendableChannel, Constants } from '../../index.js';

export default class UseChannel extends Functions {
    constructor() {
        super({
            name: '$useChannel',
            description: 'Send a message to the channel',
            brackets: true,
            params: [
                {
                    name: 'channel id',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [channelId]: [string]) {
        const channel = (await ctx.util.getChannel(ctx, channelId)) as SendableChannel;
        if (!channel) return await ctx.error(Constants.Errors.channelNotFound(channelId), this.name);
        ctx.setUseChannel(channel);

        return this.success();
    }
}
