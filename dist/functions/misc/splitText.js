"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SplitText extends index_js_1.Functions {
    constructor() {
        super({
            name: '$splitText',
            description: 'Return the splitted text at the given index.',
            brackets: true,
            params: [
                {
                    name: 'index',
                    description: 'The index of the split to return.',
                    required: true,
                    type: index_js_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [index = 1]) {
        return this.success(ctx.getSplit(index - 1));
    }
}
exports.default = SplitText;
