"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Functions_name, _Functions_brackets, _Functions_description, _Functions_type, _Functions_params;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = void 0;
class Functions {
    constructor(data) {
        _Functions_name.set(this, void 0);
        _Functions_brackets.set(this, void 0);
        _Functions_description.set(this, void 0);
        _Functions_type.set(this, void 0);
        _Functions_params.set(this, void 0);
        if (!data)
            return;
        __classPrivateFieldSet(this, _Functions_name, data.name, "f");
        __classPrivateFieldSet(this, _Functions_brackets, data.brackets, "f");
        __classPrivateFieldSet(this, _Functions_description, data.description, "f");
        __classPrivateFieldSet(this, _Functions_type, data.type, "f");
        __classPrivateFieldSet(this, _Functions_params, data.params ?? [], "f");
    }
    // FUNCTION CODE
    code(_ctx, _args, _data) {
        return { result: void 0 };
    }
    // FUNCTION NAME
    get name() {
        return __classPrivateFieldGet(this, _Functions_name, "f");
    }
    // FUNCTION BRACKETS
    get brackets() {
        return __classPrivateFieldGet(this, _Functions_brackets, "f");
    }
    // FUNCTION DESCRIPTION
    get description() {
        return __classPrivateFieldGet(this, _Functions_description, "f");
    }
    // FUNCTION TYPE
    get type() {
        return __classPrivateFieldGet(this, _Functions_type, "f");
    }
    // FUNCTION PARAMETERS
    get params() {
        return __classPrivateFieldGet(this, _Functions_params, "f");
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
    // FUNCTION SUCCESS AND ERROR RESULT
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    error(...data) {
        return { result: void 0, ...data, error: true };
    }
}
exports.Functions = Functions;
_Functions_name = new WeakMap(), _Functions_brackets = new WeakMap(), _Functions_description = new WeakMap(), _Functions_type = new WeakMap(), _Functions_params = new WeakMap();
