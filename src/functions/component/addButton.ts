import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class AddButton extends Functions {
    constructor() {
        super({
            name: '$addButton',
            description: 'Add a button to the message',
            brackets: true,
            params: [
                {
                    name: 'row',
                    description: 'The row to add the button to',
                    required: true,
                    type: ParamType.Number
                },
                {
                    name: 'label',
                    description: 'The label of the button',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'style',
                    description: 'The style of the button',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'customId',
                    description: 'The custom id of the button',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'disabled',
                    description: 'Whether the button is disabled',
                    required: false,
                    type: ParamType.Boolean
                },
                {
                    name: 'emoji',
                    description: 'The emoji of the button',
                    required: false,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(
        ctx: Interpreter,
        [row, label, styleStr, customId, disabled = false, emoji = '']: [
            number,
            string,
            string,
            string,
            boolean,
            string
        ]
    ) {
        row = (Number.isNaN(row) ? 1 : row) - 1;
        if (!ctx.getComponents()) ctx.setComponents([]);
        if (!ctx.getComponent(row)) ctx.pushComponent(new ctx.discord.ActionRowBuilder(), row);
        if (emoji) emoji = (await ctx.util.getEmoji(ctx, emoji.unescape(), true)) ?? emoji.unescape();

        let style = ctx.discord.ButtonStyle.Primary;
        switch (styleStr.unescape().toLowerCase()) {
            case 'primary':
            case '1':
                style = ctx.discord.ButtonStyle.Primary;
                break;
            case 'secondary':
            case '2':
                style = ctx.discord.ButtonStyle.Secondary;
                break;
            case 'success':
            case '3':
                style = ctx.discord.ButtonStyle.Success;
                break;
            case 'danger':
            case '4':
                style = ctx.discord.ButtonStyle.Danger;
                break;
            case 'link':
            case '5':
                style = ctx.discord.ButtonStyle.Link;
                break;
            case 'premium':
            case '6':
                style = ctx.discord.ButtonStyle.Premium;
                break;
        }

        const button = new ctx.discord.ButtonBuilder();
        if (ctx.discord.ButtonStyle.Premium === style) {
            button.setStyle(style).setDisabled(disabled).setSKUId(customId.unescape());
        } else {
            button.setLabel(label.unescape()).setStyle(style).setDisabled(disabled);

            if (emoji) button.setEmoji(emoji);
            if (ctx.discord.ButtonStyle.Link === style) button.setURL(customId.unescape());
            else button.setCustomId(customId.unescape());
        }

        ctx.getComponent(row).addComponents(button);
        return this.success();
    }
}
