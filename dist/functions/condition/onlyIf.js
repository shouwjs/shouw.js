"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class OnlyIf extends index_js_1.Functions {
    constructor() {
        super({
            name: '$onlyIf',
            description: 'Check a condition wether true or false',
            brackets: true,
            escapeArguments: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'error message',
                    description: 'The error message you want to send if the condition is false',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [condition, message]) {
        if (ctx.condition(condition))
            return this.success();
        if (!message)
            return this.error();
        const parser = await ctx.parser(ctx, message);
        await ctx.getSendableChannel()?.send(parser);
        return this.error();
    }
}
exports.default = OnlyIf;
