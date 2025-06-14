import { ParamType, Functions, Interpreter } from '../../index.js';
import { inspect } from 'node:util';

export default class Eval extends Functions {
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
                    type: ParamType.String
                },
                {
                    name: 'sendMessage',
                    description: 'Whether to send the result as a message',
                    required: false,
                    type: ParamType.Boolean
                },
                {
                    name: 'returnId',
                    description: 'Whether to return the id of the message',
                    required: false,
                    type: ParamType.Boolean
                },
                {
                    name: 'returnResult',
                    description: 'Whether to return the result of the execution',
                    required: false,
                    type: ParamType.Boolean
                },
                {
                    name: 'returnError',
                    description: 'Whether to return the error status of the execution',
                    required: false,
                    type: ParamType.Boolean
                },
                {
                    name: 'returnData',
                    description: 'Whether to return the temporary data',
                    required: false,
                    type: ParamType.Boolean
                }
            ]
        });
    }

    async code(
        ctx: Interpreter,
        [code, sendMessage = true, returnId = false, returnResult = true, returnError = false, returnData = false]: [
            string,
            boolean,
            boolean,
            boolean,
            boolean,
            boolean
        ]
    ) {
        const interpreterResult = await Interpreter.run(
            {
                name: 'eval',
                code: code ?? '',
                type: 'parsing'
            },
            ctx,
            {
                sendMessage,
                returnId,
                returnResult,
                returnError,
                returnData
            }
        );

        return this.success(
            returnId || returnResult || returnError || returnData ? inspect(interpreterResult) : void 0
        );
    }
}
