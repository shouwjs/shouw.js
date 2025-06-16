import { ParamType, Functions, type Interpreter } from '../../index.js';
import { inspect } from 'node:util';

export default class DjsEval extends Functions {
    constructor() {
        super({
            name: '$djsEval',
            description: 'This function will evaluate javascript code.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The code to execute.',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, arr: Array<string>) {
        const { client, guild, member, user, message, interaction, channel } = ctx;
        const returnResult = arr.length >= 2 ? ((arr.pop() === 'true') as boolean) : false;
        const input = arr.join(';') as string;

        try {
            // biome-ignore lint: security/detect-eval-with-expression
            const result = eval(input);
            return returnResult ? this.success(inspect(result, { depth: 0 })) : this.success();
        } catch (err: any) {
            return await ctx.error(err, this.name);
        }
    }
}

const example = `
$djsEval[console.log("Hello World!")] // logs "Hello World!" to the console

$djsEval[console.log("Hello World!");true] // logs "Hello World!" to the console and returns it
`;
