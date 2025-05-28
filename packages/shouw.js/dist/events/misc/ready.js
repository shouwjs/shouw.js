"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const __1 = require("../..");
async function Events(client) {
    const commands = client.commands?.ready?.V;
    if (!commands)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        await new __1.Interpreter(command, {
            client: client
        }, {
            sendMessage: true,
            returnId: false,
            returnResult: false,
            returnError: false,
            returnData: false
        }).initialize();
    }
}
