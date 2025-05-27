import { Functions, type Interpreter } from '../../core';
export default class Get extends Functions {
    constructor();
    code(ctx: Interpreter, [varname]: [string], data: Interpreter['Temporarily']): Promise<import("../../typings").FunctionResultData>;
}
