import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class SplitText extends Functions {
    constructor() {
        super({
            name: '$splitText',
            description: 'This function will return the split of the text with the given index.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'index',
                    description: 'The index of the split to return.',
                    required: true,
                    type: ParamType.Number,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [index = 1]: [number]) {
        return this.success(ctx.getSplit(index - 1));
    }
}

const example = `
$textSplit[Hello World!; ]

$splitText[1] // returns "Hello"
$splitText[2] // returns "World!"
`;
