"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Description extends index_js_1.Functions {
    constructor() {
        super({
            name: '$description',
            description: 'Adds an embed description',
            brackets: true,
            params: [
                {
                    name: 'description',
                    description: 'The description for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
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
    code(ctx, [text, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).setDescription(text.unescape());
        return this.success();
    }
}
exports.default = Description;
