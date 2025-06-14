import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class SplitText extends Functions {
    constructor() {
        super({
            name: '$splitText',
            description: 'Return the splitted text at the given index.',
            brackets: true,
            params: [
                {
                    name: 'index',
                    description: 'The index of the split to return.',
                    required: true,
                    type: ParamType.Number
                }
            ]
        });
    }

    code(ctx: Interpreter, [index = 1]: [number]) {
        return this.success(ctx.getSplit(index - 1));
    }
}
