"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reader = exports.Time = exports.CheckCondition = exports.ParamType = exports.Functions = exports.Context = exports.parseButton = exports.parseGalleryV2 = exports.parseSectionV2 = exports.parseSeparatorV2 = exports.ComponentsV2Parser = exports.PollParser = exports.FlagsParser = exports.AttachmentParser = exports.ActionRowParser = exports.EmbedParser = exports.CustomParser = exports.Parser = exports.IF = exports.Container = exports.Interpreter = void 0;
const index_js_1 = require("./Interpreter/index.js");
Object.defineProperty(exports, "Interpreter", { enumerable: true, get: function () { return index_js_1.Interpreter; } });
Object.defineProperty(exports, "Container", { enumerable: true, get: function () { return index_js_1.Container; } });
Object.defineProperty(exports, "IF", { enumerable: true, get: function () { return index_js_1.IF; } });
Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return index_js_1.Parser; } });
Object.defineProperty(exports, "CustomParser", { enumerable: true, get: function () { return index_js_1.CustomParser; } });
Object.defineProperty(exports, "EmbedParser", { enumerable: true, get: function () { return index_js_1.EmbedParser; } });
Object.defineProperty(exports, "ActionRowParser", { enumerable: true, get: function () { return index_js_1.ActionRowParser; } });
Object.defineProperty(exports, "AttachmentParser", { enumerable: true, get: function () { return index_js_1.AttachmentParser; } });
Object.defineProperty(exports, "FlagsParser", { enumerable: true, get: function () { return index_js_1.FlagsParser; } });
Object.defineProperty(exports, "PollParser", { enumerable: true, get: function () { return index_js_1.PollParser; } });
Object.defineProperty(exports, "ComponentsV2Parser", { enumerable: true, get: function () { return index_js_1.ComponentsV2Parser; } });
Object.defineProperty(exports, "parseSeparatorV2", { enumerable: true, get: function () { return index_js_1.parseSeparatorV2; } });
Object.defineProperty(exports, "parseSectionV2", { enumerable: true, get: function () { return index_js_1.parseSectionV2; } });
Object.defineProperty(exports, "parseGalleryV2", { enumerable: true, get: function () { return index_js_1.parseGalleryV2; } });
Object.defineProperty(exports, "parseButton", { enumerable: true, get: function () { return index_js_1.parseButton; } });
const Context_js_1 = require("./Context.js");
Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return Context_js_1.Context; } });
const Functions_js_1 = require("./Functions.js");
Object.defineProperty(exports, "Functions", { enumerable: true, get: function () { return Functions_js_1.Functions; } });
Object.defineProperty(exports, "ParamType", { enumerable: true, get: function () { return Functions_js_1.ParamType; } });
const Conditions_js_1 = require("./Conditions.js");
Object.defineProperty(exports, "CheckCondition", { enumerable: true, get: function () { return Conditions_js_1.CheckCondition; } });
const Time_js_1 = require("./Time.js");
Object.defineProperty(exports, "Time", { enumerable: true, get: function () { return Time_js_1.Time; } });
const Reader_js_1 = require("./Reader.js");
Object.defineProperty(exports, "Reader", { enumerable: true, get: function () { return Reader_js_1.Reader; } });
String.prototype.unescape = function (str) {
    return (str ?? this)
        .replace(/#RIGHT#/g, '[')
        .replace(/#LEFT#/g, ']')
        .replace(/#SEMI#/g, ';')
        .replace(/#COLON#/g, ':')
        .replace(/#CHAR#/g, '$')
        .replace(/#RIGHT_CLICK#/g, '>')
        .replace(/#LEFT_CLICK#/g, '<')
        .replace(/#EQUAL#/g, '=')
        .replace(/#RIGHT_BRACKET#/g, '{')
        .replace(/#LEFT_BRACKET#/g, '}')
        .replace(/#COMMA#/g, ',')
        .replace(/#LB#/g, '(')
        .replace(/#RB#/g, ')')
        .replace(/#AND#/g, '&&')
        .replace(/#OR#/g, '||');
};
String.prototype.escape = function (str) {
    return (str ?? this)
        .replace(/\[/g, '#RIGHT#')
        .replace(/]/g, '#LEFT#')
        .replace(/;/g, '#SEMI#')
        .replace(/:/g, '#COLON#')
        .replace(/\$/g, '#CHAR#')
        .replace(/>/g, '#RIGHT_CLICK#')
        .replace(/</g, '#LEFT_CLICK#')
        .replace(/=/g, '#EQUAL#')
        .replace(/{/g, '#RIGHT_BRACKET#')
        .replace(/}/g, '#LEFT_BRACKET#')
        .replace(/,/g, '#COMMA#')
        .replace(/\(/g, '#LB#')
        .replace(/\)/g, '#RB#')
        .replace(/&&/g, '#AND#')
        .replace(/\|\|/g, '#OR#');
};
String.prototype.mustEscape = function (str) {
    return (str ?? this)
        .replace(/\\\[/g, '#RIGHT#')
        .replace(/\\]/g, '#LEFT#')
        .replace(/\\;/g, '#SEMI#')
        .replace(/\\:/g, '#COLON#')
        .replace(/\\\$/g, '#CHAR#')
        .replace(/\\>/g, '#RIGHT_CLICK#')
        .replace(/\\</g, '#LEFT_CLICK#')
        .replace(/\\=/g, '#EQUAL#')
        .replace(/\\{/g, '#RIGHT_BRACKET#')
        .replace(/\\}/g, '#LEFT_BRACKET#')
        .replace(/\\,/g, '#COMMA#')
        .replace(/\\&&/g, '#AND#')
        .replace(/\\\|\|/g, '#OR#');
};
String.prototype.toObject = function (str) {
    try {
        const parsed = JSON.parse((str ?? this));
        if (typeof parsed !== 'object' || Array.isArray(parsed))
            return void 0;
        return parsed;
    }
    catch {
        return void 0;
    }
};
String.prototype.toArray = function (str) {
    try {
        const parsed = JSON.parse((str ?? this));
        if (typeof parsed !== 'object' || !Array.isArray(parsed))
            return void 0;
        return parsed;
    }
    catch {
        return void 0;
    }
};
String.prototype.toURL = function (str) {
    try {
        return new URL((str ?? this)).toString();
    }
    catch {
        return void 0;
    }
};
String.prototype.toBoolean = function (string) {
    const str = (string ?? this).toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') {
        return true;
    }
    if (str === 'false' || str === '0' || str === 'no') {
        return false;
    }
    return void 0;
};
