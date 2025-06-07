import { Functions } from '../../index.js';

export default class Endif extends Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'Ends of the if statement',
            brackets: false
        });
    }
}
