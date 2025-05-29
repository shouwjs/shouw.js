import type { Interpreter } from '../core/Interpreter';
import { ChannelType, MessageFlags } from 'discord.js';
declare class UtilTypes {
    static ChannelType: Record<string | ChannelType, ChannelType | string>;
    static Flags: {
        crossposted: MessageFlags;
        ephemeral: MessageFlags;
        failedtomentionsomerolesinthread: MessageFlags;
        hassnapshot: MessageFlags;
        hasthread: MessageFlags;
        iscomponentsv2: MessageFlags;
        isvoicemessage: MessageFlags;
        iscrosspost: MessageFlags;
        loading: MessageFlags;
        shouldshowlinknotdiscordwarning: MessageFlags;
        sourcemessagedeleted: MessageFlags;
        suppressembeds: MessageFlags;
        suppressnotifications: MessageFlags;
        urgent: MessageFlags;
        1: string;
        64: string;
        256: string;
        16384: string;
        32: string;
        32768: string;
        8192: string;
        2: string;
        128: string;
        1024: string;
        8: string;
        4: string;
        4096: string;
        16: string;
    };
}
export declare class Util extends UtilTypes {
    static isUnicodeEmoji(str: string): boolean;
    static getEmoji(ctx: Interpreter, _emojiInput: string, onlyId?: boolean): Promise<any>;
}
export {};
