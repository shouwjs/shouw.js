import { Functions, type Interpreter } from '../../core';
export default class Ping extends Functions {
    constructor();
    code(ctx: Interpreter): import("../..").FunctionResultData;
}
