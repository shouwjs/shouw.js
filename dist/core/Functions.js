"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.ParamType = void 0;
var ParamType;
(function (ParamType) {
    ParamType[ParamType["URL"] = 0] = "URL";
    ParamType[ParamType["String"] = 1] = "String";
    ParamType[ParamType["BigInt"] = 2] = "BigInt";
    ParamType[ParamType["Void"] = 3] = "Void";
    ParamType[ParamType["Number"] = 4] = "Number";
    ParamType[ParamType["Object"] = 5] = "Object";
    ParamType[ParamType["Array"] = 6] = "Array";
    ParamType[ParamType["Boolean"] = 8] = "Boolean";
})(ParamType || (exports.ParamType = ParamType = {}));
class Functions {
    #name;
    #brackets;
    #description;
    #type;
    #params;
    constructor(data) {
        if (!data)
            return;
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
    getParams(index) {
        return this.params?.[index];
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    error(...data) {
        return { result: void 0, ...data, error: true };
    }
}
exports.Functions = Functions;
