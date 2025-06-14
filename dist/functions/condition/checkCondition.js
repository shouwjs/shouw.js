"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CheckCondition extends index_js_1.Functions {
    constructor() {
        super({
            name: '$checkCondition',
            description: 'Check a condition wether true or false',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [condition]) {
        return this.success(condition && condition !== '' ? ctx.condition(condition) : false);
    }
}
exports.default = CheckCondition;
