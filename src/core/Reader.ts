import * as fs from 'node:fs';
import chalk from 'chalk';
import type { CommandData } from '../index.js';

/**
 * The reader class to read and parse the custom commands files and return the parsed commands
 *
 * @class Reader
 * @param {string} filePath - The path to the file
 */
export class Reader {
    /**
     * The path to the file
     */
    private readonly filePath: string;

    /**
     * The content of the file
     */
    private fileContent = '';

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Run the reader and return the parsed commands
     *
     * @param {string} filePath - The path to the file
     * @return {Array<CommandData>} - The parsed commands
     */
    public static run(filePath: string): CommandData[] {
        return new Reader(filePath).execute();
    }

    /**
     * Read the file content and store it in the fileContent variable
     *
     * @return {void} - Nothing
     * @private
     */
    private readFile(): undefined {
        try {
            this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        } catch (err: any) {
            throw new SyntaxError(generateError(err.message));
        }
    }

    /**
     * Removing comments from the code to make it easier to parse
     *
     * @param {string} [code] - The code to remove comments from
     * @return {string} - The code without comments
     */
    private removeComments(code = ''): string {
        const start = code.indexOf('/*');
        const end = code.indexOf('*/');

        if (start !== -1 && (end === -1 || end < start)) {
            throw new SyntaxError(
                generateError(
                    `Unclosed block comment (/* ... ${chalk.red('> */ <')})`,
                    this.filePath,
                    code.trim().slice(start, start + 50)
                )
            );
        }

        let result = '';
        let i = 0;

        while (i < code.length) {
            const blockStart = code.indexOf('/*', i);
            const lineStart = code.indexOf('//', i);

            if (blockStart === -1 && lineStart === -1) {
                result += code.slice(i);
                break;
            }

            if (blockStart !== -1 && (lineStart === -1 || blockStart < lineStart)) {
                result += code.slice(i, blockStart);
                const blockEnd = code.indexOf('*/', blockStart + 2);
                i = blockEnd !== -1 ? blockEnd + 2 : code.length;
            } else {
                result += code.slice(i, lineStart);
                const lineEnd = code.indexOf('\n', lineStart);
                i = lineEnd !== -1 ? lineEnd : code.length;
            }
        }

        return result.trim();
    }

    /**
     * Parse the file content and return the parsed commands as an array of CommandData objects
     *
     * @return {Array<CommandData>} - The parsed commands
     * @private
     */
    private parse(): CommandData[] {
        const commandRegex = /@Command\(\s*(\{[\s\S]*?\})?\s*\)(;)?/gi;
        const objectRegex = /@Command\(\s*(\{[\s\S]*?\})\s*\)(;)?/i;
        const cleanedContent = this.removeComments(this.fileContent);

        const matches: RegExpExecArray[] = [...cleanedContent.matchAll(commandRegex)];
        if (!matches.length)
            throw new SyntaxError(generateError('Missing @Command({ ... }) declaration', this.filePath));
        const commands: Array<CommandData> = [];

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
                obj.type = obj.type ?? 'messageCreate';
                commands.push({ ...obj, code: codeBlock });
            } catch (err: any) {
                throw new SyntaxError(generateError(err.message, this.filePath, match[0]));
            }
        }

        return Array.isArray(commands) ? commands : [commands];
    }

    /**
     * Execute the reader and return the parsed commands as an array of CommandData objects
     *
     * @return {Array<CommandData>} - The parsed commands
     */
    private execute(): CommandData[] {
        this.readFile();
        return this.parse();
    }
}

/**
 * Generate an error message
 *
 * @param {string} message - The error message
 * @param {string} [file] - The file path
 * @param {string} [code] - The code snippet
 * @return {string} - The generated error message
 */
function generateError(message: string, file?: string, code?: string): string {
    return `${message}${file ? ` in ${chalk.yellow(file)}\n\n` : ''}${code ? `${highlightError(code)}\n` : ''}`;
}

/**
 * Highlight an error message
 *
 * @param {string} code - The code snippet
 * @return {string} - The highlighted error message
 */
function highlightError(code: string): string {
    const lines = code ? code.trim().split('\n') : [];
    return chalk.red(lines.map((line) => `> | ${line}`).join('\n'));
}
