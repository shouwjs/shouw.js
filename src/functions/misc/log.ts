import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class Log extends Functions {
    constructor() {
        super({
            name: '$log',
            description: 'Logs the input to the console.',
            brackets: true,
            params: [
                {
                    name: 'input',
                    description: 'The input to log.',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(_ctx: Interpreter, [input]: [string]) {
        console.log(input);
        return this.success();
    }
}
