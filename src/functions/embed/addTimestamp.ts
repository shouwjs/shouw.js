import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class AddTimestamp extends Functions {
    constructor() {
        super({
            name: '$addTimestamp',
            description: 'Adds an embed timestamp',
            brackets: false,
            params: [
                {
                    name: 'timestamp',
                    description: 'The timestamp number for the embed',
                    required: true,
                    type: ParamType.Number
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

        ctx.getEmbed(index).setTimestamp(Number.isNaN(Number.parseInt(text)) ? Date.now() : Number.parseInt(text));

        return this.success();
    }
}
