import * as fs from 'node:fs';
import * as chalk from 'chalk';

interface CommandObject {
    name?: string;
    type: string;
    code: string;
    [key: string | symbol | number | `${any}`]: any;
}

export class Parser {
    filePath: string;
    fileContent = '';

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    readFile() {
        try {
            this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        } catch (err: any) {
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
            throw new ShouwParseError(
                'Unclosed block comment (//** ... **//)',
                this.filePath,
                code.trim().slice(0, 50)
            );
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
        if (!matches.length) throw new ShouwParseError('Missing @Command({ ... }) declaration', this.filePath);
        const commands: Array<Command> = [];

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
                    throw new ShouwParseError(
                        `@Command({ ... }) declaration is missing ${chalk.red(obj.name ? 'type' : 'name')} property`
                    );
                }
                commands.push(new Command({ ...obj, code: codeBlock }));
            } catch (err: any) {
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

export class ShouwParseError extends SyntaxError {
    constructor(message: string, file?: string, code?: string) {
        super(
            `${message}${file ? `in ${chalk.yellow(file)}` : ''}${code ? `\n\n${Parser.highlightError(code)}\n` : ''}`
        );
        this.name = 'ShouwParseError';
        Error.captureStackTrace(this, new Parser('').execute);
    }
}

export class Command {
    [key: string | symbol | number | `${any}`]: any;

    constructor(options: CommandObject) {
        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }
    }
}
