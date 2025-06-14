"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Ternary extends index_js_1.Functions {
    constructor() {
        super({
            name: '$ternary',
            description: 'Check a condition wether true or false and return the result',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'true result',
                    description: 'The result if the condition is true',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'false result',
                    description: 'The result if the condition is false',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [condition, trueResult, falseResult]) {
        return this.success(ctx.condition(condition.unescape()) ? trueResult.unescape() : (falseResult?.unescape() ?? ''));
    }
}
exports.default = Ternary;
