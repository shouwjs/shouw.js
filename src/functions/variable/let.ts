import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Let extends Functions {
    constructor() {
        super({
            name: '$let',
            description: 'This will store temporary variables which can be retrieved by $get',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'varname',
                    description: 'Name of the temporary variable',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'Value of the temporary variable you want to save',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [varname, value]: [string, string]) {
        if (ctx.hasConstantVariable(varname))
            return await ctx.error(ctx.constants.Errors.constantVariable(varname), this.name);

        ctx.setVariable(varname, value);
        return this.success();
    }
}

const example = `
$let[varname;value] // Stores a temporary variable with the name 'varname' and the value 'value'
$get[varname] // Returns the value of the temporary variable with the name 'varname'
`;
