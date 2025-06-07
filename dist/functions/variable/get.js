"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Get extends index_js_1.Functions {
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
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [varname], data) {
        if (!Object.hasOwn(data.variables, varname))
            return await ctx.error(`Variable with the name "${varname}" does not exist!`, this.name);
        return this.success(data.variables[varname]);
    }
}
exports.default = Get;
