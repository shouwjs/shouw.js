"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class UseChannel extends index_js_1.Functions {
    constructor() {
        super({
            name: '$useChannel',
            description: 'Send a message to the channel',
            brackets: true,
            params: [
                {
                    name: 'channel id',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [channelId]) {
        const channel = (await ctx.util.getChannel(ctx, channelId));
        if (!channel)
            return await ctx.error(index_js_1.Constants.Errors.channelNotFound(channelId), this.name);
        ctx.setUseChannel(channel);
        return this.success();
    }
}
exports.default = UseChannel;
