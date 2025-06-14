import { Functions, type Interpreter, Constants } from '../../index.js';

export default class Endif extends Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'Ends of the if statement',
            brackets: false
        });
    }

    async code(ctx: Interpreter) {
        return await ctx.error(Constants.Errors.outsideIfStatement, this.name);
    }
}
