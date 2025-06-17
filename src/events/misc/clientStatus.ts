import { Interpreter, type ShouwClient } from '../../index.js';

/**
 * Manages the client's status.
 *
 * @param client - The Shouw client.
 * @returns {void} - Nothing.
 */
export default function Status(client: ShouwClient): void {
    let index = 0;

    const updateStatus = async (): Promise<any> => {
        if (index >= client.statuses.size || !client.statuses.get(index)) index = 0;

        const status = client.statuses.get(index);
        if (!status) {
            index++;
            return setTimeout(updateStatus, 20000);
        }

        let name = status.activities?.[0]?.name;
        if (!name) {
            index++;
            return setTimeout(updateStatus, status.time ?? 20000);
        }

        if (name.includes('$') && name !== '$') {
            const result = await Interpreter.run({ code: name }, { client }, { sendMessage: false });

            if (typeof result?.result === 'string') {
                name = result.result;
                client.statuses.set(index, {
                    ...status,
                    activities: [{ ...status.activities[0], name }]
                });
            } else {
                index++;
                return setTimeout(updateStatus, status.time ?? 20000);
            }
        }

        client.user.setPresence(status);
        index++;
        setTimeout(updateStatus, status.time ?? 20000);
    };

    updateStatus();
}
