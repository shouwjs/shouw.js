import { ParamType, Functions, type Interpreter } from '../../index.js';
import { ButtonStyle, ComponentType, type APIButtonComponent, type APIMessageComponentEmoji } from 'discord.js';

export default class AddButton extends Functions {
    constructor() {
        super({
            name: '$addButton',
            description: 'This function will add a button to the message',
            brackets: true,
            escapeArguments: true,
            example,
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
                    required: false,
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
                    type: ParamType.String,
                    rest: true
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
        if (!ctx.getComponent(row))
            ctx.pushComponent(
                {
                    type: ComponentType.ActionRow,
                    components: []
                },
                row
            );
        if (emoji) emoji = ((await ctx.util.getEmoji(ctx, emoji)) ?? emoji) as string;

        let style: ButtonStyle | null = null;
        switch (styleStr.toLowerCase()) {
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
            default:
                return await ctx.error(ctx.constants.Errors.invalidButtonStyle(styleStr), this.name);
        }

        let button: APIButtonComponent | null = null;
        if (style === ButtonStyle.Link) {
            button = {
                type: ComponentType.Button,
                label,
                style,
                url: customId,
                disabled,
                emoji: emoji as APIMessageComponentEmoji
            };
        } else if (style === ButtonStyle.Premium) {
            button = {
                type: ComponentType.Button,
                style,
                sku_id: customId,
                disabled
            };
        } else {
            button = {
                type: ComponentType.Button,
                label,
                style,
                custom_id: customId,
                disabled,
                emoji: emoji as APIMessageComponentEmoji
            };
        }

        ctx.getComponent(row).components.push(button);
        return this.success();
    }
}

const example = `
$addButton[1;Click me!;Primary;customId;false]
$addButton[1;Don't Click Me!;Secondary;customId;true;😊]
`;
