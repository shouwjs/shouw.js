import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ChannelID extends Functions {
    constructor() {
        super({
            name: '$channelId',
            description: 'Returns the id of the channel',
            brackets: false,
            params: [
                {
                    name: 'name',
                    description: 'The name of the channel',
                    required: false,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name]: [string]) {
        return this.success((await ctx.util.getChannel(ctx, name))?.id ?? ctx.channel?.id);
    }
}
