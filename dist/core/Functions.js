"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.ParamType = void 0;
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
    #type;
    #params;
    constructor(data) {
        this.#name = data.name;
        this.#brackets = data.brackets ?? false;
        this.#description = data.description ?? 'No description provided for this function.';
        this.#type = data.type ?? 'shouw.js';
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
    get type() {
        return this.#type;
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
