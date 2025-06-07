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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const index_js_1 = require("../index.js");
const Discord = __importStar(require("discord.js"));
class Interpreter {
    client;
    functions;
    debug;
    start = performance.now();
    interpreter = Interpreter;
    code;
    command;
    channel;
    guild;
    member;
    user;
    context;
    args;
    embeds = [];
    attachments = [];
    stickers = [];
    flags = [];
    message = void 0;
    interaction = void 0;
    noop = () => { };
    helpers;
    Temporarily;
    discord = Discord;
    util = index_js_1.Util;
    extras;
    isError = false;
    components = [];
    constructor(cmd, options, extras) {
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.message = options.message;
        this.interaction = options.interaction;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context;
        this.args = options.args;
        this.helpers = {
            parser: index_js_1.Parser,
            sleep: index_js_1.sleep,
            time: index_js_1.Time,
            condition: index_js_1.CheckCondition,
            interpreter: Interpreter,
            unescape: (str) => str.unescape(),
            escape: (str) => str.escape(),
            mustEscape: (str) => str.mustEscape()
        };
        this.Temporarily = {
            ...options.Temporarily,
            arrays: {},
            variables: {},
            splits: [],
            randoms: {},
            timezone: void 0
        };
        this.extras = {
            sendMessage: extras?.sendMessage ?? true,
            returnId: extras?.returnId ?? false,
            returnResult: extras?.returnResult ?? true,
            returnError: extras?.returnError ?? false,
            returnData: extras?.returnData ?? false
        };
        if (!this.context || !(this.context instanceof index_js_1.Context)) {
            this.context = new index_js_1.Context(this.message ??
                this.interaction ??
                {
                    client: this.client,
                    channel: this.channel,
                    guild: this.guild,
                    member: this.member,
                    user: this.user
                }, this.args ?? []);
        }
    }
    async initialize() {
        try {
            if (typeof this.code === 'function') {
                await this.code(this, this.context, this.Temporarily);
                return {};
            }
            const processFunction = async (code) => {
                const functions = this.extractFunctions(code);
                if (functions.length === 0)
                    return code;
                let oldCode = code;
                let currentCode = code;
                for (const func of functions) {
                    if (this.isError || !oldCode || oldCode.trim() === '')
                        break;
                    const unpacked = this.unpack(func, oldCode);
                    const functionData = this.functions.get(func);
                    if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                        continue;
                    if (functionData.brackets && !unpacked.brackets) {
                        await this.error({
                            message: `Invalid ${func} usage: Missing brackets`,
                            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
                        });
                        break;
                    }
                    if (this.isError)
                        break;
                    const processedArgs = [];
                    for (let i = 0; i < functionData.paramsLength; i++) {
                        const field = functionData.getParams(i);
                        if (!field)
                            break;
                        const arg = this.switchArg((unpacked.args[i] ?? ''), field.type ?? index_js_1.ParamType.String);
                        if (field.type !== index_js_1.ParamType.Boolean && (!arg || arg === '')) {
                            if (field.required) {
                                await this.error({
                                    message: `Missing required argument "${field.name}" on function ${func}!`,
                                    solution: 'Make sure to add all required argument to the function.'
                                });
                                break;
                            }
                            processedArgs.push(void 0);
                            continue;
                        }
                        if ((typeof arg === 'string' && !arg.match(/\$/g)) || typeof arg !== 'string') {
                            processedArgs.push(arg);
                            continue;
                        }
                        const processed = this.switchArg(await processFunction(arg), field.type ?? index_js_1.ParamType.String);
                        if ((!processed || processed === '') && field.required && field.type !== index_js_1.ParamType.Boolean) {
                            await this.error({
                                message: `Missing required argument "${field.name}" on function ${func}!`,
                                solution: 'Make sure to add all required argument to the function.'
                            });
                            break;
                        }
                        processedArgs.push(processed);
                    }
                    if (this.isError)
                        break;
                    if (func.match(/\$if$/i)) {
                        const { code: ifCode, error: isError, oldCode: ifOldCode } = await (0, index_js_1.IF)(currentCode, oldCode, this);
                        this.isError = isError;
                        currentCode = isError ? ifCode : await processFunction(ifCode);
                        oldCode = ifOldCode;
                        break;
                    }
                    unpacked.args = processedArgs;
                    if (this.isError)
                        break;
                    let DATA = { result: void 0 };
                    try {
                        DATA =
                            (await functionData.code(this, processedArgs, this.Temporarily)) ??
                                {};
                    }
                    catch (err) {
                        await this.error(err, func);
                        this.client.debug(`${err?.stack ?? err}`, 'ERROR', true);
                        DATA = { result: void 0, error: true };
                    }
                    currentCode = currentCode.replace(unpacked.all, () => DATA.result?.toString() ?? '');
                    oldCode = oldCode.replace(unpacked.all, '');
                    if (this.isError || DATA.error === true) {
                        this.isError = true;
                        break;
                    }
                    for (const [key, value] of Object.entries(DATA)) {
                        if (!key || !value || !Object.hasOwn(this, key))
                            continue;
                        this[key] = value;
                    }
                }
                return currentCode.trim();
            };
            const result = (await processFunction(this.code)).unescape();
            const end = (performance.now() - this.start).toFixed(2).toString();
            this.code = result.replace(/\$executionTime/gi, end);
            this.embeds = JSON.parse(JSON.stringify(this.embeds).replace(/\$executionTime/gi, end));
            if (this.extras.sendMessage === true &&
                this.isError === false &&
                ((this.code && this.code !== '') ||
                    this.components.length > 0 ||
                    this.embeds.length > 0 ||
                    this.attachments.length > 0 ||
                    this.stickers.length > 0)) {
                this.message = (await this.context?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds.filter(Boolean),
                    components: this.components.filter(Boolean),
                    files: this.attachments.filter(Boolean),
                    flags: (Array.isArray(this.flags) ? this.flags.filter(Boolean) : this.flags)
                }));
            }
            return {
                ...(this.extras.returnResult ? { result: this.code } : {}),
                ...(this.extras.returnId ? { id: this.message?.id } : {}),
                ...(this.extras.returnError ? { error: this.isError } : {}),
                ...(this.extras.returnData
                    ? {
                        data: {
                            ...this.Temporarily,
                            embeds: this.embeds,
                            components: this.components,
                            attachments: this.attachments,
                            flags: this.flags
                        }
                    }
                    : {})
            };
        }
        catch (err) {
            this.client.debug(`${err?.stack ?? err}`, 'ERROR', true);
            return {};
        }
    }
    unpack(func, code) {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1)
            return { func, args: [], brackets: false, all: null };
        const openBracketIndex = code.indexOf('[', funcStart);
        const onlyFunction = code.slice(funcStart, funcStart + func.length);
        if (openBracketIndex === -1)
            return { func, args: [], brackets: false, all: onlyFunction };
        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return { func, args: [], brackets: false, all: onlyFunction };
        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;
        while (closeBracketIndex < code.length) {
            if (code.charAt(closeBracketIndex) === '[') {
                bracketStack++;
            }
            else if (code.charAt(closeBracketIndex) === ']') {
                bracketStack--;
                if (bracketStack === 0)
                    break;
            }
            closeBracketIndex++;
        }
        if (closeBracketIndex >= code.length || bracketStack > 0)
            return { func, args: [], brackets: false, all: onlyFunction };
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return { func, args: args, brackets: true, all };
    }
    extractArguments(argsStr) {
        const args = [];
        let depth = 0;
        let currentArg = '';
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr.charAt(i);
            if (char === '[') {
                depth++;
                currentArg += char;
            }
            else if (char === ']') {
                depth--;
                currentArg += char;
            }
            else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            }
            else {
                currentArg += char;
            }
        }
        if (currentArg.trim())
            args.push(currentArg.trim());
        return args.map((arg) => {
            if (arg !== '')
                return arg;
            return void 0;
        });
    }
    extractFunctions(code) {
        const functions = [];
        const splited = code.split(/\$/g);
        for (const part of splited) {
            const matchingFunctions = this.functions.K.filter((func) => func && func.toLowerCase() === `$${part.toLowerCase()}`.slice(0, func.length));
            if (matchingFunctions.length === 1) {
                functions.push(matchingFunctions[0]);
            }
            else if (matchingFunctions.length > 1) {
                functions.push(matchingFunctions.sort((a, b) => b.length - a.length)[0]);
            }
        }
        return (0, index_js_1.filterArray)(functions) ?? [];
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    async error(options, functionName) {
        try {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            this.isError = true;
            this.message = await this.context?.send(`\`\`\`\n${functionName ? `${functionName}: ` : ''}🚫 ${message}${solution ? `\n\nSo, what is the solution?\n${solution}` : ''}\`\`\``);
        }
        catch {
            this.isError = true;
            this.client.debug(typeof options === 'string' ? options : options.message, 'ERROR', true);
        }
        return { result: void 0, error: true };
    }
    switchArg(arg, type) {
        if (!arg || arg === '' || index_js_1.ParamType.Void === type)
            return void 0;
        switch (type) {
            case index_js_1.ParamType.String:
                return arg.toString();
            case index_js_1.ParamType.BigInt:
                return BigInt(arg);
            case index_js_1.ParamType.Number:
                return Number(arg);
            case index_js_1.ParamType.Boolean:
                return arg.toBoolean();
            case index_js_1.ParamType.Object:
                return arg.toObject();
            case index_js_1.ParamType.Array:
                return arg.toObject();
            case index_js_1.ParamType.URL:
                return arg.toURL();
            default:
                return void 0;
        }
    }
}
exports.Interpreter = Interpreter;
