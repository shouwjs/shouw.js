import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CheckCondition extends Functions {
    constructor() {
        super({
            name: '$checkCondition',
            description: 'This function checks if a condition is true or false',
            brackets: true,
            example,
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

const example = `
$checkCondition[true] // returns true
$checkCondition[false] // returns false

$checkCondition[uwu==uwu] // returns true
$checkCondition[(uwu!=meow)&&(uwu!=owo)] // returns true
`;
