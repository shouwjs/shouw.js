import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Footer extends Functions {
    constructor() {
        super({
            name: '$footer',
            description: 'This function will set the footer of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'text',
                    description: 'The footer text for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'iconURL',
                    description: 'The footer icon URL for the embed',
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

    code(ctx: Interpreter, [text, iconURL, index]: [string, string?, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setFooter({ text });
        } else {
            ctx.getEmbed(index).setFooter({ text, iconURL });
        }

        return this.success();
    }
}

const example = `
$footer[Footer Text] // sets the footer without an icon

$footer[Footer Text;https://example.com/icon.png]
$footer[Footer Text;https://example.com/icon.png;2] // sets the footer of the second embed
`;
