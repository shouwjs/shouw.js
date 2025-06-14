"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(client) {
    const commands = client.commands?.ready?.V;
    if (!commands)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        let channel;
        let guild;
        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get((await index_js_1.Interpreter.run({
                name: 'channel',
                type: 'parsing',
                code: command.channel
            }, {
                client
            }, {
                sendMessage: false,
                returnId: false,
                returnResult: true,
                returnError: false,
                returnData: false
            }))?.result ?? '');
            guild = channel?.guild;
        }
        await index_js_1.Interpreter.run(command, {
            client,
            guild,
            channel
        }, {
            sendMessage: true,
            returnId: false,
            returnResult: false,
            returnError: false,
            returnData: false
        });
    }
}
