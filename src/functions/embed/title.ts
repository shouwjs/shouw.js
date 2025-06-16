import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Title extends Functions {
    constructor() {
        super({
            name: '$title',
            description: 'This function will set the title of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'title',
                    description: 'The title for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'url',
                    description: 'The URL for the title',
                    required: false,
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

    code(ctx: Interpreter, [text, url, index]: [string, string?, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        ctx.getEmbed(index).setTitle(text);
        if (url && url !== '') ctx.getEmbed(index).setURL(url ?? null);

        return this.success();
    }
}

const example = `
$title[Title]
$title[Title;https://example.com] // sets the title with a URL
$title[Title;https://example.com;2] // sets the title of the second embed
`;
