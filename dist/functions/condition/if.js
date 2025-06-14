"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class If extends index_js_1.Functions {
    constructor() {
        super({
            name: '$if',
            description: 'Check a condition wether true or false',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
}
exports.default = If;
