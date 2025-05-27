import { Functions, type Interpreter } from '../../core';
export default class Let extends Functions {
    constructor();
    code(_ctx: Interpreter, [varname, value]: [string, string], data: Interpreter['Temporarily']): import("../../typings").FunctionResultData;
}
