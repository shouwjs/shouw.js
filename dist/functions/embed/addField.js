"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class AddField extends index_js_1.Functions {
    constructor() {
        super({
            name: '$addField',
            description: 'Adds an embed field',
            brackets: true,
            params: [
                {
                    name: 'field title',
                    description: 'The field title for the embed',
                    required: false,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'field content',
                    description: 'The field content for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'inline',
                    description: 'Whether the field should be inline',
                    required: false,
                    type: index_js_1.ParamType.Boolean
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
    code(ctx, [title, content, inline, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).addFields({
            name: (title ?? '\u200B').unescape(),
            value: content.unescape(),
            inline: inline ?? false
        });
        return this.success();
    }
}
exports.default = AddField;
