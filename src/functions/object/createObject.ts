import { ParamType, Functions, type Objects, type Interpreter } from '../../index.js';

export default class CreateObject extends Functions {
    constructor() {
        super({
            name: '$createObject',
            description: 'Creates an object with the given name and value',
            brackets: true,
            escapeArguments: true,
            example,
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
        ctx.setObject(name, value);
        return this.success();
    }
}

const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObjectProperty[myObject;key] // returns "value"
`;
