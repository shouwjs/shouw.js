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
const index_js_1 = require("../../index.js");
const Container_js_1 = require("./Container.js");
const Discord = __importStar(require("discord.js"));
class Interpreter extends Container_js_1.Container {
    static async run(command, options, extras) {
        return await new Interpreter(command, options, extras).initialize();
    }
    async initialize() {
        try {
            if (typeof this.code === 'function') {
                await this.code(this, this.context, this.Temporarily);
                return new Object();
            }
            const result = await this.processFunction(this.code);
            this.replaceExecutionTime(result);
            if (this.shouldSendMessage()) {
                this.message = (await this.getSendableChannel()?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds.filter(Boolean),
                    components: this.components.filter(Boolean),
                    files: this.attachments.filter(Boolean),
                    flags: (Array.isArray(this.flags) ? this.flags.filter(Boolean) : this.flags)
                }));
            }
        }
        catch (err) {
            await this.error(err);
        }
        return this.buildResult();
    }
    async processFunction(input) {
        const code = input.mustEscape();
        const functions = this.extractFunctions(code);
        if (!functions.length)
            return input;
        let oldCode = code;
        let currentCode = code;
        for (const func of functions) {
            if (this.isError)
                break;
            const unpacked = this.unpack(func, oldCode);
            const functionData = this.functions.get(func);
            if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                continue;
            if (functionData.brackets && !unpacked.brackets) {
                await this.error(index_js_1.Constants.Errors.missingBrackets(func, functionData));
                break;
            }
            if (this.isError)
                break;
            const processedArgs = await this.processArgs(unpacked.args, functionData);
            if (func.match(/\$if$/i)) {
                if (this.isError)
                    break;
                const { code: ifCode, error: isError } = await (0, index_js_1.IF)(currentCode, this);
                this.setError(isError);
                if (this.isError)
                    break;
                currentCode = await this.processFunction(ifCode);
                break;
            }
            try {
                if (this.isError)
                    break;
                const DATA = ((await functionData.code(this, processedArgs, this.Temporarily)) ??
                    {});
                currentCode = currentCode.replace(unpacked.all, () => DATA.result?.toString().mustEscape() ?? '');
                oldCode = oldCode.replace(unpacked.all, '');
                if (this.isError || DATA.error === true)
                    this.setError(true);
                for (const [key, value] of Object.entries(DATA)) {
                    if (!key || !value || !Object.hasOwn(this, key))
                        continue;
                    this[key] = value;
                }
            }
            catch (err) {
                await this.error(err, func);
            }
        }
        return currentCode.trim();
    }
    async processArgs(args, functionData) {
        const processedArgs = [];
        const totalArgs = Math.max(args.length, functionData.paramsLength);
        for (let i = 0; i < totalArgs; i++) {
            const param = functionData.getParam(i);
            const isVoid = (v) => param.type !== index_js_1.ParamType.Void && (v === undefined || v === null || v === '');
            if (param.rest) {
                const joined = args.slice(i).join(';');
                const result = await this.switchArg(await this.processFunction(joined), param.type ?? index_js_1.ParamType.String, functionData);
                if (this.isError)
                    break;
                if (param.required && isVoid(result)) {
                    await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                    break;
                }
                processedArgs.push(result);
                break;
            }
            const input = (args[i] ?? '');
            const arg = await this.switchArg(input, param.type ?? index_js_1.ParamType.String, functionData);
            if (this.isError)
                break;
            if (isVoid(arg)) {
                if (param.required) {
                    await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                    break;
                }
                processedArgs.push(undefined);
                continue;
            }
            const isDirect = (typeof arg === 'string' && !arg.includes('$')) || arg === '$' || typeof arg !== 'string';
            if (isDirect) {
                processedArgs.push(arg);
                continue;
            }
            const processed = await this.switchArg(await this.processFunction(arg), param.type ?? index_js_1.ParamType.String, functionData);
            if (this.isError)
                break;
            if (param.required && isVoid(processed)) {
                await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                break;
            }
            processedArgs.push(processed);
        }
        return processedArgs;
    }
    unpack(func, code) {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1)
            return returnUnpack(func, [], false, null);
        const openBracketIndex = code.indexOf('[', funcStart);
        const onlyFunction = code.slice(funcStart, funcStart + func.length);
        if (openBracketIndex === -1)
            return returnUnpack(func, [], false, onlyFunction);
        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return returnUnpack(func, [], false, onlyFunction);
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
            return returnUnpack(func, [], false, onlyFunction);
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return returnUnpack(func, args, true, all);
        function returnUnpack(func, args, brackets, all) {
            return { func, args, brackets, all };
        }
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
            if (arg.trim() !== '')
                return arg.trim();
            return void 0;
        });
    }
    extractFunctions(code) {
        const functions = [];
        const regex = /\$([^\$\[\];\s]+)/g;
        let depth = 0;
        let index = 0;
        while (index < code.length) {
            const char = code[index];
            if (char === '[') {
                depth++;
                index++;
                continue;
            }
            if (char === ']') {
                depth--;
                index++;
                continue;
            }
            if (depth === 0 && char === '$') {
                regex.lastIndex = index;
                const match = regex.exec(code);
                if (match && match.index === index) {
                    const fullName = `$${match[1]}`;
                    const matched = this.functions.K.filter((f) => fullName.toLowerCase().startsWith(f.toLowerCase())).sort((a, b) => b.length - a.length)[0];
                    if (matched)
                        functions.push(matched);
                    index = regex.lastIndex;
                    continue;
                }
            }
            index++;
        }
        return (0, index_js_1.filterArray)(functions) ?? [];
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    async error(options, functionName) {
        this.setError(true);
        this.client.emit('functionError', typeof options === 'string' ? options : options.message, functionName, this);
        if (this.client.shouwOptions.suppressAllErrors === true)
            return this.success(void 0, true);
        try {
            if (!this.context?.channel)
                throw new Error('No channel to send error message');
            if (this.suppressErrors.suppress === true) {
                if (!this.suppressErrors.message)
                    return { result: void 0, error: true };
                await this.context?.send(this.suppressErrors.message);
                return this.success(void 0, true);
            }
            this.message = await this.context?.send(index_js_1.Constants.Errors.build(options, functionName));
        }
        catch {
            this.client.debug(index_js_1.Constants.Errors.buildLog(options), 'ERROR', true);
        }
        return this.success(void 0, true);
    }
    async switchArg(arg, type, functionData) {
        if (!arg || arg === '')
            return void 0;
        let parsed;
        switch (type) {
            case index_js_1.ParamType.String:
                parsed = arg.trim() === '' ? void 0 : arg.trim();
                if (!parsed || typeof parsed !== 'string')
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.BigInt:
                parsed = BigInt(arg);
                if (Number.isNaN(Number(parsed)))
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Number:
                parsed = Number(arg);
                if (Number.isNaN(parsed))
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Boolean:
                parsed = arg.toBoolean();
                if (typeof parsed !== 'boolean')
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Object:
                parsed = arg.toObject();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Array:
                parsed = arg.toArray();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Color:
                return Discord.resolveColor(arg);
            case index_js_1.ParamType.URL:
                parsed = arg.toURL();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Any:
                return arg;
            default:
                return void 0;
        }
        async function returnError(ctx) {
            await ctx.error(index_js_1.Constants.Errors.invalidArgumentType(functionData.name, type, parsed));
            return void 0;
        }
    }
    buildResult() {
        return {
            ...(this.extras.returnResult ? { result: this.isError ? '' : this.code } : {}),
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
    shouldSendMessage() {
        return (this.extras.sendMessage === true &&
            this.isError === false &&
            ((this.code && this.code !== '') ||
                this.components.length > 0 ||
                this.embeds.length > 0 ||
                this.attachments.length > 0 ||
                this.stickers.length > 0));
    }
    replaceExecutionTime(input) {
        const result = input.unescape();
        const end = (performance.now() - this.start).toFixed(2).toString();
        this.code = result.replace(/\$executionTime/gi, end);
        this.embeds = JSON.parse(JSON.stringify(this.embeds).replace(/\$executionTime/gi, end));
        this.components = JSON.parse(JSON.stringify(this.components).replace(/\$executionTime/gi, end));
    }
}
exports.Interpreter = Interpreter;
