import type { CommandData } from '../typings';
export declare class Parser {
    filePath: string;
    fileContent: string;
    constructor(filePath: string);
    readFile(): void;
    static highlightError(code: string): string;
    removeComments(code?: string): string;
    parse(): Command[];
    execute(): Command[];
}
export declare class Command {
    [key: string | symbol | number | `${any}`]: any;
    constructor(options: CommandData);
}
