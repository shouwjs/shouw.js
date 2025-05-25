import * as fs from 'node:fs';
import * as chalk from 'chalk';
import type { CommandData } from '../typings';

export class Parser {
    filePath: string;
    fileContent = '';

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    // READ FILE CONTENT
    readFile() {
        try {
            this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        } catch (err: any) {
            throw new SyntaxError(generateError(err.message));
        }
    }

    // HIGHLIGHT ERROR CODE
    static highlightError(code: string) {
        const lines = code ? code.trim().split('\n') : [];
        return chalk.red(lines.map((line) => `> | ${line}`).join('\n'));
    }

    // REMOVE COMMENTS FROM CODE (DON'T TOUCH)
    removeComments(code = '') {
        const blockCommentStart = code.indexOf('//**');
        const blockCommentEnd = code.indexOf('**//');

        if (blockCommentStart !== -1 && (blockCommentEnd === -1 || blockCommentEnd < blockCommentStart)) {
            throw new SyntaxError(
                generateError(
                    `Unclosed block comment (//** ... ${chalk.red('> **// <')})`,
                    this.filePath,
                    code.trim().slice(blockCommentStart, blockCommentStart + 50)
                )
            );
        }

        if (blockCommentEnd !== -1 && blockCommentStart === -1) {
            throw new SyntaxError(
                generateError(
                    `Unopened block comment (${chalk.red('> //** <')} ... **//)`,
                    this.filePath,
                    code.trim().slice(blockCommentEnd - 25, blockCommentEnd + 25)
                )
            );
        }

        return code
            .replace(/\/\/\*\*([\s\S]*?)\*\*\/\//g, '')
            .replace(/\/\/\*(.*)/g, '')
            .trim();
    }

    // PARSE COMMAND DATA FROM CODE (DON'T TOUCH)
    parse() {
        const commandRegex = /@Command\(\s*(\{[\s\S]*?\})?\s*\)(;)?/gi;
        const objectRegex = /@Command\(\s*(\{[\s\S]*?\})\s*\)(;)?/i;
        const cleanedContent = this.removeComments(this.fileContent);

        const matches = [...cleanedContent.matchAll(commandRegex)];
        if (!matches.length)
            throw new SyntaxError(generateError('Missing @Command({ ... }) declaration', this.filePath));
        const commands: Array<Command> = [];

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const commandStart = match.index;
            const commandEnd = commandStart + match[0].length;
            const extractedCode = match[0].match(objectRegex);

            const nextCommandStart = i + 1 < matches.length ? matches[i + 1].index : cleanedContent.length;
            const codeBlock = cleanedContent.slice(commandEnd, nextCommandStart).trim();

            if (!codeBlock) {
                throw new SyntaxError(
                    generateError('Missing code after @Command({ ... }) declaration', this.filePath, match[0])
                );
            }

            try {
                const obj = new Function(`return ${extractedCode ? extractedCode[1] : '{}'}`)();
                if (!obj.name || !obj.type) {
                    throw new SyntaxError(
                        generateError(
                            `@Command({ ... }) declaration is missing ${chalk.red(obj.name ? 'type' : 'name')} property`
                        )
                    );
                }
                commands.push(new Command({ ...obj, code: codeBlock }));
            } catch (err: any) {
                throw new SyntaxError(generateError(err.message, this.filePath, match[0]));
            }
        }

        return Array.isArray(commands) ? commands : [commands];
    }

    // EXECUTE PARSER
    execute() {
        this.readFile();
        return this.parse();
    }
}

export class Command {
    [key: string | symbol | number | `${any}`]: any;

    constructor(options: CommandData) {
        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }
    }
}

// GENERATE ERROR MESSAGE
function generateError(message: string, file?: string, code?: string) {
    return `${message}${file ? ` in ${chalk.yellow(file)}\n\n` : ''}${code ? `${Parser.highlightError(code)}\n` : ''}`;
}
