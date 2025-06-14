import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Image extends Functions {
    constructor() {
        super({
            name: '$image',
            description: 'Adds an embed image',
            brackets: true,
            params: [
                {
                    name: 'image url',
                    description: 'The image URL for the embed',
                    required: true,
                    type: ParamType.URL
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
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        ctx.getEmbed(index).setImage(text.unescape());

        return this.success();
    }
}
