import { ParamType, Functions } from '../../index.js';

export default class If extends Functions {
    constructor() {
        super({
            name: '$if',
            description: 'This function checks if a condition is true or false',
            brackets: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }
}

const example = `
$if[true]
    This will run
$elseIf[false]
    This will not run
$else
    This will not run
$endIf
`;
