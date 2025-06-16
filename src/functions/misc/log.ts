import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Log extends Functions {
    constructor() {
        super({
            name: '$log',
            description: 'This function will log the input to the console.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The input to log.',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(_ctx: Interpreter, [input]: [string]) {
        console.log(input);
        return this.success();
    }
}

const example = `
$log[Hello World!] // logs "Hello World!" to the console
`;
