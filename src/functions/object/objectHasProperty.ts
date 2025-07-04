import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ObjectHasProperty extends Functions {
    constructor() {
        super({
            name: '$objectHasProperty',
            description: 'This function will return true if the object has the given property',
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
                    name: 'property',
                    description: 'The property name of the object',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, property]: [string, string]) {
        if (!ctx.hasObject(name)) return await ctx.error(ctx.constants.Errors.objectNotFound(name), this.name);

        const object = ctx.getObject(name);
        return this.success(Object.hasOwn(object ?? {}, property));
    }
}

const example = `
$createObject[myObject;{
    "key": "value"
}]

$objectHasProperty[myObject;key] // returns true
`;
