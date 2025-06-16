import { ParamType, Functions, type Interpreter, type SendableChannel } from '../../index.js';

export default class UseChannel extends Functions {
    constructor() {
        super({
            name: '$useChannel',
            description: 'This function will set the channel to send messages to',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'channelId',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [channelId]: [string]) {
        const channel = (await ctx.util.getChannel(ctx, channelId)) as SendableChannel;
        if (!channel) return await ctx.error(ctx.constants.Errors.channelNotFound(channelId), this.name);
        ctx.setUseChannel(channel);

        return this.success();
    }
}

const example = `
$useChannel[123456789012345678]
$sendMessage[Hello World!] // will send the message to the channel with the id 123456789012345678
`;
