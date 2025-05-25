"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
// biome-ignore lint: static members
class Time {
    // FORMAT TIME TO STRING
    static format(_time) {
        let time = _time;
        const date = (ms) => {
            const res = Math.trunc(Math.abs(time) / ms);
            time -= res * ms;
            return res;
        };
        const data = () => {
            const string = [];
            for (const [key, value] of Object.entries({
                years: date(31536000000),
                months: date(2628746000),
                weeks: date(604800000),
                days: date(86400000),
                hours: date(3600000),
                minutes: date(60000),
                seconds: date(1000),
                ms: date(1)
            }).slice(0, -1)) {
                if (value) {
                    if (['months', 'ms'].includes(key)) {
                        string.push(`${value}${key.slice(0, 3)}`);
                    }
                    else {
                        string.push(`${value}${key.slice(0, 1)}`);
                    }
                }
            }
            return string.join(' ');
        };
        return data();
    }
    // PARSE TIME TO OBJECT
    static parse(time) {
        if (!['string', 'number'].includes(typeof time))
            throw TypeError("'time' must be a string or number");
        if (typeof time === 'number') {
            return {
                ms: time,
                format: Time.format(time)
            };
        }
        const Hash = new Map();
        for (const x of time.split(' ')) {
            if (x.endsWith('y'))
                Hash.set('y', {
                    format: Time.pluralize(Number(x.split('y')[0]), 'year'),
                    ms: Number(x.split('y')[0]) * 31536000000,
                    order: 1
                });
            if (x.endsWith('mon') || x.endsWith('M'))
                Hash.set('mon', {
                    format: Time.pluralize(Number(x.split('mon')[0].split('M')[0]), 'month'),
                    ms: Number(x.split('mon')[0].split('M')[0]) * 2628002880,
                    order: 2
                });
            if (x.endsWith('w'))
                Hash.set('w', {
                    format: Time.pluralize(Number(x.split('w')[0]), 'week'),
                    ms: Number(x.split('w')[0]) * 604800000,
                    order: 3
                });
            if (x.endsWith('d'))
                Hash.set('d', {
                    format: Time.pluralize(Number(x.split('d')[0]), 'day'),
                    ms: Number(x.split('d')[0]) * 86400000,
                    order: 4
                });
            if (x.endsWith('h') || x.endsWith('hr'))
                Hash.set('h', {
                    format: Time.pluralize(Number(x.split('h')[0].split('hr')[0]), 'hour'),
                    ms: Number(x.split('hr')[0].split('h')[0]) * 3600000,
                    order: 5
                });
            if (x.endsWith('min') || x.endsWith('m'))
                Hash.set('min', {
                    format: Time.pluralize(Number(x.split('min')[0].split('m')[0]), 'minute'),
                    ms: Number(x.split('min')[0].split('m')[0]) * 60000,
                    order: 6
                });
            if (x.endsWith('s') && !x.endsWith('ms'))
                Hash.set('s', {
                    format: Time.pluralize(Number(x.split('s')[0]), 'second'),
                    ms: Number(x.split('s')[0]) * 1000,
                    order: 7
                });
            if (x.endsWith('ms'))
                Hash.set('ms', {
                    ms: Number(x.split('ms')[0]),
                    order: 8
                });
        }
        const data = [...Hash.values()].sort((a, b) => {
            if (a.order < b.order)
                return -1;
            if (a.order > b.order)
                return 1;
            return 0;
        });
        const ms = data.map((x) => x.ms).reduce((a, b) => a + b, 0);
        const format = data
            .filter((x) => x.format)
            .map((x) => x.format)
            .join(', ');
        return {
            ms,
            format
        };
    }
    // FORMAT TIME TO DIGITAL STRING
    static digital(time) {
        let seconds = Math.trunc(time / 1000);
        const hours = Math.trunc(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.trunc(seconds / 60);
        seconds %= 60;
        return [hours, minutes, seconds].map((num) => num.toString().padStart(2, '0')).join(':');
    }
    // PLURALIZE TIME STRING
    static pluralize(num, txt, suffix = 's') {
        return `${num} ${txt}${num !== 1 ? suffix : ''}`;
    }
}
exports.Time = Time;
