import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class IsObjectExists extends Functions {
    constructor() {
        super({
            name: '$isObjectExists',
            description: 'This function will return true if the object with the given name exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [name]: [string]) {
        return this.success(ctx.hasObject(name));
    }
}

const example = `
$createObject[myObject;{
    "key": "value"
}]

$isObjectExists[myObject] // returns true
`;
