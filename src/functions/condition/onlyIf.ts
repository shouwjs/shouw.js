import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class OnlyIf extends Functions {
    constructor() {
        super({
            name: '$onlyIf',
            description: 'Check a condition wether true or false',
            brackets: true,
            escapeArguments: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'error message',
                    description: 'The error message you want to send if the condition is false',
                    required: false,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [condition, message]: [string, string?]) {
        if (ctx.condition(condition)) return this.success();
        if (!message) return this.error();

        const parser = await ctx.parser(ctx, message);
        await ctx.getSendableChannel()?.send(parser);

        return this.error();
    }
}
