import type { Interpreter } from '../core/Interpreter';
export declare class Util {
    static isUnicodeEmoji(str: string): boolean;
    static getEmoji(ctx: Interpreter, _emojiInput: string, onlyId?: boolean): Promise<any>;
}
