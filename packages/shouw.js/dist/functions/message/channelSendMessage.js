"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class ChannelSendMessage extends core_1.Functions {
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
                    type: typings_1.ParamType.String
                },
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
    async code(ctx, [channelId, content, returnId]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const channel = (ctx.client.channels.cache.get(channelId) ??
            (await ctx.client.channels.fetch(channelId).catch(() => void 0)));
        if (!channel) {
            await ctx.error(`Channel with ID: ${channelId} not found!`, this.name);
            return this.error();
        }
        const msg = await channel.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
exports.default = ChannelSendMessage;
