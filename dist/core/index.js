"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Interpreter.js"), exports);
__exportStar(require("./Context.js"), exports);
__exportStar(require("./Functions.js"), exports);
__exportStar(require("./Conditions.js"), exports);
__exportStar(require("./IF.js"), exports);
__exportStar(require("./Time.js"), exports);
__exportStar(require("./Reader.js"), exports);
__exportStar(require("./Parsers.js"), exports);
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
        .replace(/\\$/g, '#CHAR#')
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
        return JSON.parse((str ?? this));
    }
    catch {
        return {};
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
    return false;
};
