import { Functions, type Interpreter } from '../../core';
export default class Message extends Functions {
    constructor();
    code(ctx: Interpreter, [index]: [number?]): import("../../typings").FunctionResultData;
}
