import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class Ping extends Functions {
    constructor();
    code(ctx: Interpreter): FunctionResultData;
}
