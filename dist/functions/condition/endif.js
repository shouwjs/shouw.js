"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Endif extends index_js_1.Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'Ends of the if statement',
            brackets: false
        });
    }
}
exports.default = Endif;
