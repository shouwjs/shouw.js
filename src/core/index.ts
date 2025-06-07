/**
 * Export all the core classes and functions
 */
export {
    Interpreter,
    type InterpreterOptions,
    type TemporarilyData,
    type HelpersData,
    type ExtraOptionsData
} from './Interpreter.js';

export {
    Context,
    type Interaction,
    type InteractionWithMessage,
    type SendData,
    type MessageReplyData,
    type InteractionReplyData,
    type SendableChannel
} from './Context.js';

export {
    Functions,
    type FunctionResultData,
    ParamType
} from './Functions.js';

export { CheckCondition } from './Conditions.js';

export { IF } from './IF.js';

export { Time } from './Time.js';

export { Reader } from './Reader.js';

export {
    Parser,
    EmbedParser,
    ActionRowParser,
    AttachmentParser,
    FlagsParser,
    PollParser,
    ComponentsV2Parser,
    parseSeparatorV2,
    parseSectionV2,
    parseGalleryV2,
    parseButton,
    type ComponentTypes,
    type Flags,
    type SelectMenuTypes
} from './Parsers.js';

declare global {
    interface String {
        unescape(): string;
        escape(): string;
        mustEscape(): string;
        toObject(): object;
        toURL(): string | undefined;
        toBoolean(): boolean;
    }
}

/**
 * Unescape string prototype
 *
 * @param {string} [str] - The string to unescape
 * @return {string} - The unescaped string
 */
String.prototype.unescape = function (str?: string): string {
    return (str ?? this)
        .replace(/#RIGHT#/g, '[')
        .replace(/#LEFT#/g, ']')
        .replace(/#SEMI#/g, ';')
        .replace(/#COLON#/g, ':')
        .replace(/#CHAR#/g, '$')
        .replace(/#RIGHT_CLICK#/g, '>')
        .replace(/#LEFT_CLICK#/g, '<')
        .replace(/#EQUAL#/g, '=')
        .replace(/#RIGHT_BRACKET#/g, '{')
        .replace(/#LEFT_BRACKET#/g, '}')
        .replace(/#COMMA#/g, ',')
        .replace(/#LB#/g, '(')
        .replace(/#RB#/g, ')')
        .replace(/#AND#/g, '&&')
        .replace(/#OR#/g, '||');
};

/**
 * Escape string prototype
 *
 * @param {string} [str] - The string to escape
 * @return {string} - The escaped string
 */
String.prototype.escape = function (str?: string): string {
    return (str ?? this)
        .replace(/\[/g, '#RIGHT#')
        .replace(/]/g, '#LEFT#')
        .replace(/;/g, '#SEMI#')
        .replace(/:/g, '#COLON#')
        .replace(/\$/g, '#CHAR#')
        .replace(/>/g, '#RIGHT_CLICK#')
        .replace(/</g, '#LEFT_CLICK#')
        .replace(/=/g, '#EQUAL#')
        .replace(/{/g, '#RIGHT_BRACKET#')
        .replace(/}/g, '#LEFT_BRACKET#')
        .replace(/,/g, '#COMMA#')
        .replace(/\(/g, '#LB#')
        .replace(/\)/g, '#RB#')
        .replace(/&&/g, '#AND#')
        .replace(/\|\|/g, '#OR#');
};

/**
 * Must escape string prototype
 *
 * @param {string} [str] - The string to escape
 * @return {string} - The escaped string
 */
String.prototype.mustEscape = function (str?: string): string {
    return (str ?? this)
        .replace(/\\\[/g, '#RIGHT#')
        .replace(/\\]/g, '#LEFT#')
        .replace(/\\;/g, '#SEMI#')
        .replace(/\\:/g, '#COLON#')
        .replace(/\\$/g, '#CHAR#')
        .replace(/\\>/g, '#RIGHT_CLICK#')
        .replace(/\\</g, '#LEFT_CLICK#')
        .replace(/\\=/g, '#EQUAL#')
        .replace(/\\{/g, '#RIGHT_BRACKET#')
        .replace(/\\}/g, '#LEFT_BRACKET#')
        .replace(/\\,/g, '#COMMA#')
        .replace(/\\&&/g, '#AND#')
        .replace(/\\\|\|/g, '#OR#');
};

/**
 * Parse string to object prototype
 *
 * @param {string} [str] - The string to parse
 * @return {ubknown} - The parsed object
 */
String.prototype.toObject = function (str?: string): {
    [key: string | number | symbol | `${any}`]: any;
} {
    try {
        return JSON.parse((str ?? this) as string);
    } catch {
        return {};
    }
};

/**
 * Parse string to URL prototype
 *
 * @param {string} [str] - The string to parse
 * @return {string | undefined} - The parsed URL
 */
String.prototype.toURL = function (str?: string): string | undefined {
    try {
        return new URL((str ?? this) as string).toString();
    } catch {
        return void 0;
    }
};

/**
 * Parse string to boolean prototype
 *
 * @param {string} [string] - The string to parse
 * @return {boolean} - The parsed boolean
 */
String.prototype.toBoolean = function (string?: string): boolean {
    const str = (string ?? this).toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') {
        return true;
    }

    if (str === 'false' || str === '0' || str === 'no') {
        return false;
    }

    return false;
};
