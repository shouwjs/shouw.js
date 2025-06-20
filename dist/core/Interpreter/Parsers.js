"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
exports.CustomParser = CustomParser;
const Discord = __importStar(require("discord.js"));
async function Parser(ctx, input) {
    const embeds = [];
    const components = [];
    const attachments = [];
    const flags = [];
    const stickers = [];
    let poll = null;
    let content = input.mustEscape();
    let isParsed = false;
    let reply = void 0;
    const allowedMentions = {
        parse: ['users', 'roles', 'everyone'],
        repliedUser: true
    };
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
            components.push({
                type: Discord.ComponentType.TextDisplay,
                content: value.unescape()
            });
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
        else if (key === 'allowedmentions') {
            allowedMentions.parse = splitEscaped(value.toLowerCase()).filter((a) => {
                return ['users', 'roles', 'everyone'].includes(a);
            });
            isParsed = true;
        }
        else if (key === 'reply') {
            const splited = splitEscaped(value);
            const messageId = splited[0];
            const mention = splited[1]?.toLowerCase() === 'true';
            const failIfNotExists = splited[2]?.toLowerCase() === 'true';
            if (messageId) {
                allowedMentions.repliedUser = mention;
                reply = {
                    messageReference: messageId,
                    failIfNotExists: failIfNotExists
                };
            }
            isParsed = true;
        }
        if (isParsed) {
            content = content.replace(match[0], '');
            isParsed = false;
        }
    }
    return buildResult({
        embeds,
        components,
        content,
        attachments,
        flags,
        poll,
        stickers,
        reply,
        allowedMentions
    }, ctx);
}
function CustomParser(key, value, split = 'none', many = false) {
    const input = value.mustEscape();
    if (many) {
        const matched = matchStructure(input)
            .map((match) => {
            const [matchedKey, matchedValue = ''] = keyValue(match);
            return {
                key: matchedKey,
                value: splitType(matchedValue, split)
            };
        })
            .filter((v) => v.key.toLowerCase() === key.toLowerCase());
        if (matched.length === 0)
            return void 0;
        return matched;
    }
    const [matchedKey, matchedValue] = keyValue(matchStructure(value)[0]);
    if (matchedKey.toLowerCase() !== key.toLowerCase())
        return void 0;
    return {
        key: matchedKey,
        value: splitType(matchedValue, split)
    };
    function splitType(value, type) {
        switch (type) {
            case 'none':
                return value;
            case 'normal':
                return splitEscaped(value);
            case 'emoji':
                return splitEscapedEmoji(value);
            default:
                return value;
        }
    }
}
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
                embedData.color = Discord.resolveColor(value);
                continue;
            case 'footericon':
                embedData.footer ??= { text: '\u200B' };
                embedData.footer.icon_url = value;
                continue;
            case 'image':
                embedData.image ??= { url: '' };
                embedData.image.url = value;
                continue;
            case 'thumbnail':
                embedData.thumbnail ??= { url: '' };
                embedData.thumbnail.url = value;
                continue;
            case 'authoricon':
                embedData.author ??= { name: '\u200B' };
                embedData.author.icon_url = value;
                continue;
            case 'authorurl':
                embedData.author ??= { name: '\u200B' };
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
                embedData.fields ??= [];
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
    return new Discord.EmbedBuilder(embedData).toJSON();
}
async function ActionRowParser(ctx, content) {
    const components = [];
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        if (key === 'button') {
            const button = await parseButton(ctx, rawValue);
            if (button)
                components.push(button);
        }
        else if (key === 'selectmenu') {
            const [customId, placeholder, minValues = '1', maxValues = '1', disabled = 'false'] = splitEscaped(rawValue);
            if (!customId || !placeholder || !minValues || !maxValues)
                continue;
            const stringInputMatches = [...rawValue.matchAll(/\{stringInput:([^}]+)\}/gim)];
            let SelectMenu = null;
            if (stringInputMatches.length) {
                SelectMenu = new Discord.StringSelectMenuBuilder();
                const options = await Promise.all(stringInputMatches.map(async (match) => {
                    const [label, value, description, isDefault = 'false', emojiInput] = splitEscapedEmoji(match[1]);
                    if (!label || !value)
                        return null;
                    const emoji = emojiInput
                        ? ((await ctx.util.getEmoji(ctx, emojiInput, true)) ?? emojiInput)
                        : undefined;
                    const option = new Discord.StringSelectMenuOptionBuilder().setLabel(label).setValue(value);
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
                        SelectMenu = new Discord.UserSelectMenuBuilder();
                        break;
                    case typeStr === 'roleinput':
                        SelectMenu = new Discord.RoleSelectMenuBuilder();
                        break;
                    case typeStr === 'mentionableinput':
                        SelectMenu = new Discord.MentionableSelectMenuBuilder();
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
                        SelectMenu = new Discord.ChannelSelectMenuBuilder({
                            channelTypes: types
                        });
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
        else if (key === 'textinput' || key === 'modal') {
            const [label, styleStr = '1', customId, required = 'false', placeholder, minLength, maxLength, value] = splitEscaped(rawValue);
            let style = Discord.TextInputStyle.Short;
            switch (styleStr.toLowerCase()) {
                case 'short':
                case '1':
                    style = Discord.TextInputStyle.Short;
                    break;
                case 'paragraph':
                case '2':
                    style = Discord.TextInputStyle.Paragraph;
                    break;
            }
            components.push(new Discord.TextInputBuilder({
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
    return new Discord.ActionRowBuilder().addComponents(components).toJSON();
}
function AttachmentParser(_ctx, rawContent, type = 'attachment') {
    if (type === 'attachment') {
        const [name = 'attachment.png', url] = splitEscaped(rawContent);
        if (!url)
            return null;
        return new Discord.AttachmentBuilder(url, { name }).toJSON();
    }
    const [name = 'file.txt', content] = splitEscaped(rawContent);
    if (!content)
        return null;
    const buffer = Buffer.from(content);
    return new Discord.AttachmentBuilder(buffer, { name }).toJSON();
}
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
async function PollParser(ctx, rawContent) {
    const content = rawContent;
    const answerRegex = /{answer:([^}]+)}/gim;
    const [question, durationRaw, multiSelect = 'false'] = splitEscaped(content);
    if (!question || !durationRaw)
        return null;
    const duration = ctx.helpers.time.parse(durationRaw)?.ms ?? 86400000;
    const answers = [];
    const matches = [...content.matchAll(answerRegex)];
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
async function ComponentsV2Parser(ctx, content) {
    const container = {
        type: Discord.ComponentType.Container,
        components: [],
        accent_color: null,
        spoiler: false
    };
    const color = parseColorV2(ctx, content);
    const spoiler = parseSpoilerV2(ctx, content) ?? false;
    if (spoiler)
        container.spoiler = spoiler;
    if (color)
        container.accent_color = color;
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'separator':
                container.components.push(parseSeparatorV2(ctx, rawValue));
                continue;
            case 'gallery':
                container.components.push(parseGalleryV2(ctx, rawValue));
                continue;
            case 'actionrow': {
                const row = await ActionRowParser(ctx, rawValue);
                if (row)
                    container.components.push(row);
                continue;
            }
            case 'text':
            case 'section':
            case 'newsection': {
                if (key === 'text') {
                    container.components.push({
                        type: Discord.ComponentType.TextDisplay,
                        content: value
                    });
                    continue;
                }
                container.components.push(await parseSectionV2(ctx, rawValue));
                continue;
            }
            case 'file': {
                const [url, spoiler = 'false'] = splitEscaped(rawValue);
                if (!url)
                    continue;
                container.components.push({
                    type: Discord.ComponentType.File,
                    file: { url },
                    spoiler: spoiler.toLowerCase() === 'true'
                });
                continue;
            }
        }
    }
    return container;
}
function parseColorV2(_ctx, content) {
    const colorRegex = /{color:([^}]+)}/gim;
    const match = colorRegex.exec(content);
    if (!match)
        return 0;
    const color = match[1]?.unescape().trim();
    return Discord.resolveColor(color);
}
function parseSpoilerV2(_ctx, content) {
    const spoilerRegex = /{spoiler:([^}]+)}/gim;
    const match = spoilerRegex.exec(content);
    if (!match)
        return false;
    const spoiler = match[1]?.unescape().trim().toLowerCase();
    return spoiler === 'true';
}
function parseSeparatorV2(_ctx, content) {
    const [divider = 'true', rawSpacing = 'small'] = splitEscaped(content);
    let spacing = Discord.SeparatorSpacingSize.Large;
    switch (rawSpacing.toLowerCase()) {
        case 'small':
        case '1':
            spacing = Discord.SeparatorSpacingSize.Small;
            break;
        case 'large':
        case '2':
            spacing = Discord.SeparatorSpacingSize.Large;
            break;
    }
    return {
        type: Discord.ComponentType.Separator,
        divider: divider.toLowerCase() === 'true',
        spacing
    };
}
async function parseSectionV2(ctx, content) {
    const section = {
        type: Discord.ComponentType.Section,
        components: [],
        accessory: null
    };
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'text': {
                if (value === '')
                    continue;
                section.components.push({
                    type: Discord.ComponentType.TextDisplay,
                    content: value
                });
                continue;
            }
            case 'thumbnail': {
                const [url, spoiler = 'false', description] = splitEscaped(rawValue);
                if (!url)
                    continue;
                section.accessory = {
                    type: Discord.ComponentType.Thumbnail,
                    media: { url },
                    spoiler: spoiler.toLowerCase() === 'true',
                    description
                };
                continue;
            }
            case 'button': {
                const button = await parseButton(ctx, rawValue);
                if (button)
                    section.accessory = button.toJSON();
            }
        }
    }
    return section;
}
function parseGalleryV2(_ctx, rawContent) {
    const content = rawContent;
    const mediaRegex = /{media:([^}]+)}/gim;
    const matches = [...content.matchAll(mediaRegex)];
    const media = {
        type: Discord.ComponentType.MediaGallery,
        items: []
    };
    for (const match of matches) {
        const [url, spoiler = 'false', description] = splitEscaped(match[1]);
        if (!url)
            continue;
        media.items.push({
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
    let style = Discord.ButtonStyle.Primary;
    switch (styleStr.toLowerCase()) {
        case 'primary':
        case '1':
            style = Discord.ButtonStyle.Primary;
            break;
        case 'secondary':
        case '2':
            style = Discord.ButtonStyle.Secondary;
            break;
        case 'success':
        case '3':
            style = Discord.ButtonStyle.Success;
            break;
        case 'danger':
        case '4':
            style = Discord.ButtonStyle.Danger;
            break;
        case 'link':
        case '5':
            style = Discord.ButtonStyle.Link;
            break;
        case 'premium':
        case '6':
            style = Discord.ButtonStyle.Premium;
            break;
    }
    const button = new Discord.ButtonBuilder();
    if (Discord.ButtonStyle.Premium === style) {
        button
            .setStyle(style)
            .setDisabled(disabled.toLowerCase() === 'true')
            .setSKUId(custom_id);
    }
    else {
        button
            .setLabel(label)
            .setStyle(style)
            .setDisabled(disabled.toLowerCase() === 'true');
        if (emoji)
            button.setEmoji(emoji);
        if (Discord.ButtonStyle.Link === style)
            button.setURL(custom_id);
        else
            button.setCustomId(custom_id);
    }
    return button;
}
function matchStructure(input) {
    const processParser = (rawContent) => {
        let content = rawContent;
        let start = -1;
        let end = -1;
        let depth = 0;
        const result = [];
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '{') {
                if (depth === 0)
                    start = i;
                depth++;
            }
            else if (content[i] === '}') {
                depth--;
                if (depth === 0) {
                    end = i + 1;
                    break;
                }
            }
        }
        if (start === -1 || end === -1)
            return [];
        const objectContent = content.substring(start, end);
        const objectBody = content.substring(start + 1, end - 1).trim();
        const index = objectBody.indexOf(':');
        const key = objectBody.slice(0, index).trim();
        const value = objectBody.slice(index + 1).trim();
        content = content.replace(objectContent, '').trim();
        result.push([objectContent, key, value ?? '']);
        if (content.includes('{')) {
            const nestedResult = processParser(content);
            if (nestedResult) {
                result.push(...nestedResult);
            }
        }
        return result.filter(Boolean);
    };
    return processParser(input);
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
function buildResult({ embeds, components, content, attachments, flags, poll, stickers, reply, allowedMentions }, ctx) {
    const isComponentsV2 = flags.filter(Boolean).includes(ctx.util.Flags.iscomponentsv2);
    const parsed = JSON.parse(JSON.stringify({
        embeds: isComponentsV2 ? null : embeds.filter(Boolean),
        components: components.filter(Boolean),
        content: isComponentsV2 ? null : content?.unescape().trim() === '' ? null : content?.unescape().trim(),
        poll: (isComponentsV2 ? null : poll) ?? null
    }).replace(/\$executionTime/gi, () => (performance.now() - ctx.start).toFixed(2).toString()));
    return {
        ...parsed,
        files: attachments.filter(Boolean),
        flags: flags.filter(Boolean),
        stickers: isComponentsV2 ? null : stickers.filter(Boolean),
        reply,
        allowedMentions
    };
}
