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
    ContainerBuilder,
    SeparatorSpacingSize,
    SeparatorBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    FileBuilder,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    type StickerResolvable,
    type MessageFlags,
    type PollData,
    type TopLevelComponent,
    type ColorResolvable,
    type APIEmbed
} from 'discord.js';
import type { Interpreter } from './Interpreter';
import type { ComponentTypes, Flags, SendData, SelectMenuTypes } from '../typings';

// PARSER FUNCTION (DON'T TOUCH)
export async function Parser(ctx: Interpreter, input: string): Promise<SendData> {
    const embeds: Array<EmbedBuilder> = [];
    const components: Array<ComponentTypes | null> = [];
    const attachments: Array<AttachmentBuilder | null> = [];
    const flags: Array<MessageFlags | null> = [];
    const stickers: Array<StickerResolvable> = [];
    let poll: PollData | null = null;
    let content: string | undefined = input.mustEscape();
    let isParsed = false;

    for (const match of matchStructure(content)) {
        const [key, value] = keyValue(match);

        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
            isParsed = true;
        } else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
            isParsed = true;
        } else if (key === 'attachment' || key === 'file') {
            attachments.push(AttachmentParser(ctx, value, key));
            isParsed = true;
        } else if (key === 'flags' || key === 'flag') {
            flags.push(...FlagsParser(ctx, value, key));
            isParsed = true;
        } else if (key === 'poll') {
            poll = await PollParser(ctx, value);
            isParsed = true;
        } else if (key === 'newcontainer' || key === 'container') {
            components.push(await ComponentsV2Parser(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        } else if (key === 'text') {
            components.push(new TextDisplayBuilder().setContent(value.unescape()));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        } else if (key === 'section' || key === 'newsection') {
            components.push(await parseSectionV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        } else if (key === 'separator') {
            components.push(parseSeparatorV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        } else if (key === 'gallery') {
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
        components: components.filter(Boolean) as any as TopLevelComponent[],
        content: isComponentsV2 ? null : content?.unescape().trim() === '' ? null : content?.unescape().trim(),
        files: attachments.filter(Boolean) as AttachmentBuilder[],
        flags: flags.filter(Boolean) as Flags,
        poll: (isComponentsV2 ? null : poll) ?? null,
        stickers: isComponentsV2 ? null : (stickers.filter(Boolean) as StickerResolvable[])
    } as any as SendData;
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
function EmbedParser(_ctx: Interpreter, content: string): EmbedBuilder {
    const embedData: APIEmbed = {};

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
                embedData.color = resolveColor(value as ColorResolvable);
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
                if (iconURL) embedData.footer.icon_url = iconURL;
                continue;
            }
            case 'author': {
                const [name = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.author = { name };
                if (iconURL) embedData.author.icon_url = iconURL;
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
                embedData.timestamp = (value !== '' ? Number.parseInt(value) : Date.now()) as any as string;
        }
    }

    return new EmbedBuilder(embedData);
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
async function ActionRowParser(ctx: Interpreter, content: string): Promise<ActionRowBuilder | null> {
    const components: Array<SelectMenuTypes | ButtonBuilder | TextInputBuilder> = [];
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();

        // BUTTON PARSER
        if (key === 'button') {
            const button = await parseButton(ctx, rawValue);
            if (button) components.push(button);
        }

        // SELECT MENU PARSER
        else if (key === 'selectmenu') {
            const [customId, placeholder, minValues, maxValues, disabled = 'false'] = splitEscaped(rawValue);
            if (!customId || !placeholder || !minValues || !maxValues) continue;
            const stringInputMatches = [...rawValue.matchAll(/\{stringInput:([^}]+)\}/gim)];
            let SelectMenu: SelectMenuTypes | null = null;

            if (stringInputMatches.length) {
                SelectMenu = new StringSelectMenuBuilder();

                const options = await Promise.all(
                    stringInputMatches.map(async (match) => {
                        const [label, value, description, isDefault = 'false', emojiInput] = splitEscapedEmoji(
                            match[1]
                        );
                        if (!label || !value) return null;
                        const emoji = emojiInput
                            ? ((await ctx.util.getEmoji(ctx, emojiInput, true)) ?? emojiInput)
                            : undefined;

                        const option = new StringSelectMenuOptionBuilder().setLabel(label).setValue(value);

                        if (description) option.setDescription(description);
                        if (isDefault) option.setDefault(true);
                        if (emoji) option.setEmoji(emoji);
                        return option;
                    })
                );

                SelectMenu.addOptions(options.filter(Boolean) as StringSelectMenuOptionBuilder[]);
            } else {
                const selectTypeMatch = value.match(
                    /\{(userInput|roleInput|mentionableInput|channelInput(?::[^}]+)?)\}/im
                );
                if (!selectTypeMatch) continue;
                const typeStr = selectTypeMatch[1].toLowerCase();

                switch (true) {
                    case typeStr === 'userinput':
                        SelectMenu = new UserSelectMenuBuilder();
                        break;
                    case typeStr === 'roleinput':
                        SelectMenu = new RoleSelectMenuBuilder();
                        break;
                    case typeStr === 'mentionableinput':
                        SelectMenu = new MentionableSelectMenuBuilder();
                        break;
                    case typeStr.startsWith('channelinput'): {
                        const [typeParam] = splitEscaped(typeStr.replace('channelinput:', ''));
                        let types: number[] | undefined;

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

                        SelectMenu = new ChannelSelectMenuBuilder({ channelTypes: types });
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
            const [label, styleStr = '1', customId, required = 'false', placeholder, minLength, maxLength, value] =
                splitEscaped(rawValue);
            let style: TextInputStyle = TextInputStyle.Short;
            switch (styleStr.toLowerCase()) {
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
                    required: required.toLowerCase() === 'true',
                    placeholder,
                    minLength: minLength ? Number.parseInt(minLength) : void 0,
                    maxLength: maxLength ? Number.parseInt(maxLength) : void 0,
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
function AttachmentParser(
    _ctx: Interpreter,
    rawContent: string,
    type: 'attachment' | 'file' = 'attachment'
): AttachmentBuilder | null {
    if (type === 'attachment') {
        const [name = 'attachment.png', url] = splitEscaped(rawContent);
        if (!url) return null;
        return new AttachmentBuilder(url, { name });
    }

    const [name = 'file.txt', content] = splitEscaped(rawContent);
    if (!content) return null;
    const buffer = Buffer.from(content);
    return new AttachmentBuilder(buffer, { name });
}

/**
 * FLAGS PARSER (DON'T TOUCH)
 *
 * {flags:flag1:flag2:flag3}
 * {flag:flag}
 */
function FlagsParser(
    ctx: Interpreter,
    rawContent: string,
    type: 'flags' | 'flag' = 'flags'
): Array<MessageFlags | null> {
    if (type === 'flag') {
        const rawFlag = rawContent.unescape().trim().toLowerCase();
        const flag = Number.isNaN(rawFlag) ? ctx.util.Flags[rawFlag] : Number.parseInt(rawFlag);
        return [flag ?? null].filter(Boolean) as Array<MessageFlags | null>;
    }

    const rawFlags = splitEscaped(rawContent);
    return rawFlags
        .map((flag) => {
            if (!flag) return null;
            return (Number.isNaN(flag) ? ctx.util.Flags[flag.toLowerCase()] : Number.parseInt(flag)) ?? null;
        })
        .filter(Boolean) as Array<MessageFlags | null>;
}

/**
 * POLL PARSER (DON'T TOUCH)
 *
 * {poll:question:duration:multiSelect:(read answer options below)}
 *
 *     * Answer Options Parser:
 *         {answer:text:emoji?}
 */
async function PollParser(ctx: Interpreter, rawContent: string): Promise<PollData | null> {
    const content = rawContent;
    const answerRegex = /{answer:(.*?[^}])}/gim;
    const [question, durationRaw, multiSelect = 'false'] = splitEscaped(content);
    if (!question || !durationRaw) return null;
    const duration = ctx.helpers.time.parse(durationRaw)?.ms ?? 86400000;

    const answers: Array<{ text: string; emoji?: string }> = [];
    const matches = [...content.matchAll(answerRegex)];
    for (const match of matches) {
        const [text, emoji] = splitEscapedEmoji(match[1]);
        if (!text) continue;
        const emojiResolved = emoji ? ((await ctx.util.getEmoji(ctx, emoji, true)) ?? emoji) : void 0;
        answers.push({ text, emoji: emojiResolved });
    }

    if (answers.filter(Boolean).length === 0) return null;
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
async function ComponentsV2Parser(ctx: Interpreter, content: string): Promise<ContainerBuilder | null> {
    const container = new ContainerBuilder();
    const color = parseColorV2(ctx, content);
    const spoiler = parseSpoilerV2(ctx, content) ?? false;
    if (spoiler) container.setSpoiler(spoiler);
    if (color) container.setAccentColor(color);

    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();

        switch (key) {
            case 'actionrow': {
                const row = await ActionRowParser(ctx, rawValue);
                if (row) container.addActionRowComponents(row as any);
                continue;
            }
            case 'separator': {
                const separator = parseSeparatorV2(ctx, rawValue);
                if (separator) container.addSeparatorComponents(separator);
                continue;
            }
            case 'text':
            case 'section':
            case 'newsection': {
                if (key === 'text') {
                    const text = new TextDisplayBuilder().setContent(value);
                    container.addTextDisplayComponents(text);
                    continue;
                }

                const section = await parseSectionV2(ctx, rawValue);
                if (section) container.addSectionComponents(section);
                continue;
            }
            case 'file': {
                const [name, spoiler = 'false'] = splitEscaped(rawValue);
                if (!name) continue;
                const file = new FileBuilder({
                    file: { url: name.startsWith('https://') ? name : `attachment://${name}` },
                    spoiler: spoiler.toLowerCase() === 'true'
                });
                container.addFileComponents(file);
                continue;
            }
            case 'gallery': {
                const gallery = parseGalleryV2(ctx, rawValue);
                if (gallery) container.addMediaGalleryComponents(gallery);
            }
        }
    }

    return container;
}

// HELPER FUNCTIONS (DON'T TOUCH)
function parseColorV2(_ctx: Interpreter, content: string): number | undefined {
    const colorRegex = /{color:(.*?[^}])}/gim;
    const match = colorRegex.exec(content);
    if (!match) return void 0;
    const color = match[1]?.unescape().trim();
    return resolveColor(color as ColorResolvable);
}

function parseSpoilerV2(_ctx: Interpreter, content: string): boolean | undefined {
    const spoilerRegex = /{spoiler:(.*?[^}])}/gim;
    const match = spoilerRegex.exec(content);
    if (!match) return false;
    const spoiler = match[1]?.unescape().trim().toLowerCase();
    return spoiler === 'true';
}

function parseSeparatorV2(_ctx: Interpreter, content: string): SeparatorBuilder | undefined {
    const [divider = 'true', rawSpacing = 'small'] = splitEscaped(content);
    let spacing: SeparatorSpacingSize = SeparatorSpacingSize.Large;

    switch (rawSpacing.toLowerCase()) {
        case 'small':
        case '1':
            spacing = SeparatorSpacingSize.Small;
            break;
        case 'large':
        case '2':
            spacing = SeparatorSpacingSize.Large;
            break;
    }

    return new SeparatorBuilder({
        divider: divider === 'true',
        spacing
    });
}

async function parseSectionV2(ctx: Interpreter, content: string): Promise<SectionBuilder | undefined> {
    const section = new SectionBuilder();
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();

        switch (key) {
            case 'text': {
                if (value === '') continue;
                const text = new TextDisplayBuilder().setContent(value);
                section.addTextDisplayComponents(text);
                continue;
            }
            case 'thumbnail': {
                const [url, spoiler = 'false', description] = splitEscaped(rawValue);
                if (!url) continue;
                const thumbnail = new ThumbnailBuilder({
                    media: { url },
                    spoiler: spoiler.toLowerCase() === 'true',
                    description
                });
                section.setThumbnailAccessory(thumbnail);
                continue;
            }
            case 'button': {
                const button = await parseButton(ctx, rawValue);
                if (button) section.setButtonAccessory(button);
            }
        }
    }

    return section;
}

function parseGalleryV2(_ctx: Interpreter, rawContent: string): MediaGalleryBuilder {
    const content = rawContent;
    const mediaRegex = /{media:(.*?[^}])}/gim;
    const media: MediaGalleryBuilder = new MediaGalleryBuilder();
    const matches = [...content.matchAll(mediaRegex)];

    for (const match of matches) {
        const [url, spoiler = 'false', description] = splitEscaped(match[1]);
        if (!url) continue;

        media.addItems({
            media: { url },
            spoiler: spoiler.toLowerCase() === 'true',
            description
        });
    }

    return media;
}

async function parseButton(ctx: Interpreter, content: string): Promise<ButtonBuilder | undefined> {
    const [label, styleStr, custom_id, disabled = 'false', emojiInput] = splitEscapedEmoji(content);
    if (!label || !styleStr || !custom_id) return void 0;
    const emoji = emojiInput ? ((await ctx.util.getEmoji(ctx, emojiInput, true)) ?? emojiInput) : undefined;
    let style: ButtonStyle = ButtonStyle.Primary;

    switch (styleStr.toLowerCase()) {
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

    const button = new ButtonBuilder()
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled.toLowerCase() === 'true');

    if (emoji) button.setEmoji(emoji);
    if (ButtonStyle.Link === style) button.setURL(custom_id);
    else if (ButtonStyle.Premium === style) button.setSKUId(custom_id);
    else button.setCustomId(custom_id);
    return button;
}

function matchStructure(content: string): RegExpMatchArray[] {
    const StructureRegex = /{(\w+):((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)}/gim;
    return [...content.matchAll(StructureRegex)];
}

function keyValue(match: RegExpMatchArray): [string, string] {
    return [match[1]?.toLowerCase().trim(), match[2].trim()];
}

function splitEscaped(value: string): Array<string | undefined> {
    return value.split(/:(?![/][/])/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '') return void 0;
        return text;
    });
}

function splitEscapedEmoji(value: string): Array<string | undefined> {
    const match = value.match(/(?:<a?:.*?:\d+>|[^:|^}])+/gim);
    if (!match) return [];
    return match.map((v) => {
        const text = v.unescape().trim();
        if (text === '') return void 0;
        return text;
    });
}
