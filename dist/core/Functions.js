"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFunction = exports.Functions = exports.ParamType = void 0;
var ParamType;
(function (ParamType) {
    ParamType["URL"] = "URL";
    ParamType["String"] = "String";
    ParamType["BigInt"] = "BigInt";
    ParamType["Void"] = "Void";
    ParamType["Number"] = "Number";
    ParamType["Color"] = "Color";
    ParamType["Object"] = "Object";
    ParamType["Array"] = "Array";
    ParamType["Boolean"] = "Boolean";
    ParamType["Any"] = "Any";
})(ParamType || (exports.ParamType = ParamType = {}));
class Functions {
    #name;
    #brackets;
    #description;
    #params;
    constructor(data) {
        this.#name = data.name;
        this.#brackets = data.brackets ?? false;
        this.#description = data.description ?? 'No description provided for this function.';
        this.#params = data.params ?? [];
    }
    code(_ctx, _args, _data) {
        return { result: void 0 };
    }
    get name() {
        return this.#name;
    }
    get brackets() {
        return this.#brackets;
    }
    get description() {
        return this.#description;
    }
    get params() {
        return this.#params;
    }
    get paramsLength() {
        return this.params?.length ?? -1;
    }
    get withParams() {
        return `${this.name}[${this.params?.map((x) => x.name).join(';')}]`;
    }
    getParam(index) {
        return (this.params?.[index] ?? {
            name: 'arg',
            type: ParamType.Any,
            required: false
        });
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    error(...data) {
        return { result: void 0, ...data, error: true };
    }
}
exports.Functions = Functions;
class CustomFunction extends Functions {
    #code;
    #type;
    constructor(data) {
        data.name = data.name.startsWith('$') ? data.name : `$${data.name}`;
        super({
            name: data.name,
            brackets: data.brackets ?? false,
            params: data.params?.map((x) => {
                return {
                    name: x.name,
                    type: x.type ?? ParamType.Any,
                    required: false
                };
            })
        });
        this.#code = data.code;
        this.#type = data.type;
    }
    get codeType() {
        return typeof this.#code;
    }
    get type() {
        return this.#type;
    }
    get stringCode() {
        if (typeof this.#code !== 'string')
            return '';
        return this.#code;
    }
    async code(ctx, args, data) {
        if (typeof this.#code === 'string')
            return this.success();
        return await this.#code(ctx, args, data);
    }
}
exports.CustomFunction = CustomFunction;
