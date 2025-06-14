import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class Let extends Functions {
    constructor() {
        super({
            name: '$let',
            description: 'Will store temporary variables which can be retrieved by $let',
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
        if (ctx.hasConstantVariable(varname))
            return await ctx.error(Constants.Errors.constantVariable(varname), this.name);

        ctx.setVariable(varname, value);
        return this.success();
    }
}
