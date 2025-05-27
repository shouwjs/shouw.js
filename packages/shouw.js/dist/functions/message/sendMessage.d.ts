import { Functions, type Interpreter } from '../../core';
export default class SendMessage extends Functions {
    constructor();
    code(ctx: Interpreter, [content, returnId]: [string, boolean?]): Promise<import("../../typings").FunctionResultData>;
}
