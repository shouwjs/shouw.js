"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
// biome-ignore lint: static members
class Time {
    // FORMAT TIME TO STRING
    static format(_time, useLongName = false) {
        let time = _time;
        const result = [];
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
    static parse(time) {
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
        const result = [];
        for (const unit of Time.units) {
            const regex = new RegExp(`(\\d+)${unit.short}\\b`, 'gi');
            let match;
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
    static digital(time) {
        let seconds = Math.trunc(time / 1000);
        const hours = Math.trunc(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.trunc(seconds / 60);
        seconds %= 60;
        return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
    }
    // PLURALIZE ANY UNIT
    static pluralize(num, unit, suffix = 's') {
        return `${num} ${unit}${num !== 1 ? suffix : ''}`;
    }
}
exports.Time = Time;
Time.units = [
    { name: 'year', short: 'y', ms: 31536000000 },
    { name: 'month', short: 'mon', ms: 2628002880 },
    { name: 'week', short: 'w', ms: 604800000 },
    { name: 'day', short: 'd', ms: 86400000 },
    { name: 'hour', short: 'h', ms: 3600000 },
    { name: 'minute', short: 'm', ms: 60000 },
    { name: 'second', short: 's', ms: 1000 },
    { name: 'millisecond', short: 'ms', ms: 1 }
];
