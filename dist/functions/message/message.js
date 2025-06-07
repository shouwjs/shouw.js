"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Message extends index_js_1.Functions {
    constructor() {
        super({
            name: '$message',
            description: `Returns the author's message content`,
            brackets: false,
            params: [
                {
                    name: 'index',
                    description: 'The index of the message content arguments',
                    required: false,
                    type: index_js_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [index = Number.NaN]) {
        return this.success(Number.isNaN(index) ? ctx.args?.join(' ') : ctx.args?.[index - 1]);
    }
}
exports.default = Message;
