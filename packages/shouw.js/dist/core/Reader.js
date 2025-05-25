"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.ShouwParseError = exports.Parser = void 0;
const fs = require("node:fs");
const chalk = require("chalk");
class Parser {
    constructor(filePath) {
        this.fileContent = '';
        this.filePath = filePath;
    }
    readFile() {
        try {
            this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        }
        catch (err) {
            throw new ShouwParseError(err.message);
        }
    }
    static highlightError(code) {
        const lines = code ? code.trim().split('\n') : [];
        return chalk.red(lines.map((line) => `> | ${line}`).join('\n'));
    }
    removeComments(code = '') {
        const blockCommentStart = code.indexOf('//**');
        const blockCommentEnd = code.indexOf('**//');
        if (blockCommentStart !== -1 && (blockCommentEnd === -1 || blockCommentEnd < blockCommentStart)) {
            throw new ShouwParseError('Unclosed block comment (//** ... **//)', this.filePath, code.trim().slice(0, 50));
        }
        return code
            .replace(/\/\/\*\*([\s\S]*?)\*\*\/\//g, '')
            .replace(/\/\/\*(.*)/g, '')
            .trim();
    }
    parse() {
        const commandRegex = /@Command\(\s*(\{[\s\S]*?\})?\s*\)(;)?/gi;
        const objectRegex = /@Command\(\s*(\{[\s\S]*?\})\s*\)(;)?/i;
        const cleanedContent = this.removeComments(this.fileContent);
        const matches = [...cleanedContent.matchAll(commandRegex)];
        if (!matches.length)
            throw new ShouwParseError('Missing @Command({ ... }) declaration', this.filePath);
        const commands = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const commandStart = match.index;
            const commandEnd = commandStart + match[0].length;
            const extractedCode = match[0].match(objectRegex);
            const nextCommandStart = i + 1 < matches.length ? matches[i + 1].index : cleanedContent.length;
            const codeBlock = cleanedContent.slice(commandEnd, nextCommandStart).trim();
            if (!codeBlock) {
                throw new ShouwParseError('Missing code after @Command({ ... }) declaration', this.filePath, match[0]);
            }
            try {
                const obj = new Function(`return ${extractedCode ? extractedCode[1] : '{}'}`)();
                if (!obj.name || !obj.type) {
                    throw new ShouwParseError(`@Command({ ... }) declaration is missing ${chalk.red(obj.name ? 'type' : 'name')} property`);
                }
                commands.push(new Command({ ...obj, code: codeBlock }));
            }
            catch (err) {
                throw new ShouwParseError(err.message, this.filePath, match[0]);
            }
        }
        return Array.isArray(commands) ? commands : [commands];
    }
    execute() {
        this.readFile();
        return this.parse();
    }
}
exports.Parser = Parser;
class ShouwParseError extends SyntaxError {
    constructor(message, file, code) {
        super(`${message}${file ? `in ${chalk.yellow(file)}` : ''}${code ? `\n\n${Parser.highlightError(code)}\n` : ''}`);
        this.name = 'ShouwParseError';
        Error.captureStackTrace(this, new Parser('').execute);
    }
}
exports.ShouwParseError = ShouwParseError;
class Command {
    constructor(options) {
        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }
    }
}
exports.Command = Command;
