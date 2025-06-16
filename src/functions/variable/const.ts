import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Const extends Functions {
    constructor() {
        super({
            name: '$const',
            description: 'This function will store constant temporary variables which can be retrieved by $get',
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
        if (ctx.hasVariable(varname)) ctx.deleteVariable(varname);
        if (ctx.hasConstantVariable(varname))
            return await ctx.error(ctx.constants.Errors.constantVariable(varname), this.name);

        ctx.setConstantVariable(varname, value);
        return this.success();
    }
}

const example = `
$const[varname;value] // Stores a constant temporary variable with the name 'varname' and the value 'value'
$let[varname;value] // return error, because varname is already a constant variable

$get[varname] // Returns the value of the constant temporary variable with the name 'varname'
`;
