import { Functions, type Interpreter } from '../../core';
export default class CheckCondition extends Functions {
    constructor();
    code(ctx: Interpreter, [condition]: [string]): import("../../typings").FunctionResultData;
}
