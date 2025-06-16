import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Image extends Functions {
    constructor() {
        super({
            name: '$image',
            description: 'This function will set the image of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'imageURL',
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

        ctx.getEmbed(index).setImage(text);

        return this.success();
    }
}

const example = `
$image[https://example.com/image.png]
$image[https://example.com/image.png;2] // sets the image of the second embed
`;
