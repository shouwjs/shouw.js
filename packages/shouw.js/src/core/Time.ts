// biome-ignore lint: static members
export class Time {
    private static units = [
        { name: 'year', short: 'y', ms: 31536000000 },
        { name: 'month', short: 'mon', ms: 2628002880 },
        { name: 'week', short: 'w', ms: 604800000 },
        { name: 'day', short: 'd', ms: 86400000 },
        { name: 'hour', short: 'h', ms: 3600000 },
        { name: 'minute', short: 'm', ms: 60000 },
        { name: 'second', short: 's', ms: 1000 },
        { name: 'millisecond', short: 'ms', ms: 1 }
    ];

    // FORMAT TIME TO STRING
    public static format(_time: number, useLongName = false) {
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

    // PARSE TIME TO OBJECT
    public static parse(time: string | number) {
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
            let match: RegExpExecArray | null;
            while ((match = regex.exec(time)) !== null) {
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

    // FORMAT TIME TO DIGITAL STRING
    public static digital(time: number) {
        let seconds = Math.trunc(time / 1000);
        const hours = Math.trunc(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.trunc(seconds / 60);
        seconds %= 60;
        return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
    }

    // PLURALIZE ANY UNIT
    private static pluralize(num: number, unit: string, suffix = 's') {
        return `${num} ${unit}${num !== 1 ? suffix : ''}`;
    }
}
