import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Author extends Functions {
    constructor() {
        super({
            name: '$author',
            description: 'This function will set the author of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The author name for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'iconURL',
                    description: 'The author icon URL for the embed',
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

    code(ctx: Interpreter, [name, iconURL, index]: [string, string?, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setAuthor({ name });
        } else {
            ctx.getEmbed(index).setAuthor({ name, iconURL });
        }

        return this.success();
    }
}

const example = `
$author[Author Name] // sets the author without an icon

$author[Author Name;https://example.com/icon.png]
$author[Author Name;https://example.com/icon.png;2] // sets the author of the second embed
`;
