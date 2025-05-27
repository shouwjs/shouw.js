import { Functions, type Interpreter } from '../../core';
import { ParamType } from '../../typings';

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
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [varname]: [string], data: Interpreter['Temporarily']) {
        if (!Object.hasOwn(data.variables, varname))
            return await ctx.error(`$get: Variable with the name "${varname}" does not exist!`);

        return this.success(data.variables[varname]);
    }
}
