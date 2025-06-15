import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class Const extends Functions {
    constructor() {
        super({
            name: '$const',
            description: 'Will store constant temporary variables which can be retrieved by $get',
            brackets: true,
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
        if (ctx.hasVariable(varname.unescape())) ctx.deleteVariable(varname.unescape());
        if (ctx.hasConstantVariable(varname.unescape()))
            return await ctx.error(Constants.Errors.constantVariable(varname.unescape()), this.name);

        ctx.setConstantVariable(varname.unescape(), value.unescape());
        return this.success();
    }
}
