import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Color extends Functions {
    constructor() {
        super({
            name: '$color',
            description: 'Adds an embed color',
            brackets: true,
            params: [
                {
                    name: 'color',
                    description: 'The color for the embed',
                    required: true,
                    type: ParamType.Color
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

    code(ctx: Interpreter, [color, index]: [number, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        ctx.getEmbed(index).setColor(color);

        return this.success();
    }
}
