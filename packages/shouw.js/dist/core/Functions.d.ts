import type { ParamType, FunctionData, FunctionResultData, TemporarilyData } from '../typings';
import type { Interpreter } from './Interpreter';
export declare class Functions {
    #private;
    constructor(data: FunctionData);
    code(_ctx: Interpreter, _args: Array<unknown>, _data: TemporarilyData): Promise<FunctionResultData> | FunctionResultData;
    get name(): string | undefined;
    get brackets(): boolean | undefined;
    get description(): string | undefined;
    get type(): string | undefined;
    get params(): {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[] | undefined;
    get paramsLength(): number;
    get withParams(): string;
    getParams(index: number): {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    } | undefined;
    success(result?: any, error?: boolean, ...data: FunctionResultData[]): FunctionResultData;
    error(...data: FunctionResultData[]): FunctionResultData;
}
