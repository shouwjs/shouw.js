"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Let extends index_js_1.Functions {
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
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'Value of the temporary variable you want to save',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [varname, value]) {
        if (ctx.hasConstantVariable(varname))
            return await ctx.error(index_js_1.Constants.Errors.constantVariable(varname), this.name);
        ctx.setVariable(varname, value);
        return this.success();
    }
}
exports.default = Let;
