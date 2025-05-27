"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
exports.EmbedParser = EmbedParser;
exports.ActionRowParser = ActionRowParser;
const discord_js_1 = require("discord.js");
// PARSER FUNCTION (DON'T TOUCH)
async function Parser(ctx, input) {
    const StructureRegex = /{(\w+):((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)}/i;
    let match;
    const embeds = [];
    const components = [];
    let content = input.mustEscape();
    while ((match = StructureRegex.exec(content)) !== null) {
        const key = match[1]?.toLowerCase();
        const value = match[2];
        content = content.replace(match[0], '');
        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
        }
        else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
        }
    }
    return {
        embeds: embeds.filter(Boolean),
        components: components.filter(Boolean),
        content: content?.trim() === '' ? void 0 : content?.trim()
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
function EmbedParser(_ctx, content) {
    const partsRaw = content.split(/}\s*{/);
    partsRaw[0] = partsRaw[0].replace(/^{/, '');
    partsRaw[partsRaw.length - 1] = partsRaw[partsRaw.length - 1].replace(/}$/, '');
    const embedData = {};
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
                embedData.color = (0, discord_js_1.resolveColor)(value.unescape());
                break;
            case 'footericon':
                embedData.footer ?? (embedData.footer = { text: '' });
                embedData.footer.icon_url = value.unescape();
                break;
            case 'image':
                embedData.image ?? (embedData.image = { url: '' });
                embedData.image.url = value.unescape();
                break;
            case 'thumbnail':
                embedData.thumbnail ?? (embedData.thumbnail = { url: '' });
                embedData.thumbnail.url = value.unescape();
                break;
            case 'authoricon':
                embedData.author ?? (embedData.author = { name: '' });
                embedData.author.icon_url = value.unescape();
                break;
            case 'authorurl':
                embedData.author ?? (embedData.author = { name: '' });
                embedData.author.url = value.unescape();
                break;
            case 'footer': {
                const [text, iconURL] = value.split(':') ?? [];
                embedData.footer = { text: text?.unescape().trim() };
                if (iconURL)
                    embedData.footer.icon_url = iconURL.unescape().trim();
                break;
            }
            case 'author': {
                const [name, iconURL] = value.split(':');
                embedData.author = { name: name?.unescape().trim() };
                if (iconURL)
                    embedData.author.icon_url = iconURL.unescape().trim();
                break;
            }
            case 'field': {
                const [fieldTitle = '\u200B', fieldValue = '\u200B', inlineRaw = 'false'] = value.split(':');
                embedData.fields ?? (embedData.fields = []);
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
                    : Date.now());
                break;
        }
    }
    return new discord_js_1.EmbedBuilder(embedData);
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
async function ActionRowParser(ctx, content) {
    const partsRaw = content.split(/}\s*{/);
    partsRaw[0] = partsRaw[0].replace(/^{/, '');
    partsRaw[partsRaw.length - 1] = partsRaw[partsRaw.length - 1].replace(/}$/, '');
    const components = [];
    for (const part of partsRaw) {
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1)
            continue;
        const compType = part.substring(0, colonIndex).trim().toLowerCase();
        const rest = part.substring(colonIndex + 1).trim();
        // BUTTON PARSER
        if (compType === 'button') {
            const segments = rest.match(/(?:<a?:.*?:\d+>|[^:|^}])+/g)?.map((segment) => segment.unescape().trim());
            if (!segments || segments.length < 3)
                continue;
            const label = segments[0];
            const styleStr = segments[1].toLowerCase();
            const custom_id = segments[2];
            const disabled = segments[3] === 'true';
            const emoji = (await ctx.util.getEmoji(ctx, segments[4], true)) ?? segments[4];
            let style = discord_js_1.ButtonStyle.Primary;
            switch (styleStr) {
                case 'primary':
                case '1':
                    style = discord_js_1.ButtonStyle.Primary;
                    break;
                case 'secondary':
                case '2':
                    style = discord_js_1.ButtonStyle.Secondary;
                    break;
                case 'success':
                case '3':
                    style = discord_js_1.ButtonStyle.Success;
                    break;
                case 'danger':
                case '4':
                    style = discord_js_1.ButtonStyle.Danger;
                    break;
                case 'link':
                case '5':
                    style = discord_js_1.ButtonStyle.Link;
                    break;
                case 'premium':
                case '6':
                    style = discord_js_1.ButtonStyle.Premium;
                    break;
            }
            const button = new discord_js_1.ButtonBuilder().setLabel(label).setStyle(style).setDisabled(disabled);
            if (emoji)
                button.setEmoji(emoji);
            if (discord_js_1.ButtonStyle.Link === style)
                button.setURL(custom_id);
            else if (discord_js_1.ButtonStyle.Premium === style)
                button.setSKUId(custom_id);
            else
                button.setCustomId(custom_id);
            components.push(button);
        }
        // SELECT MENU PARSER
        else if (compType === 'selectmenu') {
            const segments = rest.split(':');
            if (segments.length < 6)
                continue;
            let SelectMenu;
            const customId = segments[0].unescape().trim();
            const placeholder = segments[1].unescape().trim();
            const minValues = Number.parseInt(segments[2].unescape().trim());
            const maxValues = Number.parseInt(segments[3].unescape().trim());
            const disabled = segments[4].unescape().trim() === 'true';
            const selectContentMatch = part.match(/\{(stringInput(?::[^}]+)|roleInput|channelInput(?::[^}]+)?|mentionableInput|userInput)\}?/i);
            if (!selectContentMatch)
                continue;
            const selectContent = selectContentMatch[1].toLowerCase().trim();
            switch (true) {
                case selectContent.startsWith('stringinput:'): {
                    SelectMenu = new discord_js_1.StringSelectMenuBuilder();
                    const optionsRaw = content.split(/selectmenu/gi).flatMap((opt) => {
                        if (!opt.includes(rest))
                            return [];
                        return opt
                            .replace(/}\s*{/g, '')
                            .split(/stringinput:/gi)
                            .slice(1);
                    });
                    const result = (await Promise.all(optionsRaw.map(async (opt) => {
                        const optParts = opt
                            .match(/(?:<a?:.*?:\d+>|[^:|^}])+/g)
                            ?.map((s) => s.unescape().trim());
                        if (!optParts || optParts.length < 2)
                            return null;
                        const emoji = optParts[4]
                            ? ((await ctx.util.getEmoji(ctx, optParts[4], true)) ?? optParts[4])
                            : void 0;
                        const option = new discord_js_1.StringSelectMenuOptionBuilder()
                            .setLabel(optParts[0])
                            .setValue(optParts[1]);
                        if (optParts[2])
                            option.setDescription(optParts[2]);
                        if (optParts[3] === 'true')
                            option.setDefault(true);
                        if (emoji)
                            option.setEmoji(emoji);
                        return option;
                    }))).filter(Boolean);
                    SelectMenu.addOptions(result);
                    break;
                }
                case selectContent.startsWith('userinput'):
                    SelectMenu = new discord_js_1.UserSelectMenuBuilder();
                    break;
                case selectContent.startsWith('roleinput'):
                    SelectMenu = new discord_js_1.RoleSelectMenuBuilder();
                    break;
                case selectContent.startsWith('mentionableinput'):
                    SelectMenu = new discord_js_1.MentionableSelectMenuBuilder();
                    break;
                case selectContent.startsWith('channelinput'): {
                    let type = selectContent.split(':')[1]?.toLowerCase().trim();
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
                    SelectMenu = new discord_js_1.ChannelSelectMenuBuilder({
                        channelTypes: type
                    });
                    break;
                }
                default:
                    continue;
            }
            components.push(SelectMenu?.setCustomId(customId)
                .setPlaceholder(placeholder)
                .setMinValues(minValues)
                .setMaxValues(maxValues)
                .setDisabled(disabled) ?? null);
        }
        // MODAL TEXT INPUT PARSER
        else if (compType === 'textinput' || compType === 'modal') {
            const segments = rest.split(':');
            if (segments.length < 3)
                continue;
            const label = segments[0].unescape().trim();
            const styleStr = segments[1].unescape().trim().toLowerCase();
            const customId = segments[2].unescape().trim();
            const required = segments[3]?.unescape().trim() === 'true';
            const placeholder = segments[4]?.unescape().trim() ?? void 0;
            const minLength = Number.parseInt(segments[5]?.unescape().trim()) ?? void 0;
            const maxLength = Number.parseInt(segments[6]?.unescape().trim()) ?? void 0;
            const value = segments[7]?.unescape().trim() ?? void 0;
            let style = discord_js_1.TextInputStyle.Short;
            switch (styleStr) {
                case 'short':
                case '1':
                    style = discord_js_1.TextInputStyle.Short;
                    break;
                case 'paragraph':
                case '2':
                    style = discord_js_1.TextInputStyle.Paragraph;
                    break;
            }
            components.push(new discord_js_1.TextInputBuilder({
                label,
                style,
                customId,
                required,
                placeholder,
                minLength,
                maxLength,
                value
            }));
        }
    }
    if (components.length === 0)
        return null;
    return new discord_js_1.ActionRowBuilder().addComponents(components);
}
