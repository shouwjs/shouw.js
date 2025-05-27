import type { Interpreter } from '../core/Interpreter';

// biome-ignore lint: static members
export class Util {
    // CHECK IF STRING IS UNICODE EMOJI
    static isUnicodeEmoji(str: string) {
        const emojiRegex =
            /(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?))*)|\d\uFE0F\u20E3/gu;
        return emojiRegex.test(str);
    }

    // GET EMOJI FROM STRING
    static async getEmoji(ctx: Interpreter, _emojiInput: string, onlyId = false) {
        let emojiInput = _emojiInput?.unescape().trim();
        if (!emojiInput) return;
        if (Util.isUnicodeEmoji(emojiInput)) {
            return onlyId
                ? emojiInput.trim()
                : {
                      id: null,
                      name: emojiInput.trim(),
                      animated: false
                  };
        }

        if (emojiInput.includes(':')) emojiInput = emojiInput.split(':')[2]?.split('>')[0];
        let foundEmoji: any;
        if (ctx.client.shard) {
            const results = await ctx.client.shard.broadcastEval(
                (client, { emojiInput }) => {
                    const emoji = client.emojis.cache.find(
                        (e) =>
                            e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                            e.id === emojiInput ||
                            e.toString() === emojiInput
                    );
                    return emoji ? (onlyId ? emoji.id : emoji.toJSON()) : null;
                },
                { context: { emojiInput } }
            );
            foundEmoji = results.find((e) => e);
        } else {
            const emoji = ctx.client.emojis.cache.find(
                (e) =>
                    e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                    e.id === emojiInput ||
                    e.toString() === emojiInput
            );
            foundEmoji = emoji ? (onlyId ? emoji.id : emoji.toJSON()) : void 0;
        }

        if (foundEmoji) return foundEmoji;
        if (ctx.client.application?.emojis) {
            if (!ctx.client.application.emojis.cache.size) {
                await ctx.client.application.emojis.fetch();
            }

            const appEmoji = ctx.client.application.emojis.cache.find(
                (e) =>
                    e.name?.toLowerCase() === emojiInput.toLowerCase() ||
                    e.id === emojiInput ||
                    e.toString() === emojiInput
            );

            if (appEmoji) return onlyId ? appEmoji.id : appEmoji.toJSON();
        }

        return;
    }
}
