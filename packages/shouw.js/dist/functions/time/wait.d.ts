import { Functions, type Interpreter } from '../../core';
export default class Wait extends Functions {
    constructor();
    code(ctx: Interpreter, [time]: [string]): Promise<import("../../typings").FunctionResultData>;
}
