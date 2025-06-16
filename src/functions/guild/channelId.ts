import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ChannelID extends Functions {
    constructor() {
        super({
            name: '$channelId',
            description: 'This function will return the ID of the channel.',
            brackets: false,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the channel',
                    required: false,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name]: [string]) {
        return this.success((await ctx.util.getChannel(ctx, name))?.id ?? ctx.channel?.id);
    }
}

const example = `
$channelId // Returns the ID of the current channel
$channelId[channel-name] // Returns the ID of the channel with the name 'channel-name'
`;
