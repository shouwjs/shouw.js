import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData, TemporarilyData } from '../../typings';
export default class Get extends Functions {
    constructor();
    code(ctx: Interpreter, [varname]: [string], data: TemporarilyData): Promise<FunctionResultData>;
}
