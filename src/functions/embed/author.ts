import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Author extends Functions {
    constructor() {
        super({
            name: '$author',
            description: 'Adds an embed author',
            brackets: true,
            params: [
                {
                    name: 'author name',
                    description: 'The author name for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'author icon url',
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

    code(ctx: Interpreter, [text, iconURL, index]: [string, string?, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setAuthor({ name: text.unescape() });
        } else {
            ctx.getEmbed(index).setAuthor({ name: text.unescape(), iconURL: iconURL?.unescape() });
        }

        return this.success();
    }
}
