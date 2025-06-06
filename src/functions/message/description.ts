import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Description extends Functions {
    constructor() {
        super({
            name: '$description',
            description: 'Adds an embed description',
            brackets: true,
            params: [
                {
                    name: 'description',
                    description: 'The description for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'index',
                    description: 'The index to add this data to',
                    required: false,
                    type: ParamType.Number
                }
            ]
        });
    }

    code(ctx: Interpreter, [text, index]: [string, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.embeds) ctx.embeds = [];
        if (!ctx.embeds[index]) ctx.embeds[index] = new ctx.discord.EmbedBuilder();
        ctx.embeds[index].setDescription(text.unescape());

        return this.success();
    }
}
