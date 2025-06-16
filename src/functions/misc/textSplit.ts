import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class TextSplit extends Functions {
    constructor() {
        super({
            name: '$textSplit',
            description: 'This function will split a string into an array of strings.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The input to split.',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'separator',
                    description: 'The separator to split by.',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [input, separator]: [string, string]) {
        ctx.setSplits(input.split(separator));
        return this.success();
    }
}

const example = `
$textSplit[Hello World!; ]

$splitText[1] // returns "Hello"
$splitText[2] // returns "World!"
`;
