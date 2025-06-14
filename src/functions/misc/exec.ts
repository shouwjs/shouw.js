import { ParamType, Functions, type Interpreter } from '../../index.js';
import { execSync } from 'node:child_process';

export default class Exec extends Functions {
    constructor() {
        super({
            name: '$exec',
            description: 'Executes a command in the terminal.',
            brackets: true,
            params: [
                {
                    name: 'input',
                    description: 'The command to execute.',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(_ctx: Interpreter, [input]: [string]) {
        try {
            return this.success(execSync(input.unescape()).toString());
        } catch (err) {
            return this.success(err);
        }
    }
}
