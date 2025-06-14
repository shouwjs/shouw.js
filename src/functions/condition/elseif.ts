import { Functions, ParamType, type Interpreter, Constants } from '../../index.js';

export default class ElseIf extends Functions {
    constructor() {
        super({
            name: '$elseIf',
            description: 'Adds an else if condition to the code',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition to check',
                    type: ParamType.String,
                    required: true
                }
            ]
        });
    }

    async code(ctx: Interpreter) {
        return await ctx.error(Constants.Errors.outsideIfStatement, this.name);
    }
}
