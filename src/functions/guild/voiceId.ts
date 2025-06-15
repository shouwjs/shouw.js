import { ParamType, Functions, type Interpreter, Constants } from '../../index.js';

export default class VoiceID extends Functions {
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
                    type: ParamType.String
                },
                {
                    name: 'guildId',
                    description: 'The guild to get the voice channel id from',
                    required: false,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [userId, guildId]: [string, string]) {
        const guild = (guildId ? (await ctx.util.getGuild(ctx, guildId.unescape()))?.id : ctx.guild?.id) ?? '';
        if (guildId && !guild) return await ctx.error(Constants.Errors.invalidGuildId(guildId), this.name);

        const member = userId ? await ctx.util.getMember(ctx, guild, userId.unescape()) : ctx.member;
        if (userId && !member) return await ctx.error(Constants.Errors.invalidUserId(userId), this.name);
        return this.success(member?.voice.channelId);
    }
}
