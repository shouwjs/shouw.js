import { ParamType, Functions, type Interpreter, type Objects } from '../../index.js';

export default class ObjectHasOwn extends Functions {
    constructor() {
        super({
            name: '$objectHasOwn',
            description: 'This function will return true if the object has the given property',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'object',
                    description: 'The object to check',
                    required: true,
                    type: ParamType.Object
                },
                {
                    name: 'property',
                    description: 'The property to check',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    async code(_ctx: Interpreter, [object, property]: [Objects, string]) {
        return this.success(Object.hasOwn(object, property));
    }
}

const example = `
$objectHasOwn[{ "key": "value" };key] // returns true
`;
