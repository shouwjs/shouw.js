import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class SendMessage extends Functions {
    constructor();
    code(ctx: Interpreter, [content, returnId]: [string, boolean]): Promise<FunctionResultData>;
}
