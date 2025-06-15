"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ChannelID extends index_js_1.Functions {
    constructor() {
        super({
            name: '$channelId',
            description: 'Returns the id of the channel',
            brackets: false,
            params: [
                {
                    name: 'name',
                    description: 'The name of the channel',
                    required: false,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name]) {
        return this.success((await ctx.util.getChannel(ctx, name.unescape()))?.id ?? ctx.channel?.id);
    }
}
exports.default = ChannelID;
