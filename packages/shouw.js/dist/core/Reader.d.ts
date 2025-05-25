interface CommandObject {
    name?: string;
    type: string;
    code: string;
    [key: string | symbol | number | `${any}`]: any;
}
export declare class Parser {
    filePath: string;
    fileContent: string;
    constructor(filePath: string);
    readFile(): void;
    static highlightError(code: any): string;
    removeComments(code?: string): string;
    parse(): Command[];
    execute(): Command[];
}
export declare class ShouwParseError extends SyntaxError {
    constructor(message: string, file?: string, code?: string);
}
export declare class Command {
    [key: string | symbol | number | `${any}`]: any;
    constructor(options: CommandObject);
}
export {};
