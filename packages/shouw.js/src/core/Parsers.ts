import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    UserSelectMenuBuilder,
    TextInputBuilder,
    resolveColor,
    TextInputStyle,
    AttachmentBuilder,
    type TopLevelComponent,
    type ColorResolvable,
    type APIEmbed
} from 'discord.js';
import type { Interpreter } from './Interpreter';
import type { SendData, SelectMenuTypes } from '../typings';

// PARSER FUNCTION (DON'T TOUCH)
export async function Parser(ctx: Interpreter, input: string): Promise<SendData> {
    const StructureRegex = /{(\w+):((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)}/i;
    let match: RegExpExecArray | null;

    const embeds: Array<EmbedBuilder> = [];
    const components: Array<ActionRowBuilder | null> = [];
    const attachments: Array<AttachmentBuilder | null> = [];
    let content: string | undefined = input.mustEscape();

    while ((match = StructureRegex.exec(content)) !== null) {
        const key = match[1]?.toLowerCase();
        const value = match[2];

        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
            content = content.replace(match[0], '');
        } else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
            content = content.replace(match[0], '');
        } else if (key === 'attachment' || key === 'file') {
            attachments.push(AttachmentParser(ctx, value, key));
            content = content.replace(match[0], '');
        }
    }

    return {
        embeds: embeds.filter(Boolean),
        components: components.filter(Boolean) as any as TopLevelComponent[],
        content: content?.trim() === '' ? void 0 : content?.trim(),
        files: attachments.filter(Boolean) as AttachmentBuilder[]
    };
}

/**
 * EMBED PARSER (DON'T TOUCH)
 *
 * {newEmbed:
 *     {description:string}
 *     {title:string}
 *     {url:string}
 *     {color:color}
 *     {footer:string:iconURL?}
 *     {image:url}
 *     {thumbnail:url}
 *     {author:string:iconURL?}
 *     {field:title?:value:inline?}
 *     {timestamp:time?}
 *     {footerIcon:iconURL}
 *     {authorIcon:iconURL}
 *     {authorURL:url}
 * }
 */
export function EmbedParser(_ctx: Interpreter, content: string): EmbedBuilder {
    const partsRaw = content.split(/}\s*{/);
    partsRaw[0] = partsRaw[0].replace(/^{/, '');
    partsRaw[partsRaw.length - 1] = partsRaw[partsRaw.length - 1].replace(/}$/, '');
    const embedData: APIEmbed = {};

    for (const part of partsRaw) {
        const colonIndex = part.indexOf(':');
        const key = (colonIndex === -1 ? part : part.substring(0, colonIndex)).trim().toLowerCase();
        const value = colonIndex === -1 ? '' : part.substring(colonIndex + 1).trim();

        switch (key) {
            case 'title':
                embedData.title = value.unescape();
                break;
            case 'url':
                embedData.url = value.unescape();
                break;
            case 'description':
                embedData.description = value.unescape();
                break;
            case 'color':
                embedData.color = resolveColor(value.unescape() as ColorResolvable);
                break;
            case 'footericon':
                embedData.footer ??= { text: '' };
                embedData.footer.icon_url = value.unescape();
                break;
            case 'image':
                embedData.image ??= { url: '' };
                embedData.image.url = value.unescape();
                break;
            case 'thumbnail':
                embedData.thumbnail ??= { url: '' };
                embedData.thumbnail.url = value.unescape();
                break;
            case 'authoricon':
                embedData.author ??= { name: '' };
                embedData.author.icon_url = value.unescape();
                break;
            case 'authorurl':
                embedData.author ??= { name: '' };
                embedData.author.url = value.unescape();
                break;
            case 'footer': {
                const [text, iconURL] = value.split(/:(?![/][/])/) ?? [];
                embedData.footer = { text: text?.unescape().trim() };
                if (iconURL) embedData.footer.icon_url = iconURL.unescape().trim();
                break;
            }
            case 'author': {
                const [name, iconURL] = value.split(/:(?![/][/])/);
                embedData.author = { name: name?.unescape().trim() };
                if (iconURL) embedData.author.icon_url = iconURL.unescape().trim();
                break;
            }
            case 'field': {
                const [fieldTitle = '\u200B', fieldValue = '\u200B', inlineRaw = 'false'] = value.split(/:(?![/][/])/);
                embedData.fields ??= [];
                if (embedData.fields.length < 25) {
                    embedData.fields.push({
                        name: fieldTitle.unescape().trim(),
                        value: fieldValue.unescape().trim(),
                        inline: inlineRaw.unescape().trim().toLowerCase() === 'true'
                    });
                }
                break;
            }
            case 'timestamp':
                embedData.timestamp = (value || value !== ''
                    ? Number.parseInt(value.unescape())
                    : Date.now()) as any as string;
                break;
        }
    }

    return new EmbedBuilder(embedData);
}

