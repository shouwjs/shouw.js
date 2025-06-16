import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Color extends Functions {
    constructor() {
        super({
            name: '$color',
            description: 'This function will set the color of the embed',
            brackets: true,
            example,
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

const example = `
$color[#ff0000] // sets the color to red
$color[#ff0000;2] // sets the color of the second embed
`;
