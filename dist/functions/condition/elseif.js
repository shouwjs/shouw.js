"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ElseIf extends index_js_1.Functions {
    constructor() {
        super({
            name: '$elseIf',
            description: 'Adds an else if condition to the code',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition to check',
                    type: index_js_1.ParamType.String,
                    required: true
                }
            ]
        });
    }
    async code(ctx) {
        return await ctx.error(index_js_1.Constants.Errors.outsideIfStatement, this.name);
    }
}
exports.default = ElseIf;
