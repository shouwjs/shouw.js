import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Footer extends Functions {
    constructor() {
        super({
            name: '$footer',
            description: 'Adds an embed footer',
            brackets: true,
            params: [
                {
                    name: 'footer text',
                    description: 'The footer text for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'footer icon url',
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
            ctx.getEmbed(index).setFooter({ text: text.unescape() });
        } else {
            ctx.getEmbed(index).setFooter({ text: text.unescape(), iconURL: iconURL?.unescape() });
        }

        return this.success();
    }
}
