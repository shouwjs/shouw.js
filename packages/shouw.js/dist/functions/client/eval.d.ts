import { Functions, Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class Eval extends Functions {
    constructor();
    code(ctx: Interpreter, [code, sendMessage, returnId, returnResult, returnError, returnData]: [
        string,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean
    ]): Promise<FunctionResultData>;
}
