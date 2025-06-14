import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Ternary extends Functions {
    constructor() {
        super({
            name: '$ternary',
            description: 'Check a condition wether true or false and return the result',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'true result',
                    description: 'The result if the condition is true',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'false result',
                    description: 'The result if the condition is false',
                    required: false,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [condition, trueResult, falseResult]: [string, string, string?]) {
        return this.success(
            ctx.condition(condition.unescape()) ? trueResult.unescape() : (falseResult?.unescape() ?? '')
        );
    }
}
