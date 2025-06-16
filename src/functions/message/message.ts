import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Message extends Functions {
    constructor() {
        super({
            name: '$message',
            description: 'This function will return the message content of the message that triggered the command',
            brackets: false,
            example,
            params: [
                {
                    name: 'index',
                    description: 'The index of the message content arguments',
                    required: false,
                    type: ParamType.Number,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [index = Number.NaN]: [number?]) {
        return this.success(Number.isNaN(index) ? ctx.args?.join(' ') : ctx.args?.[index - 1]);
    }
}

const example = `
$message // returns the full message content
$message[1] // returns the first argument
$message[2] // returns the second argument
`;
