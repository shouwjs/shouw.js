import { Functions, type Interpreter } from '../../core';
export default class Description extends Functions {
    constructor();
    code(ctx: Interpreter, [text, index]: [string, number?]): import("../../typings").FunctionResultData;
}
