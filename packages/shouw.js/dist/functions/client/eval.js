"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const typings_1 = require("../../typings");
const node_util_1 = require("node:util");
class Eval extends core_1.Functions {
    constructor() {
        super({
            name: '$eval',
            description: 'Evaluation shouw.js code',
            brackets: true,
            params: [
                {
                    name: 'code',
                    description: 'The code to evaluate',
                    required: true,
                    type: typings_1.ParamType.String
                },
                {
                    name: 'sendMessage',
                    description: 'Whether to send the result as a message',
                    required: false,
                    type: typings_1.ParamType.Boolean
                },
                {
                    name: 'returnId',
                    description: 'Whether to return the id of the message',
                    required: false,
                    type: typings_1.ParamType.Boolean
                },
                {
                    name: 'returnResult',
                    description: 'Whether to return the result of the execution',
                    required: false,
                    type: typings_1.ParamType.Boolean
                },
                {
                    name: 'returnError',
                    description: 'Whether to return the error status of the execution',
                    required: false,
                    type: typings_1.ParamType.Boolean
                },
                {
                    name: 'returnData',
                    description: 'Whether to return the temporary data',
                    required: false,
                    type: typings_1.ParamType.Boolean
                }
            ]
        });
    }
    async code(ctx, [code, sendMessage = true, returnId = false, returnResult = true, returnError = false, returnData = false]) {
        const interpreterResult = await new core_1.Interpreter({
            name: 'eval',
            code: code ?? '',
            type: 'parsing'
        }, ctx, {
            sendMessage,
            returnId,
            returnResult,
            returnError,
            returnData
        }).initialize();
        return this.success(returnId || returnResult || returnError || returnData ? (0, node_util_1.inspect)(interpreterResult) : void 0);
    }
}
exports.default = Eval;
