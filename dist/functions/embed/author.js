"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Author extends index_js_1.Functions {
    constructor() {
        super({
            name: '$author',
            description: 'Adds an embed author',
            brackets: true,
            params: [
                {
                    name: 'author name',
                    description: 'The author name for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'author icon url',
                    description: 'The author icon URL for the embed',
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
    code(ctx, [text, iconURL, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setAuthor({ name: text.unescape() });
        }
        else {
            ctx.getEmbed(index).setAuthor({ name: text.unescape(), iconURL: iconURL?.unescape() });
        }
        return this.success();
    }
}
exports.default = Author;
