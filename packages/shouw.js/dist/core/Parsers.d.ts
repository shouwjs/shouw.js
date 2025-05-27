import { EmbedBuilder, ActionRowBuilder } from 'discord.js';
import type { Interpreter } from './Interpreter';
import type { SendData } from '../typings';
export declare function Parser(ctx: Interpreter, input: string): Promise<SendData>;
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
export declare function EmbedParser(_ctx: Interpreter, content: string): EmbedBuilder;
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
export declare function ActionRowParser(ctx: Interpreter, content: string): Promise<ActionRowBuilder | null>;
