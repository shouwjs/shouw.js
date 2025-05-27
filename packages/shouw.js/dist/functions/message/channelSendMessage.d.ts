import { Functions, type Interpreter } from '../../core';
import type { FunctionResultData } from '../../typings';
export default class ChannelSendMessage extends Functions {
    constructor();
    code(ctx: Interpreter, [channelId, content, returnId]: [string, string, boolean?]): Promise<FunctionResultData>;
}
