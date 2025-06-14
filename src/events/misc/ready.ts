import { type ShouwClient, Interpreter } from '../../index.js';
import type { Channel, Guild } from 'discord.js';

/**
 * Ready Event
 *
 * @param {ShouwClient} client
 * @return {Promise<void>}
 */
export default async function Events(client: ShouwClient): Promise<void> {
    const commands = client.commands?.ready?.V;
    if (!commands) return;

    for (const command of commands) {
        if (!command || !command.code) break;
        let channel: Channel | undefined;
        let guild: Guild | undefined;

        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get(
                (
                    await Interpreter.run(
                        {
                            name: 'channel',
                            type: 'parsing',
                            code: command.channel
                        },
                        {
                            client
                        },
                        {
                            sendMessage: false,
                            returnId: false,
                            returnResult: true,
                            returnError: false,
                            returnData: false
                        }
                    )
                )?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(
            command,
            {
                client,
                guild,
                channel
            },
            {
                sendMessage: true,
                returnId: false,
                returnResult: false,
                returnError: false,
                returnData: false
            }
        );
    }
}
