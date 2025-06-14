import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class AddField extends Functions {
    constructor() {
        super({
            name: '$addField',
            description: 'Adds an embed field',
            brackets: true,
            params: [
                {
                    name: 'field title',
                    description: 'The field title for the embed',
                    required: false,
                    type: ParamType.String
                },
                {
                    name: 'field content',
                    description: 'The field content for the embed',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'inline',
                    description: 'Whether the field should be inline',
                    required: false,
                    type: ParamType.Boolean
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

    code(ctx: Interpreter, [title, content, inline, index]: [string, string, boolean?, number?]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds()) ctx.setEmbeds([]);
        if (!ctx.getEmbed(index)) ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);

        ctx.getEmbed(index).addFields({
            name: (title ?? '\u200B').unescape(),
            value: content.unescape(),
            inline: inline ?? false
        });

        return this.success();
    }
}
