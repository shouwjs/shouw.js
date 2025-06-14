"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ChannelSendMessage extends index_js_1.Functions {
    constructor() {
        super({
            name: '$channelSendMessage',
            description: 'Sending a message into the spesific channel',
            brackets: true,
            params: [
                {
                    name: 'channelId',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'content',
                    description: 'The content of the message',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'returnId',
                    description: 'Return the message id',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                }
            ]
        });
    }
    async code(ctx, [channelId, content, returnId]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const channel = (await ctx.util.getChannel(ctx, channelId));
        if (!channel)
            return await ctx.error(index_js_1.Constants.Errors.channelNotFound(channelId), this.name);
        const msg = await channel.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
exports.default = ChannelSendMessage;
