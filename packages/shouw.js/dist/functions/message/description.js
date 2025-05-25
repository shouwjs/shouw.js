"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
class Description extends core_1.Functions {
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
                    type: typings_1.ParamType.String
                },
                {
                    name: 'index',
                    description: 'The index to add this data to',
                    required: false,
                    type: typings_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [text, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.embeds)
            ctx.embeds = [];
        if (!ctx.embeds[index])
            ctx.embeds[index] = new ctx.discord.EmbedBuilder();
        ctx.embeds[index].setDescription(text.unescape());
        return this.success();
    }
}
exports.default = Description;
