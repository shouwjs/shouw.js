import {
    Constants,
    ParamType,
    IF,
    filterArray,
    type FunctionResultData,
    type CommandData,
    type InterpreterOptions,
    type Flags,
    type ExtraOptionsData,
    type InterpreterResult,
    type Functions
} from '../../index.js';
import { Container } from './Container.js';
import * as Discord from 'discord.js';

/**
 * Interpreter responsible for executing the command code and handling the command data and options to send the result to the channel the command was sent in
 *
 * @class Interpreter
 * @extends {Container}
 */
export class Interpreter extends Container {
    /**
     * Run the interpreter and execute the command code
     *
     * @param {CommandData} command - The command data
     * @param {InterpreterOptions} options - The interpreter options
     * @param {ExtraOptionsData} [extras] - The extra options
     * @return {Promise<{ id?: string; result?: string; error?: boolean; data?: object }>} - The result of the interpreter
     */
    public static async run(
        command: CommandData,
        options: InterpreterOptions,
        extras?: ExtraOptionsData
    ): Promise<InterpreterResult> {
        return await new Interpreter(command, options, extras).initialize();
    }

    /**
     * Initialize the interpreter and execute the command code
     *
     * @return {Promise<{ id?: string; result?: string; error?: boolean; data?: object }>} - The result of the interpreter
     * @private
     */
    private async initialize(): Promise<InterpreterResult> {
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
                    flags: (Array.isArray(this.flags) ? this.flags.filter(Boolean) : this.flags) as Flags
                })) as Discord.Message;
            }
        } catch (err: any) {
            await this.error(err);
        }

        return this.buildResult();
    }

    /**
     * Process the functions and return the result
     *
     * @param {string} input - The input to process
     * @return {Promise<string>} - The result of the processing
     * @private
     */
    private async processFunction(input: string): Promise<string> {
        const code = input.mustEscape();
        const functions = this.extractFunctions(code);
        if (!functions.length) return input;

        let oldCode = code;
        let currentCode = code;

        for (const func of functions) {
            if (this.isError) break;
            const unpacked = this.unpack(func, oldCode);
            const functionData: Functions | undefined = this.functions.get(func);

            if (!unpacked.all || !functionData || !functionData.code || typeof functionData.code !== 'function')
                continue;

            if (functionData.brackets && !unpacked.brackets) {
                await this.error(Constants.Errors.missingBrackets(func, functionData));
                break;
            }

            if (this.isError) break;
            const processedArgs: Array<unknown> = await this.processArgs(unpacked.args, functionData);

            if (func.match(/\$if$/i)) {
                if (this.isError) break;
                const { code: ifCode, error: isError } = await IF(currentCode, this);
                this.setError(isError);
                if (this.isError) break;

                currentCode = await this.processFunction(ifCode);
                break;
            }

            try {
                if (this.isError) break;
                const DATA = ((await functionData.code(this, processedArgs, this.Temporarily)) ??
                    {}) as FunctionResultData;

                currentCode = currentCode.replace(unpacked.all, () => DATA.result?.toString().mustEscape() ?? '');
                oldCode = oldCode.replace(unpacked.all, '');
                if (this.isError || DATA.error === true) this.setError(true);

                for (const [key, value] of Object.entries(DATA)) {
                    if (!key || !value || !Object.hasOwn(this, key)) continue;
                    this[key] = value;
                }
            } catch (err: any) {
                await this.error(err, func);
            }
        }

        return currentCode.trim();
    }

    /**
     * Process the arguments for the function
     *
     * @param {Array<unknown>} args - The arguments to process
     * @param {Functions} functionData - The function data
     * @return {Promise<Array<unknown>>} - The processed arguments
     * @private
     */
    private async processArgs(args: Array<unknown>, functionData: Functions): Promise<Array<unknown>> {
        const processedArgs: Array<unknown> = [];
        const totalArgs = Math.max(args.length, functionData.paramsLength);

        for (let i = 0; i < totalArgs; i++) {
            const param = functionData.getParam(i);
            const isVoid = (v: any) => param.type !== ParamType.Void && (v === undefined || v === null || v === '');

            if (param.rest) {
                const joined = args.slice(i).join(';');
                const result = await this.switchArg(
                    await this.processFunction(joined),
                    param.type ?? ParamType.String,
                    functionData
                );
                if (this.isError) break;
                if (param.required && isVoid(result)) {
                    await this.error(Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                    break;
                }
                processedArgs.push(result);
                break;
            }

            const input = (args[i] ?? '') as string;
            const arg = await this.switchArg(input, param.type ?? ParamType.String, functionData);
            if (this.isError) break;

            if (isVoid(arg)) {
                if (param.required) {
                    await this.error(Constants.Errors.missingRequiredArgument(functionData.name, param.name));
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

            const processed = await this.switchArg(
                await this.processFunction(arg),
                param.type ?? ParamType.String,
                functionData
            );
            if (this.isError) break;
            if (param.required && isVoid(processed)) {
                await this.error(Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                break;
            }
            processedArgs.push(processed);
        }

        return processedArgs;
    }

    /**
     * Unpack a function arguments from the code with brackets and arguments
     *
     * @param {string} func - The function to unpack
     * @param {string} code - The code to unpack from
     * @return {{ func: string; args: Array<unknown>; brackets: boolean; all: string | null }} - The unpacked function
     * @private
     */
    private unpack(
        func: string,
        code: string
    ): {
        func: string;
        args: Array<unknown>;
        brackets: boolean;
        all: string | null;
    } {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase());
        if (funcStart === -1) return returnUnpack(func, [], false, null);

        const openBracketIndex = code.indexOf('[', funcStart);
        const onlyFunction = code.slice(funcStart, funcStart + func.length);
        if (openBracketIndex === -1) return returnUnpack(func, [], false, onlyFunction);

        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('[')) return returnUnpack(func, [], false, onlyFunction);

        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;

        while (closeBracketIndex < code.length) {
            if (code.charAt(closeBracketIndex) === '[') {
                bracketStack++;
            } else if (code.charAt(closeBracketIndex) === ']') {
                bracketStack--;
                if (bracketStack === 0) break;
            }

            closeBracketIndex++;
        }

        if (closeBracketIndex >= code.length || bracketStack > 0) return returnUnpack(func, [], false, onlyFunction);

        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return returnUnpack(func, args, true, all);

        function returnUnpack(func: string, args: unknown[], brackets: boolean, all: string | null) {
            return { func, args, brackets, all };
        }
    }

    /**
     * Extract arguments from a function arguments string
     *
     * @param {string} argsStr - The string to extract arguments from
     * @return {Array<string | undefined>} - The extracted arguments
     * @private
     */
    private extractArguments(argsStr: string): Array<string | undefined> {
        const args: string[] = [];
        let depth = 0;
        let currentArg = '';

        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr.charAt(i);
            if (char === '[') {
                depth++;
                currentArg += char;
            } else if (char === ']') {
                depth--;
                currentArg += char;
            } else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            } else {
                currentArg += char;
            }
        }

        if (currentArg.trim()) args.push(currentArg.trim());

        return args.map((arg: string) => {
            if (arg.trim() !== '') return arg.trim();
            return void 0;
        });
    }

    /**
     * Extract all functions from the code and return them as an array of strings
     *
     * @param {string} code - The code to extract functions from
     * @return {Array<string>} - The extracted functions
     * @private
     */
    private extractFunctions(code: string): Array<string> {
        const functions: string[] = [];
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
                    const matched = this.functions.K.filter((f) =>
                        fullName.toLowerCase().startsWith(f.toLowerCase())
                    ).sort((a, b) => b.length - a.length)[0];

                    if (matched) functions.push(matched);
                    index = regex.lastIndex;
                    continue;
                }
            }

            index++;
        }

        return filterArray(functions) ?? [];
    }

    /**
     * Success result of the function to return the result of the function
     *
     * @param {any} [result] - The result of the function
     * @param {boolean} [error] - Whether the function errored
     * @param {FunctionResultData} [data] - The data of the function
     * @return {FunctionResultData} - The success result of the function
     */
    public success(result: any = void 0, error?: boolean, ...data: FunctionResultData[]): FunctionResultData {
        return { ...data, result, error };
    }

    /**
     * Error result of the function to return the error result of the function
     *
     * @param {string | { message: string; solution?: string }} options - The options of the function
     * @param {string} [functionName] - The name of the function
     * @return {Promise<FunctionResultData>} - The error result of the function
     */
    public async error(
        options: string | { message: string; solution?: string },
        functionName?: string
    ): Promise<FunctionResultData> {
        this.setError(true);

        this.client.emit('functionError', typeof options === 'string' ? options : options.message, functionName, this);
        if (this.client.shouwOptions.suppressAllErrors === true) return this.success(void 0, true);

        try {
            if (!this.context?.channel) throw new Error('No channel to send error message');
            if (this.suppressErrors.suppress === true) {
                if (!this.suppressErrors.message) return { result: void 0, error: true };
                await this.context?.send(this.suppressErrors.message);
                return this.success(void 0, true);
            }

            this.message = await this.context?.send(Constants.Errors.build(options, functionName));
        } catch {
            this.client.debug(Constants.Errors.buildLog(options), 'ERROR', true);
        }

        return this.success(void 0, true);
    }

    /**
     * Switch the argument to the correct type
     *
     * @param {string} arg - The argument to switch
     * @param {ParamType} type - The type of the argument
     * @return {any} - The switched argument
     * @private
     */
    private async switchArg(arg: string, type: ParamType, functionData: Functions): Promise<any> {
        if (!arg || arg === '') return void 0;
        let parsed: any;

        switch (type) {
            case ParamType.String:
                parsed = arg.trim() === '' ? void 0 : arg.trim();
                if (!parsed || typeof parsed !== 'string') return returnError(this);
                return parsed;
            case ParamType.BigInt:
                parsed = BigInt(arg);
                if (Number.isNaN(Number(parsed))) return returnError(this);
                return parsed;
            case ParamType.Number:
                parsed = Number(arg);
                if (Number.isNaN(parsed)) return returnError(this);
                return parsed;
            case ParamType.Boolean:
                parsed = arg.toBoolean();
                if (typeof parsed !== 'boolean') return returnError(this);
                return parsed;
            case ParamType.Object:
                parsed = arg.toObject();
                if (!parsed) return returnError(this);
                return parsed;
            case ParamType.Array:
                parsed = arg.toArray();
                if (!parsed) return returnError(this);
                return parsed;
            case ParamType.Color:
                return Discord.resolveColor(arg as Discord.ColorResolvable);
            case ParamType.URL:
                parsed = arg.toURL();
                if (!parsed) return returnError(this);
                return parsed;
            case ParamType.Any:
                return arg;
            default:
                return void 0;
        }

        async function returnError(ctx: Interpreter): Promise<void> {
            await ctx.error(Constants.Errors.invalidArgumentType(functionData.name, type, parsed));
            return void 0;
        }
    }

    /**
     * Build the result data to return
     *
     * @return {InterpreterResult} - The result data to return
     * @private
     */
    private buildResult(): InterpreterResult {
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
        } as InterpreterResult;
    }

    /**
     * Check if the message should be sent
     *
     * @return {boolean} - Whether the message should be sent
     * @private
     */
    private shouldSendMessage(): boolean {
        return (
            this.extras.sendMessage === true &&
            this.isError === false &&
            ((this.code && this.code !== '') ||
                this.components.length > 0 ||
                this.embeds.length > 0 ||
                this.attachments.length > 0 ||
                this.stickers.length > 0)
        );
    }

    /**
     * Replace the execution time in the code
     *
     * @param {string} input - The input to replace the execution time in
     * @return {void} - Nothing
     * @private
     */
    private replaceExecutionTime(input: string): void {
        const result = input.unescape();
        const end = (performance.now() - this.start).toFixed(2).toString();
        this.code = result.replace(/\$executionTime/gi, end);
        this.embeds = JSON.parse(JSON.stringify(this.embeds).replace(/\$executionTime/gi, end));
        this.components = JSON.parse(JSON.stringify(this.components).replace(/\$executionTime/gi, end));
    }
}
