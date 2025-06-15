import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class IsObjectExists extends Functions {
    constructor() {
        super({
            name: '$isObjectExists',
            description: 'Checks if an object exists',
            brackets: true,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    code(ctx: Interpreter, [name]: [string]) {
        return this.success(ctx.hasObject(name.unescape()));
    }
}
