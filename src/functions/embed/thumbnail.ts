import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Thumbnail extends Functions {
    constructor() {
        super({
            name: '$thumbnail',
            description: 'Adds an embed thumbnail',
            brackets: true,
            params: [
                {
                    name: 'thumbnail url',
                    description: 'The thumbnail URL for the embed',
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

        ctx.getEmbed(index).setThumbnail(text.unescape());

        return this.success();
    }
}
