"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
const node_util_1 = require("node:util");
class DjsEval extends index_js_1.Functions {
    constructor() {
        super({
            name: '$djsEval',
            description: 'Evaluates a discord.js code.',
            brackets: true,
            params: [
                {
                    name: 'input',
                    description: 'The code to execute.',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    code(ctx, arr) {
        const { client, guild, member, user, message, interaction, channel } = ctx;
        const returnResult = arr.length >= 2 ? (arr.pop() === 'true') : false;
        const input = arr.join(';');
        try {
            const result = eval(input.unescape());
            return returnResult ? this.success((0, node_util_1.inspect)(result, { depth: 0 })) : this.success();
        }
        catch (err) {
            return this.success(err);
        }
    }
}
exports.default = DjsEval;
