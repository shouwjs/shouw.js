import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Ternary extends Functions {
    constructor() {
        super({
            name: '$ternary',
            description: 'This function will check a condition wether true or false and return the result',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'trueResult',
                    description: 'The result if the condition is true',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'falseResult',
                    description: 'The result if the condition is false',
                    required: false,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [condition, trueResult, falseResult]: [string, string, string?]) {
        return this.success(ctx.condition(condition) ? trueResult : (falseResult ?? ''));
    }
}

const example = `
$ternary[true;This will run;This will not run] // returns This will run
$ternary[false;This will not run;This will run] // returns This will run
`;
