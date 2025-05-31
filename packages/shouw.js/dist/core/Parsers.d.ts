import type { Interpreter } from './Interpreter';
import type { SendData } from '../typings';
export declare function Parser(ctx: Interpreter, input: string): Promise<SendData>;
