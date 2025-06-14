import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Title extends Functions {
    constructor() {
        super({
            name: '$title',
            description: 'Adds an embed title',
            brackets: true,
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

        ctx.getEmbed(index).setTitle(text.unescape());
        if (url && url !== '') ctx.getEmbed(index).setURL(url?.unescape() ?? null);

        return this.success();
    }
}
