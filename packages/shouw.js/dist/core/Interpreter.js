"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const _1 = require("./");
const typings_1 = require("../typings");
const utils_1 = require("../utils");
const Discord = require("discord.js");
class Interpreter {
    constructor(cmd, options, extras) {
        this.start = performance.now();
        this.interpreter = Interpreter;
        this.embeds = [];
        this.attachments = [];
        this.stickers = [];
        this.flags = void 0;
        this.message = void 0;
        this.noop = () => { };
        this.discord = Discord;
        this.isError = false;
        this.components = [];
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context;
        this.args = options.args;
        this.helpers = {
            sleep: utils_1.sleep,
            time: _1.Time,
            condition: _1.CheckCondition,
            interpreter: Interpreter,
            unescape: (str) => str.unescape(),
            escape: (str) => str.escape(),
            mustEscape: (str) => str.mustEscape()
        };
        this.Temporarily = (options.Temporarily ?? {
            arrays: {},
            variables: {},
            splits: [],
            randoms: {},
            timezone: void 0
        });
        this.extras = (extras ?? {
            sendMessage: true,
            returnId: false,
            returnResult: true,
            returnError: false,
            returnData: false
        });
    }
    async initialize() {
        try {
            if (typeof this.code === 'function') {
                await this.code(this);
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
                        const arg = this.switchArg((unpacked.args[i] ?? ''), field.type ?? typings_1.ParamType.String);
                        if (field.type !== typings_1.ParamType.Boolean && (!arg || arg === '')) {
                            if (field.required) {
                                await this.error({
                                    message: `Missing required argument ${field.name} on function ${func}!`,
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
                        const processed = this.switchArg(await processFunction(arg), field.type ?? typings_1.ParamType.String);
                        if ((!processed || processed === '') && field.required && field.type !== typings_1.ParamType.Boolean) {
                            await this.error({
                                message: `Missing required argument ${field.name} on function ${func}!`,
                                solution: 'Make sure to add all required argument to the function.'
                            });
                            break;
                        }
                        processedArgs.push(processed);
                    }
                    if (this.isError)
                        break;
                    if (func.match(/\$if$/i)) {
                        const { code: ifCode, error: isError, oldCode: ifOldCode } = await (0, _1.IF)(currentCode, oldCode, this);
                        this.isError = isError;
                        currentCode = isError ? ifCode : await processFunction(ifCode);
                        oldCode = ifOldCode;
                        break;
                    }
                    unpacked.args = processedArgs;
                    if (this.isError)
                        break;
                    const DATA = (0, utils_1.filterObject)(await functionData.code(this, processedArgs, this.Temporarily)) ??
                        {};
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
            return ((0, utils_1.filterObject)({
                result: this.code ?? '',
                id: this.message?.id ?? void 0,
                error: this.isError ?? false,
                data: {
                    ...this.Temporarily,
                    embeds: this.embeds ?? [],
                    components: this.components ?? [],
                    attachments: this.attachments ?? [],
                    flags: this.flags ?? void 0
                }
            }) ?? {});
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
        if (openBracketIndex === -1)
            return { func, args: [], brackets: false, all: func };
        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return { func, args: [], brackets: false, all: func };
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
            return { func, args: [], brackets: false, all: func };
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
        return (0, utils_1.filterArray)(functions) ?? [];
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    async error(options) {
        try {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            this.isError = true;
            this.message = await this.context?.send(`\`\`\`\n🚫 ${message}${solution ? `\n\nSo, what is the solution?\n${solution}` : ''}\`\`\``);
        }
        catch {
            this.isError = true;
            this.client.debug(typeof options === 'string' ? options : options.message, 'ERROR', true);
        }
        return { result: void 0, error: true };
    }
    switchArg(arg, type) {
        if (!arg || arg === '' || typings_1.ParamType.Void === type)
            return void 0;
        switch (type) {
            case typings_1.ParamType.String:
                return arg.toString();
            case typings_1.ParamType.BigInt:
                return BigInt(arg);
            case typings_1.ParamType.Number:
                return Number(arg);
            case typings_1.ParamType.Boolean:
                return arg.toBoolean();
            case typings_1.ParamType.Object:
                return arg.toObject();
            case typings_1.ParamType.Array:
                return arg.toObject();
            case typings_1.ParamType.URL:
                return arg.toURL();
            default:
                return void 0;
        }
    }
}
exports.Interpreter = Interpreter;
