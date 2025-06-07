import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Message extends Functions {
    constructor() {
        super({
            name: '$message',
            description: `Returns the author's message content`,
            brackets: false,
            params: [
                {
                    name: 'index',
                    description: 'The index of the message content arguments',
                    required: false,
                    type: ParamType.Number
                }
            ]
        });
    }

    code(ctx: Interpreter, [index = Number.NaN]: [number?]) {
        return this.success(Number.isNaN(index) ? ctx.args?.join(' ') : ctx.args?.[index - 1]);
    }
}
