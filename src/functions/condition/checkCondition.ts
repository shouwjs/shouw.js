import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CheckCondition extends Functions {
    constructor() {
        super({
            name: '$checkCondition',
            description: 'Check a condition wether true or false',
            brackets: true,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [condition]: [string]) {
        return this.success(condition && condition !== '' ? ctx.condition(condition) : false);
    }
}
