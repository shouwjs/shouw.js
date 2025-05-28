import { Collective } from '../utils';
import type { ShouwClient } from './ShouwClient';
import type { CommandData } from '../typings';
type CommandsEventMap = {
    [K in keyof typeof EventsMap]?: Collective<number, CommandData>;
};
declare const EventsMap: Record<string, string>;
export declare class CommandsManager implements CommandsEventMap {
    readonly client: ShouwClient;
    events?: Array<string>;
    [key: string]: CommandsEventMap | any;
    interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };
    constructor(client: ShouwClient, events?: string[]);
    private loadEvents;
    private getEventPath;
}
export {};
