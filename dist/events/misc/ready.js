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
            channel = client.channels.cache.get((await new index_js_1.Interpreter({
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
            }).initialize())?.result ?? '');
            guild = channel?.guild;
        }
        await new index_js_1.Interpreter(command, {
            client,
            guild,
            channel
        }, {
            sendMessage: true,
            returnId: false,
            returnResult: false,
            returnError: false,
            returnData: false
        }).initialize();
    }
}
