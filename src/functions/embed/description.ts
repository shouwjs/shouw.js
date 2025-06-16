import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Description extends Functions {
    constructor() {
        super({
            name: '$description',
            description: 'This function will set the description of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'content',
                    description: 'The description for the embed',
                    required: true,
                    type: ParamType.String
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

        ctx.getEmbed(index).setDescription(text);

        return this.success();
    }
}

const example = `
$description[This is a description]
$description[This is a description;2] // sets the description of the second embed
`;
