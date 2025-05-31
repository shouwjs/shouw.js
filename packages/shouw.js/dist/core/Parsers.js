"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
const discord_js_1 = require("discord.js");
// PARSER FUNCTION (DON'T TOUCH)
async function Parser(ctx, input) {
    const embeds = [];
    const components = [];
    const attachments = [];
    const flags = [];
    const stickers = [];
    let poll = null;
    let content = input.mustEscape();
    let isParsed = false;
    for (const match of matchStructure(content)) {
        const [key, value] = keyValue(match);
        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
            isParsed = true;
        }
        else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
            isParsed = true;
        }
        else if (key === 'attachment' || key === 'file') {
            attachments.push(AttachmentParser(ctx, value, key));
            isParsed = true;
        }
        else if (key === 'flags' || key === 'flag') {
            flags.push(...FlagsParser(ctx, value, key));
            isParsed = true;
        }
        else if (key === 'poll') {
            poll = await PollParser(ctx, value);
            isParsed = true;
        }
        else if (key === 'newcontainer' || key === 'container') {
            components.push(await ComponentsV2Parser(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'text') {
            components.push(new discord_js_1.TextDisplayBuilder().setContent(value.unescape()));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'section' || key === 'newsection') {
            components.push(await parseSectionV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'separator') {
            components.push(parseSeparatorV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'gallery') {
            components.push(parseGalleryV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        if (isParsed) {
            content = content.replace(match[0], '');
            isParsed = false;
        }
    }
    const isComponentsV2 = flags.filter(Boolean).includes(ctx.util.Flags.iscomponentsv2);
    return {
        embeds: isComponentsV2 ? null : embeds.filter(Boolean),
        components: components.filter(Boolean),
        content: isComponentsV2 ? null : content?.unescape().trim() === '' ? null : content?.unescape().trim(),
        files: attachments.filter(Boolean),
        flags: flags.filter(Boolean),
        poll: (isComponentsV2 ? null : poll) ?? null,
        stickers: isComponentsV2 ? null : stickers.filter(Boolean)
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
    const embedData = {};
    for (const part of matchStructure(content)) {
        const [key, rawValue] = keyValue(part);
        const value = rawValue.unescape();
        switch (key) {
            case 'title':
                embedData.title = value;
                continue;
            case 'url':
                embedData.url = value;
                continue;
            case 'description':
                embedData.description = value;
                continue;
            case 'color':
                embedData.color = (0, discord_js_1.resolveColor)(value);
                continue;
            case 'footericon':
                embedData.footer ?? (embedData.footer = { text: '\u200B' });
                embedData.footer.icon_url = value;
                continue;
            case 'image':
                embedData.image ?? (embedData.image = { url: '' });
                embedData.image.url = value;
                continue;
            case 'thumbnail':
                embedData.thumbnail ?? (embedData.thumbnail = { url: '' });
                embedData.thumbnail.url = value;
                continue;
            case 'authoricon':
                embedData.author ?? (embedData.author = { name: '\u200B' });
                embedData.author.icon_url = value;
                continue;
            case 'authorurl':
                embedData.author ?? (embedData.author = { name: '\u200B' });
                embedData.author.url = value;
                continue;
            case 'footer': {
                const [text = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.footer = { text };
                if (iconURL)
                    embedData.footer.icon_url = iconURL;
                continue;
            }
            case 'author': {
                const [name = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.author = { name };
                if (iconURL)
                    embedData.author.icon_url = iconURL;
                continue;
            }
            case 'field': {
                const [name = '\u200B', value = '\u200B', inline = 'false'] = splitEscaped(rawValue);
                embedData.fields ?? (embedData.fields = []);
                if (embedData.fields.length < 25) {
                    embedData.fields.push({
                        name,
                        value,
                        inline: inline.toLowerCase() === 'true'
                    });
                }
                continue;
            }
            case 'timestamp':
                embedData.timestamp = (value !== '' ? Number.parseInt(value) : Date.now());
        }
    }
    return new discord_js_1.EmbedBuilder(embedData);
}
/**
 * ACTION ROW PARSER (DON'T TOUCH)
 *
 * {actionRow:
 *     {button:label:style:customId:disabled?:emoji?}
 *     {selectMenu:customId:placeholder:minValues:maxValues:disabled?:(read select menu options below)}
 *     {textInput:label:style:customId:required?:placeholder?:minLength?:maxLength?:value?}
 *     {modal:label:style:customId:required?:placeholder?:minLength?:maxLength?:value?}
 * }
 *
 *     * Select Menu Options:
 *         {stringInput:label:value:description?:default?:emoji?}
 *         {userInput}
 *         {roleInput}
 *         {mentionableInput}
 *         {channelInput:channelType?}
 */
async function ActionRowParser(ctx, content) {
    const components = [];
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        // BUTTON PARSER
        if (key === 'button') {
            const button = await parseButton(ctx, rawValue);
            if (button)
                components.push(button);
        }
        // SELECT MENU PARSER
        else if (key === 'selectmenu') {
            const [customId, placeholder, minValues, maxValues, disabled = 'false'] = splitEscaped(rawValue);
            if (!customId || !placeholder || !minValues || !maxValues)
                continue;
            const stringInputMatches = [...rawValue.matchAll(/\{stringInput:([^}]+)\}/gim)];
            let SelectMenu = null;
            if (stringInputMatches.length) {
                SelectMenu = new discord_js_1.StringSelectMenuBuilder();
                const options = await Promise.all(stringInputMatches.map(async (match) => {
                    const [label, value, description, isDefault = 'false', emojiInput] = splitEscapedEmoji(match[1]);
                    if (!label || !value)
                        return null;
                    const emoji = emojiInput
                        ? ((await ctx.util.getEmoji(ctx, emojiInput, true)) ?? emojiInput)
                        : undefined;
                    const option = new discord_js_1.StringSelectMenuOptionBuilder().setLabel(label).setValue(value);
                    if (description)
                        option.setDescription(description);
                    if (isDefault)
                        option.setDefault(true);
                    if (emoji)
                        option.setEmoji(emoji);
                    return option;
                }));
                SelectMenu.addOptions(options.filter(Boolean));
            }
            else {
                const selectTypeMatch = value.match(/\{(userInput|roleInput|mentionableInput|channelInput(?::[^}]+)?)\}/im);
                if (!selectTypeMatch)
                    continue;
                const typeStr = selectTypeMatch[1].toLowerCase();
                switch (true) {
                    case typeStr === 'userinput':
                        SelectMenu = new discord_js_1.UserSelectMenuBuilder();
                        break;
                    case typeStr === 'roleinput':
                        SelectMenu = new discord_js_1.RoleSelectMenuBuilder();
                        break;
                    case typeStr === 'mentionableinput':
                        SelectMenu = new discord_js_1.MentionableSelectMenuBuilder();
                        break;
                    case typeStr.startsWith('channelinput'): {
                        const [typeParam] = splitEscaped(typeStr.replace('channelinput:', ''));
                        let types;
                        switch (typeParam) {
                            case 'text':
                            case '0':
                                types = [0];
                                break;
                            case 'voice':
                            case '2':
                                types = [2];
                                break;
                            default:
                                types = undefined;
                        }
                        SelectMenu = new discord_js_1.ChannelSelectMenuBuilder({ channelTypes: types });
                        break;
                    }
                }
            }
            if (SelectMenu) {
                SelectMenu.setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .setMinValues(Number.parseInt(minValues))
                    .setMaxValues(Number.parseInt(maxValues))
                    .setDisabled(disabled.toLowerCase() === 'true');
                components.push(SelectMenu);
            }
        }
        // TEXT INPUT PARSER
        else if (key === 'textinput' || key === 'modal') {
            const [label, styleStr = '1', customId, required = 'false', placeholder, minLength, maxLength, value] = splitEscaped(rawValue);
            let style = discord_js_1.TextInputStyle.Short;
            switch (styleStr.toLowerCase()) {
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
                required: required.toLowerCase() === 'true',
                placeholder,
                minLength: minLength ? Number.parseInt(minLength) : void 0,
                maxLength: maxLength ? Number.parseInt(maxLength) : void 0,
                value
            }));
        }
    }
    if (components.length === 0)
        return null;
    return new discord_js_1.ActionRowBuilder().addComponents(components);
}
/**
 * ATTACHMENT PARSER (DON'T TOUCH)
 *
 * {attachment:name:url}
 * {attachment:name:location}
 * {file:name:content}
 */
function AttachmentParser(_ctx, rawContent, type = 'attachment') {
    if (type === 'attachment') {
        const [name = 'attachment.png', url] = splitEscaped(rawContent);
        if (!url)
            return null;
        return new discord_js_1.AttachmentBuilder(url, { name });
    }
    const [name = 'file.txt', content] = splitEscaped(rawContent);
    if (!content)
        return null;
    const buffer = Buffer.from(content);
    return new discord_js_1.AttachmentBuilder(buffer, { name });
}
/**
 * FLAGS PARSER (DON'T TOUCH)
 *
 * {flags:flag1:flag2:flag3}
 * {flag:flag}
 */
function FlagsParser(ctx, rawContent, type = 'flags') {
    if (type === 'flag') {
        const rawFlag = rawContent.unescape().trim().toLowerCase();
        const flag = Number.isNaN(rawFlag) ? ctx.util.Flags[rawFlag] : Number.parseInt(rawFlag);
        return [flag ?? null].filter(Boolean);
    }
    const rawFlags = splitEscaped(rawContent);
    return rawFlags
        .map((flag) => {
        if (!flag)
            return null;
        return (Number.isNaN(flag) ? ctx.util.Flags[flag.toLowerCase()] : Number.parseInt(flag)) ?? null;
    })
        .filter(Boolean);
}
/**
 * POLL PARSER (DON'T TOUCH)
 *
 * {poll:question:duration:multiSelect:(read answer options below)}
 *
 *     * Answer Options Parser:
 *         {answer:text:emoji?}
 */
async function PollParser(ctx, rawContent) {
    const content = rawContent;
    const answerRegex = /{answer:(.*?[^:]:.*?[^}])}/gim;
    const [question, durationRaw, multiSelect = 'false'] = splitEscaped(content);
    if (!question || !durationRaw)
        return null;
    const duration = ctx.helpers.time.parse(durationRaw)?.ms ?? 86400000;
    const answers = [];
    const matches = content.matchAll(answerRegex);
    for (const match of matches) {
        const [text, emoji] = splitEscapedEmoji(match[1]);
        if (!text)
            continue;
        const emojiResolved = emoji ? ((await ctx.util.getEmoji(ctx, emoji, true)) ?? emoji) : void 0;
        answers.push({ text, emoji: emojiResolved });
    }
    if (answers.filter(Boolean).length === 0)
        return null;
    return {
        question: { text: question },
        duration: Number.parseInt((duration / (1000 * 60 * 60)).toFixed()),
        allowMultiselect: multiSelect.toLowerCase() === 'true',
        layoutType: 1,
        answers
    };
}
/**
 * COMPONENTS V2 PARSER (DON'T TOUCH)
 *
 * {newContainer:
 *     {color:color}
 *     {spoiler:boolean}
 *     {actionRow:(read actionRow parser above)}
 *     {separator:divider?:spacing?}
 *     {text:content}
 *     {section:(read section parser below)}
 *     {newSection:(read section parser below)}
 *     {file:name:spoiler?}
 *     {gallery:(read gallery parser below)}
 * }
 *
 *     * Section Parser:
 *         {text:content}
 *         {thumbnail:url:spoiler?:description?}
 *         {button:(read button parser above)}
 *
 *     * Gallery Parser:
 *         {media:url:spoiler?:description?}
 * */
async function ComponentsV2Parser(ctx, content) {
    const container = new discord_js_1.ContainerBuilder();
    const color = parseColorV2(ctx, content);
    const spoiler = parseSpoilerV2(ctx, content) ?? false;
    if (spoiler)
        container.setSpoiler(spoiler);
    if (color)
        container.setAccentColor(color);
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'actionrow': {
                const row = await ActionRowParser(ctx, rawValue);
                if (row)
                    container.addActionRowComponents(row);
                continue;
            }
            case 'separator': {
                const separator = parseSeparatorV2(ctx, rawValue);
                if (separator)
                    container.addSeparatorComponents(separator);
                continue;
            }
            case 'text':
            case 'section':
            case 'newsection': {
                if (key === 'text') {
                    const text = new discord_js_1.TextDisplayBuilder().setContent(value);
                    container.addTextDisplayComponents(text);
                    continue;
                }
                const section = await parseSectionV2(ctx, rawValue);
                if (section)
                    container.addSectionComponents(section);
                continue;
            }
            case 'file': {
                const [name, spoiler = 'false'] = splitEscaped(rawValue);
                if (!name)
                    continue;
                const file = new discord_js_1.FileBuilder({
                    file: { url: name.startsWith('https://') ? name : `attachment://${name}` },
                    spoiler: spoiler.toLowerCase() === 'true'
                });
                container.addFileComponents(file);
                continue;
            }
            case 'gallery': {
                const gallery = parseGalleryV2(ctx, rawValue);
                if (gallery)
                    container.addMediaGalleryComponents(gallery);
            }
        }
    }
    return container;
}
// HELPER FUNCTIONS (DON'T TOUCH)
function parseColorV2(_ctx, content) {
    const colorRegex = /{color:(.*?[^}])}/gim;
    const match = colorRegex.exec(content);
    if (!match)
        return void 0;
    const color = match[1]?.unescape().trim();
    return (0, discord_js_1.resolveColor)(color);
}
function parseSpoilerV2(_ctx, content) {
    const spoilerRegex = /{spoiler:(.*?[^}])}/gim;
    const match = spoilerRegex.exec(content);
    if (!match)
        return false;
    const spoiler = match[1]?.unescape().trim().toLowerCase();
    return spoiler === 'true';
}
function parseSeparatorV2(_ctx, content) {
    const [divider = 'true', rawSpacing = 'small'] = splitEscaped(content);
    let spacing = discord_js_1.SeparatorSpacingSize.Large;
    switch (rawSpacing.toLowerCase()) {
        case 'small':
        case '1':
            spacing = discord_js_1.SeparatorSpacingSize.Small;
            break;
        case 'large':
        case '2':
            spacing = discord_js_1.SeparatorSpacingSize.Large;
            break;
    }
    return new discord_js_1.SeparatorBuilder({
        divider: divider === 'true',
        spacing
    });
}
async function parseSectionV2(ctx, content) {
    const section = new discord_js_1.SectionBuilder();
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'text': {
                if (value === '')
                    continue;
                const text = new discord_js_1.TextDisplayBuilder().setContent(value);
                section.addTextDisplayComponents(text);
                continue;
            }
            case 'thumbnail': {
                const [url, spoiler = 'false', description] = splitEscaped(rawValue);
                if (!url)
                    continue;
                const thumbnail = new discord_js_1.ThumbnailBuilder({
                    media: { url },
                    spoiler: spoiler.toLowerCase() === 'true',
                    description
                });
                section.setThumbnailAccessory(thumbnail);
                continue;
            }
            case 'button': {
                const button = await parseButton(ctx, rawValue);
                if (button)
                    section.setButtonAccessory(button);
            }
        }
    }
    return section;
}
function parseGalleryV2(_ctx, rawContent) {
    const content = rawContent;
    const mediaRegex = /{media:(.*?[^}])}/gim;
    const media = new discord_js_1.MediaGalleryBuilder();
    const matches = [...content.matchAll(mediaRegex)];
    for (const match of matches) {
        const [url, spoiler = 'false', description] = splitEscaped(match[1]);
        if (!url)
            continue;
        media.addItems({
            media: { url },
            spoiler: spoiler.toLowerCase() === 'true',
            description
        });
    }
    return media;
}
async function parseButton(ctx, content) {
    const [label, styleStr, custom_id, disabled = 'false', emojiInput] = splitEscapedEmoji(content);
    if (!label || !styleStr || !custom_id)
        return void 0;
    const emoji = emojiInput ? ((await ctx.util.getEmoji(ctx, emojiInput, true)) ?? emojiInput) : undefined;
    let style = discord_js_1.ButtonStyle.Primary;
    switch (styleStr.toLowerCase()) {
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
    const button = new discord_js_1.ButtonBuilder()
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled.toLowerCase() === 'true');
    if (emoji)
        button.setEmoji(emoji);
    if (discord_js_1.ButtonStyle.Link === style)
        button.setURL(custom_id);
    else if (discord_js_1.ButtonStyle.Premium === style)
        button.setSKUId(custom_id);
    else
        button.setCustomId(custom_id);
    return button;
}
function matchStructure(content) {
    const StructureRegex = /{(\w+):((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)}/gim;
    return [...content.matchAll(StructureRegex)];
}
function keyValue(match) {
    return [match[1]?.toLowerCase().trim(), match[2].trim()];
}
function splitEscaped(value) {
    return value.split(/:(?![/][/])/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '')
            return void 0;
        return text;
    });
}
function splitEscapedEmoji(value) {
    const match = value.match(/(?:<a?:.*?:\d+>|[^:|^}])+/gim);
    if (!match)
        return [];
    return match.map((v) => {
        const text = v.unescape().trim();
        if (text === '')
            return void 0;
        return text;
    });
}
