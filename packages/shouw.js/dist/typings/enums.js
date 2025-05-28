"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Precedence = exports.ParamType = void 0;
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
var Precedence;
(function (Precedence) {
    Precedence[Precedence["&&"] = 1] = "&&";
    Precedence[Precedence["||"] = 1] = "||";
    Precedence[Precedence["=="] = 2] = "==";
    Precedence[Precedence["!="] = 2] = "!=";
    Precedence[Precedence[">="] = 3] = ">=";
    Precedence[Precedence["<="] = 3] = "<=";
    Precedence[Precedence[">"] = 3] = ">";
    Precedence[Precedence["<"] = 3] = "<";
})(Precedence || (exports.Precedence = Precedence = {}));
