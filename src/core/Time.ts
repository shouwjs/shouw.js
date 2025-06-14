/**
 * Time class to format and parse time from milliseconds to string and vice versa
 *
 * @class Time
 */
export class Time {
    /**
     * The units of time to format given in milliseconds
     *
     * @type {Array<{ name: string; short: string; ms: number }>}
     */
    private static units: Array<{ name: string; short: string; ms: number }> = [
        { name: 'year', short: 'y', ms: 31536000000 },
        { name: 'month', short: 'mon', ms: 2628002880 },
        { name: 'week', short: 'w', ms: 604800000 },
        { name: 'day', short: 'd', ms: 86400000 },
        { name: 'hour', short: 'h', ms: 3600000 },
        { name: 'minute', short: 'm', ms: 60000 },
        { name: 'second', short: 's', ms: 1000 },
        { name: 'millisecond', short: 'ms', ms: 1 }
    ];

    /**
     * Format time from milliseconds to string
     *
     * @param {number} _time - The time to format
     * @param {boolean} [useLongName] - Whether to use long names
     * @return {string} - The formatted time
     */
    public static format(_time: number, useLongName = false): string {
        let time = _time;
        const result: string[] = [];

        for (const { name, short, ms } of Time.units) {
            const count = Math.trunc(time / ms);
            if (count > 0) {
                result.push(`${count}${useLongName ? name : short}`);
                time -= count * ms;
            }
        }

        return result.join(useLongName ? ', ' : ' ');
    }

    /**
     * Parse time from string to milliseconds
     *
     * @param {string | number} time - The time to parse
     * @return {{ ms: number; format: string }} - The parsed time
     */
    public static parse(time: string | number): { ms: number; format: string } {
        if (typeof time !== 'string' && typeof time !== 'number') {
            throw new TypeError('Time must be a string or number');
        }

        if (typeof time === 'number') {
            return {
                ms: time,
                format: Time.format(time)
            };
        }

        let totalMs = 0;
        const result: string[] = [];

        for (const unit of Time.units) {
            const regex = new RegExp(`(\\d+)${unit.short}\\b`, 'gi');
            const matches: RegExpExecArray[] = [...time.matchAll(regex)];
            for (const match of matches) {
                const value = Number(match[1]);
                totalMs += value * unit.ms;
                result.push(Time.pluralize(value, unit.name));
            }
        }

        return {
            ms: totalMs,
            format: result.join(', ')
        };
    }

    /**
     * Parse time from digital string to milliseconds
     *
     * @param {string} time - The time to parse
     * @return {{ ms: number; format: string }} - The parsed time
     */
    public static parseDigital(time: string): { ms: number; format: string } {
        const digitalRegex = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
        const match = time.match(digitalRegex);
        if (!match) return { ms: 0, format: '0s' };
        const [_, hOrM1, mOrS2, s = '0', ms = '0'] = match;

        let hours = 0;
        let minutes = 0;
        let seconds = Number.parseInt(s, 10);
        const milliseconds = Number.parseInt(ms.padEnd(3, '0'), 10);

        if (s !== '0' || ms !== '0') {
            hours = Number.parseInt(hOrM1, 10);
            minutes = Number.parseInt(mOrS2, 10);
        } else {
            minutes = Number.parseInt(hOrM1, 10);
            seconds = Number.parseInt(mOrS2, 10);
        }

        const totalMs = hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;

        return {
            ms: totalMs,
            format: Time.format(totalMs)
        };
    }

    /**
     * Format time from milliseconds to digital string
     *
     * @param {number} time - The time to format
     * @return {string} - The formatted time
     */
    public static digital(time: number): string {
        let seconds = Math.trunc(time / 1000);
        const hours = Math.trunc(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.trunc(seconds / 60);
        seconds %= 60;
        return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
    }

    /**
     * Pluralize a unit of time
     *
     * @param {number} num - The number of units
     * @param {string} unit - The unit of time
     * @param {string} [suffix] - The suffix to use
     * @return {string} - The pluralized unit of time
     */
    private static pluralize(num: number, unit: string, suffix = 's'): string {
        return `${num} ${unit}${num !== 1 ? suffix : ''}`;
    }
}
