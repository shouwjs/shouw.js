import { Interpreter, type ShouwClient } from '../../index.js';
import type { Channel, Guild } from 'discord.js';

export default async function Events(shardId: number, client: ShouwClient): Promise<void> {
    const commands = client.commands?.shardReconnecting?.V;
    if (!commands || !commands.length) return;

    for (const command of commands) {
        if (!command || !command.code) break;
        let channel: Channel | undefined;
        let guild: Guild | undefined;

        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get(
                (
                    await Interpreter.run(
                        { code: command.channel },
                        {
                            client,
                            Temporarily: {
                                shardEvent: { id: shardId, type: 'reconnecting' }
                            } as any
                        },
                        { sendMessage: false }
                    )
                )?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(command, {
            client: client,
            Temporarily: {
                shardEvent: {
                    id: shardId,
                    type: 'reconnecting'
                }
            } as any,
            guild,
            channel
        });
    }
}