/**
 * ACTION ROW PARSER (DON'T TOUCH)
 *
 * {actionRow:
 *     {button:label:style:customId:disabled?:emoji?}
 *     {selectMenu:customId:placeholder:minValues:maxValues:disabled?:selectOptions}
 *
 *     {textInput:label:style:customId:required?:placeholder?:minLength?:maxLength?:value?}
 *     {modal:label:style:customId:required?:placeholder?:minLength?:maxLength?:value?}
 *
 *     * Select Menu Options:
 *         {stringInput:label:value:description?:default?:emoji?}
 *         {userInput}
 *         {roleInput}
 *         {mentionableInput}
 *         {channelInput:channelType?}
 * }
 */
export async function ActionRowParser(ctx: Interpreter, content: string): Promise<ActionRowBuilder | null> {
    const partsRaw = content.split(/}\s*{/);
    partsRaw[0] = partsRaw[0].replace(/^{/, '');
    partsRaw[partsRaw.length - 1] = partsRaw[partsRaw.length - 1].replace(/}$/, '');
    const components: Array<SelectMenuTypes | ButtonBuilder | TextInputBuilder> = [];

    for (const part of partsRaw) {
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) continue;
        const compType = part.substring(0, colonIndex).trim().toLowerCase();
        const rest = part.substring(colonIndex + 1).trim();

        // BUTTON PARSER
        if (compType === 'button') {
            const segments = rest.match(/(?:<a?:.*?:\d+>|[^:|^}])+/g)?.map((segment) => segment.unescape().trim());
            if (!segments || segments.length < 3) continue;
            const label = segments[0];
            const styleStr = segments[1].toLowerCase();
            const custom_id = segments[2];
            const disabled = segments[3] === 'true';
            const emoji = (await ctx.util.getEmoji(ctx, segments[4], true)) ?? segments[4];

            let style: ButtonStyle = ButtonStyle.Primary;
            switch (styleStr) {
                case 'primary':
                case '1':
                    style = ButtonStyle.Primary;
                    break;
                case 'secondary':
                case '2':
                    style = ButtonStyle.Secondary;
                    break;
                case 'success':
                case '3':
                    style = ButtonStyle.Success;
                    break;
                case 'danger':
                case '4':
                    style = ButtonStyle.Danger;
                    break;
                case 'link':
                case '5':
                    style = ButtonStyle.Link;
                    break;
                case 'premium':
                case '6':
                    style = ButtonStyle.Premium;
                    break;
            }

            const button = new ButtonBuilder().setLabel(label).setStyle(style).setDisabled(disabled);
            if (emoji) button.setEmoji(emoji);

            if (ButtonStyle.Link === style) button.setURL(custom_id);
            else if (ButtonStyle.Premium === style) button.setSKUId(custom_id);
            else button.setCustomId(custom_id);
            components.push(button);
        }

        // SELECT MENU PARSER
        else if (compType === 'selectmenu') {
            const segments = rest.split(/:(?![/][/])/g);
            if (segments.length < 6) continue;

            let SelectMenu: SelectMenuTypes;
            const customId = segments[0].unescape().trim();
            const placeholder = segments[1].unescape().trim();
            const minValues = Number.parseInt(segments[2].unescape().trim());
            const maxValues = Number.parseInt(segments[3].unescape().trim());
            const disabled = segments[4].unescape().trim() === 'true';

            const selectContentMatch = part.match(
                /\{(stringInput(?::[^}]+)|roleInput|channelInput(?::[^}]+)?|mentionableInput|userInput)\}?/i
            );
            if (!selectContentMatch) continue;
            const selectContent = selectContentMatch[1].toLowerCase().trim();

            switch (true) {
                case selectContent.startsWith('stringinput:'): {
                    SelectMenu = new StringSelectMenuBuilder();

                    const optionsRaw = content.split(/selectmenu/gi).flatMap((opt: string) => {
                        if (!opt.includes(rest)) return [];
                        return opt
                            .replace(/}\s*{/g, '')
                            .split(/stringinput:/gi)
                            .slice(1);
                    });

                    const result = (
                        await Promise.all(
                            optionsRaw.map(async (opt: string) => {
                                const optParts = opt
                                    .match(/(?:<a?:.*?:\d+>|[^:|^}])+/g)
                                    ?.map((s) => s.unescape().trim());

                                if (!optParts || optParts.length < 2) return null;

                                const emoji = optParts[4]
                                    ? ((await ctx.util.getEmoji(ctx, optParts[4], true)) ?? optParts[4])
                                    : void 0;

                                const option = new StringSelectMenuOptionBuilder()
                                    .setLabel(optParts[0])
                                    .setValue(optParts[1]);

                                if (optParts[2]) option.setDescription(optParts[2]);
                                if (optParts[3] === 'true') option.setDefault(true);
                                if (emoji) option.setEmoji(emoji);

                                return option;
                            })
                        )
                    ).filter(Boolean) as StringSelectMenuOptionBuilder[];

                    SelectMenu.addOptions(result);
                    break;
                }
                case selectContent.startsWith('userinput'):
                    SelectMenu = new UserSelectMenuBuilder();
                    break;
                case selectContent.startsWith('roleinput'):
                    SelectMenu = new RoleSelectMenuBuilder();
                    break;
                case selectContent.startsWith('mentionableinput'):
                    SelectMenu = new MentionableSelectMenuBuilder();
                    break;
                case selectContent.startsWith('channelinput'): {
                    let type: string | Array<number> | undefined = selectContent
                        .split(/:(?![/][/])/)[1]
                        ?.toLowerCase()
                        .trim();
                    switch (type) {
                        case 'text':
                        case '1':
                            type = [0];
                            break;
                        case 'voice':
                        case '2':
                            type = [2];
                            break;
                        default:
                            type = void 0;
                    }

                    SelectMenu = new ChannelSelectMenuBuilder({
                        channelTypes: type
                    });
                    break;
                }
                default:
                    continue;
            }

            components.push(
                SelectMenu?.setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .setMinValues(minValues)
                    .setMaxValues(maxValues)
                    .setDisabled(disabled) ?? null
            );
        }

        // MODAL TEXT INPUT PARSER
        else if (compType === 'textinput' || compType === 'modal') {
            const segments = rest.split(/:(?![/][/])/g);
            if (segments.length < 3) continue;

            const label = segments[0].unescape().trim();
            const styleStr = segments[1].unescape().trim().toLowerCase();
            const customId = segments[2].unescape().trim();
            const required = segments[3]?.unescape().trim() === 'true';
            const placeholder = segments[4]?.unescape().trim() ?? void 0;
            const minLength = Number.parseInt(segments[5]?.unescape().trim()) ?? void 0;
            const maxLength = Number.parseInt(segments[6]?.unescape().trim()) ?? void 0;
            const value = segments[7]?.unescape().trim() ?? void 0;

            let style: TextInputStyle = TextInputStyle.Short;
            switch (styleStr) {
                case 'short':
                case '1':
                    style = TextInputStyle.Short;
                    break;
                case 'paragraph':
                case '2':
                    style = TextInputStyle.Paragraph;
                    break;
            }

            components.push(
                new TextInputBuilder({
                    label,
                    style,
                    customId,
                    required,
                    placeholder,
                    minLength,
                    maxLength,
                    value
                })
            );
        }
    }

    if (components.length === 0) return null;
    return new ActionRowBuilder().addComponents(components);
}

/**
 * ATTACHMENT PARSER (DON'T TOUCH)
 *
 * {attachment:name:url}
 * {attachment:name:location}
 * {file:name:content}
 */
export function AttachmentParser(
    _ctx: Interpreter,
    rawContent: string,
    type: 'attachment' | 'file' = 'attachment'
): AttachmentBuilder | null {
    if (type === 'attachment') {
        const [name = 'attachment.png', url]: string[] = rawContent.split(/:(?![/][/])/);
        if (!url) return null;
        return new AttachmentBuilder(url.unescape(), { name: name.unescape() });
    }

    const [name = 'file.txt', content]: string[] = rawContent.split(/:(?![/][/])/);
    if (!content) return null;
    const buffer = Buffer.from(content.unescape());
    return new AttachmentBuilder(buffer, { name: name.unescape() });
}
