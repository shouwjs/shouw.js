import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class HasCacheData extends Functions {
    constructor() {
        super({
            name: '$hasCacheData',
            description: 'This function will return true if the cache data with the given name and key exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache data to check',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [name, key]: [string, string]) {
        return this.success(ctx.hasCacheData(name, key));
    }
}

const example = `
$createCache[test]
$setCacheData[test;key;value]
$hasCacheData[test;key] // returns true

$hasCacheData[test;key2] // returns false
`;
