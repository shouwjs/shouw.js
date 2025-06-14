"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Title extends index_js_1.Functions {
    constructor() {
        super({
            name: '$title',
            description: 'Adds an embed title',
            brackets: true,
            params: [
                {
                    name: 'title',
                    description: 'The title for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'url',
                    description: 'The URL for the title',
                    required: false,
                    type: index_js_1.ParamType.URL
                },
                {
                    name: 'index',
                    description: 'The index to add this data to',
                    required: false,
                    type: index_js_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [text, url, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).setTitle(text.unescape());
        if (url && url !== '')
            ctx.getEmbed(index).setURL(url?.unescape() ?? null);
        return this.success();
    }
}
exports.default = Title;
