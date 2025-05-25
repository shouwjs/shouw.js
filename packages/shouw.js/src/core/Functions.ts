import type { ParamType, FunctionData, FunctionResultData, TemporarilyData } from '../typings';
import type { Interpreter } from './Interpreter';

export class Functions {
    readonly #name?: string;
    readonly #brackets?: boolean;
    readonly #description?: string;
    readonly #type?: string;
    readonly #params?: {
        name?: string;
        description?: string;
        required?: boolean;
        type?: ParamType;
    }[];

    constructor(data: FunctionData) {
        if (!data) return;
        this.#name = data.name;
        this.#brackets = data.brackets;
        this.#description = data.description;
        this.#type = data.type;
        this.#params = data.params ?? [];
    }

    // FUNCTION CODE
    public code(
        _ctx: Interpreter,
        _args: Array<unknown>,
        _data: TemporarilyData
    ): Promise<FunctionResultData> | FunctionResultData {
        return { result: void 0 };
    }

    // FUNCTION NAME
    public get name(): string | undefined {
        return this.#name;
    }

    // FUNCTION BRACKETS
    public get brackets(): boolean | undefined {
        return this.#brackets;
    }

    // FUNCTION DESCRIPTION
    public get description(): string | undefined {
        return this.#description;
    }

    // FUNCTION TYPE
    public get type(): string | undefined {
        return this.#type;
    }

    // FUNCTION PARAMETERS
    public get params():
        | {
              name?: string;
              description?: string;
              required?: boolean;
              type?: ParamType;
          }[]
        | undefined {
        return this.#params;
    }

    public get paramsLength(): number {
        return this.params?.length ?? -1;
    }

    public get withParams(): string {
        return `${this.name}[${this.params?.map((x) => x.name).join(';')}]`;
    }

    public getParams(index: number):
        | {
              name?: string;
              description?: string;
              required?: boolean;
              type?: ParamType;
          }
        | undefined {
        return this.params?.[index];
    }

    // FUNCTION SUCCESS RESULT
    public success(result: any = void 0, error?: boolean, ...data: FunctionResultData[]): FunctionResultData {
        return { ...data, result, error };
    }
}
