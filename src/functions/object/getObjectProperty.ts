import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class GetObjectProperty extends Functions {
    constructor() {
        super({
            name: '$getObjectProperty',
            description: 'This function will return the property of the object with the given name and property name',
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

        let v = ctx.getObjectProperty(name, property);
        if (typeof v === 'object') v = JSON.stringify(v);

        return this.success(v);
    }
}

const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObjectProperty[myObject;key] // returns "value"
`;
