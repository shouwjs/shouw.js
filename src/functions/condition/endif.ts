import { Functions, type Interpreter } from '../../index.js';

export default class Endif extends Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'This function ends an if statement',
            brackets: false,
            example
        });
    }

    async code(ctx: Interpreter) {
        return await ctx.error(ctx.constants.Errors.outsideIfStatement, this.name);
    }
}

const example = `
$if[true]
    This will run
$endif
`;
