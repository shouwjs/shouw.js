import { Functions, ParamType, type Interpreter } from '../../index.js';

export default class ElseIf extends Functions {
    constructor() {
        super({
            name: '$elseIf',
            description: 'This function checks if a condition is true or false',
            brackets: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition to check',
                    type: ParamType.String,
                    required: true,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter) {
        return await ctx.error(ctx.constants.Errors.outsideIfStatement, this.name);
    }
}

const example = `
$if[false]
    This will not run
$elseIf[true]
    This will run
$endIf
`;
