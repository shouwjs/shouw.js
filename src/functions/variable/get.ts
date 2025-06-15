import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class Get extends Functions {
    constructor() {
        super({
            name: '$get',
            description: 'Will retrieve temporary variables stored ny $let',
            brackets: true,
            params: [
                {
                    name: 'varname',
                    description: 'Temporary variable you want to retrieve',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [varname]: [string]) {
        if (!ctx.hasVariable(varname.unescape()) && !ctx.hasConstantVariable(varname.unescape()))
            return await ctx.error(Constants.Errors.variableNotFound(varname), this.name);

        return this.success(ctx.getVariable(varname.unescape()) ?? ctx.getConstantVariable(varname.unescape()));
    }
}
