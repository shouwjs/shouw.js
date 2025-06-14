"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Footer extends index_js_1.Functions {
    constructor() {
        super({
            name: '$footer',
            description: 'Adds an embed footer',
            brackets: true,
            params: [
                {
                    name: 'footer text',
                    description: 'The footer text for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'footer icon url',
                    description: 'The footer icon URL for the embed',
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
            ctx.getEmbed(index).setFooter({ text: text.unescape() });
        }
        else {
            ctx.getEmbed(index).setFooter({ text: text.unescape(), iconURL: iconURL?.unescape() });
        }
        return this.success();
    }
}
exports.default = Footer;
