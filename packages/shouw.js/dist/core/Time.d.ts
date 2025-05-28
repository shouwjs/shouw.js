export declare class Time {
    private static units;
    static format(_time: number, useLongName?: boolean): string;
    static parse(time: string | number): {
        ms: number;
        format: string;
    };
    static digital(time: number): string;
    private static pluralize;
}
