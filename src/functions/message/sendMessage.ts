import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class SendMessage extends Functions {
    constructor() {
        super({
            name: '$sendMessage',
            description: 'This function will send a message to the current channel',
            brackets: true,
            example,
            params: [
                {
                    name: 'content',
                    description: 'The content of the message',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'returnId',
                    description: 'Return the message id',
                    required: false,
                    type: ParamType.Boolean
                }
            ]
        });
    }

    async code(ctx: Interpreter, [content, returnId]: [string, boolean?]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const msg = await ctx.context?.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}

const example = `
$sendMessage[Hello World!]
$sendMessage[Hello World!;true] // returns the message id
`;
