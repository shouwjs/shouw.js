/**
 * Export interpreter class
 */
export * from './Interpreter.js';

/**
 * Export context class
 */
export * from './Context.js';

/**
 * Export functions class
 */
export * from './Functions.js';

/**
 * Export conditions function
 */
export * from './Conditions.js';

/**
 * Export IF function
 */
export * from './IF.js';

/**
 * Export time class
 */
export * from './Time.js';

/**
 * Export reader class
 */
export * from './Reader.js';

/**
 * Export parsers class
 */
export * from './Parsers.js';

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
