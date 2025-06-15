import { ParamType, Functions, type Objects, type Interpreter } from '../../index.js';

export default class CreateObject extends Functions {
    constructor() {
        super({
            name: '$createObject',
            description: 'Create an object',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the object',
                    required: true,
                    type: ParamType.Object,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [name, value]: [string, Objects]) {
        ctx.setObject(name.unescape(), value);
        return this.success();
    }
}
