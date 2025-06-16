import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class GetObject extends Functions {
    constructor() {
        super({
            name: '$getObject',
            description: 'This function will return the object with the given name',
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

    async code(ctx: Interpreter, [name]: [string]) {
        if (!ctx.hasObject(name)) return await ctx.error(ctx.constants.Errors.objectNotFound(name), this.name);

        return this.success(JSON.stringify(ctx.getObject(name)));
    }
}

const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObject[myObject] // returns { "key": "value" }
`;
