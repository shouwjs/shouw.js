"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Const extends index_js_1.Functions {
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
        if (ctx.hasVariable(varname.unescape()))
            ctx.deleteVariable(varname.unescape());
        if (ctx.hasConstantVariable(varname.unescape()))
            return await ctx.error(index_js_1.Constants.Errors.constantVariable(varname.unescape()), this.name);
        ctx.setConstantVariable(varname.unescape(), value.unescape());
        return this.success();
    }
}
exports.default = Const;
