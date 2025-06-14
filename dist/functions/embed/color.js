"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Color extends index_js_1.Functions {
    constructor() {
        super({
            name: '$color',
            description: 'Adds an embed color',
            brackets: true,
            params: [
                {
                    name: 'color',
                    description: 'The color for the embed',
                    required: true,
                    type: index_js_1.ParamType.Color
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
    code(ctx, [color, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).setColor(color);
        return this.success();
    }
}
exports.default = Color;
