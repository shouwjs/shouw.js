import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class Description extends Functions {
    constructor();
    code(ctx: Interpreter, [text, index]: [string, number?]): FunctionResultData;
}
