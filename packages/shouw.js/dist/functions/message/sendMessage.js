"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class SendMessage extends core_1.Functions {
    constructor() {
        super({
            name: '$sendMessage',
            description: 'Sending a message into the current channel',
            brackets: false,
            params: [
                {
                    name: 'content',
                    description: 'The content of the message',
                    required: true,
                    type: typings_1.ParamType.String
                },
                {
                    name: 'returnId',
                    description: 'Return the message id',
                    required: false,
                    type: typings_1.ParamType.Boolean
                }
            ]
        });
    }
    async code(ctx, [content, returnId]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const msg = await ctx.context?.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
exports.default = SendMessage;
