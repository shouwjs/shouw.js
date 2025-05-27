import { Functions, type Interpreter } from '../../core';
export default class ChannelSendMessage extends Functions {
    constructor();
    code(ctx: Interpreter, [channelId, content, returnId]: [string, string, boolean?]): Promise<import("../../typings").FunctionResultData>;
}
