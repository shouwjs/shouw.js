"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class VoiceID extends index_js_1.Functions {
    constructor() {
        super({
            name: '$voiceId',
            description: 'Returns the id of the voice channel of the user',
            brackets: false,
            params: [
                {
                    name: 'userId',
                    description: 'The user to get the voice channel id from',
                    required: false,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'guildId',
                    description: 'The guild to get the voice channel id from',
                    required: false,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [userId, guildId]) {
        const guild = (guildId ? (await ctx.util.getGuild(ctx, guildId))?.id : ctx.guild?.id) ?? '';
        if (guildId && !guild)
            return await ctx.error(index_js_1.Constants.Errors.invalidGuildId(guildId), this.name);
        const member = userId ? await ctx.util.getMember(ctx, guild, userId) : ctx.member;
        if (userId && !member)
            return await ctx.error(index_js_1.Constants.Errors.invalidUserId(userId), this.name);
        return this.success(member?.voice.channelId);
    }
}
exports.default = VoiceID;
