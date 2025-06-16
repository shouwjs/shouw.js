import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Thumbnail extends Functions {
    constructor() {
        super({
            name: '$thumbnail',
            description: 'This function will set the thumbnail of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'thumbnailURL',
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

        ctx.getEmbed(index).setThumbnail(text);

        return this.success();
    }
}

const example = `
$thumbnail[https://example.com/thumbnail.png]
$thumbnail[https://example.com/thumbnail.png;2] // sets the thumbnail of the second embed
`;
