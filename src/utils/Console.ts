import chalk from 'chalk';

interface ConsoleDisplayLine {
    text: string;
    color: string;
}

interface ConsoleDisplayCommand {
    name: string;
    command?: string;
    loaded: boolean;
    error?: Error;
}

/**
 * The console display class to display the console output
 *
 * @class ConsoleDisplay
 */
export class ConsoleDisplay {
    /**
     * The ready info lines
     */
    private readonly readyInfo: ConsoleDisplayLine[];

    /**
     * The command status table
     */
    private readonly commandStatusTable: Array<string[]>;

    /**
     * The frame color
     */
    private frameColor: chalk.Chalk;

    constructor() {
        this.commandStatusTable = [];
        this.readyInfo = [];
        this.frameColor = chalk.white;
    }

    /**
     * Display the console output
     *
     * @param {string} title - The title of the console output
     * @param {string} theme - The theme of the console output
     * @param {ConsoleDisplayLine[]} lines - The lines of the console output
     * @return {void} - Nothing
     */
    public static displayConsole(title: string, theme: string, lines: ConsoleDisplayLine[]): undefined {
        const display = new ConsoleDisplay();
        display.setTheme(theme);
        for (const line of lines) {
            display.info(line);
        }

        display.printInfo(title);
    }

    /**
     * Display the command list
     *
     * @param {string} theme - The theme of the console output
     * @param {ConsoleDisplayCommand[]} commands - The commands to display
     * @return {void} - Nothing
     */
    public static commandList(theme: string, commands: ConsoleDisplayCommand[]): undefined {
        const display = new ConsoleDisplay();
        display.setTheme(theme);
        for (const command of commands) {
            display.command(command.name, command.command, command.loaded, command.error);
        }

        display.printCommandStatus();
    }

    /**
     * Add a command to the command status table
     *
     * @param {string} name - The name of the command
     * @param {boolean} loaded - Whether the command was loaded
     * @param {any} [error] - The error that occurred while loading the command
     * @return {void} - Nothing
     */
    private command(name: string, command?: string, loaded = true, error?: any): undefined {
        this.commandStatusTable.push([
            name,
            error
                ? chalk.red(error.message)
                : loaded
                  ? `${chalk.green('Loaded')} ${command ? command : ''}`
                  : `${chalk.red('Failed')} ${command ? command : ''}`
        ]);
    }

    /**
     * Add a line to the ready info
     *
     * @param {ConsoleDisplayLine} line - The line to add
     * @return {void} - Nothing
     */
    private info(line: ConsoleDisplayLine): undefined {
        this.readyInfo.push(line);
    }

    /**
     * Set the theme of the console output
     *
     * @param {string} color - The color of the theme
     * @return {void} - Nothing
     */
    private setTheme(color: string): undefined {
        this.frameColor = chalk[color] ?? chalk.white;
    }

    /**
     * Strip ANSI codes from a string
     *
     * @param {string} str - The string to strip ANSI codes from
     * @return {string} - The string without ANSI codes
     */
    private stripAnsi(str: string): string {
        return str?.replace(/\x1B\[[0-9;]*m/g, '');
    }

    /**
     * Pad a cell with spaces
     *
     * @param {string} str - The string to pad
     * @param {number} width - The width of the cell
     * @return {string} - The padded string
     */
    private padCell(str: string, width: number): string {
        const len = this.stripAnsi(str).length;
        return str + ' '.repeat(width - len);
    }

    /**
     * Get the column widths for a table
     *
     * @param {Array<string[]>} rows - The rows of the table
     * @return {Array<number>} - The column widths
     */
    private getColumnWidths(rows: Array<string[]>): Array<number> {
        const colCount = rows[0].length;
        const widths = Array(colCount).fill(0);
        for (const row of rows) {
            row.forEach((cell, i) => {
                const len = this.stripAnsi(cell).length;
                if (len > widths[i]) widths[i] = len;
            });
        }

        return widths.map((w) => w + 2);
    }

    /**
     * Draw a table
     *
     * @param {string[]} headers - The headers of the table
     * @param {Array<string[]>} dataRows - The data rows of the table
     * @return {void} - Nothing
     */
    private drawTable(headers: string[], dataRows: Array<string[]>): undefined {
        const allRows = [headers, ...dataRows];
        const colWidths = this.getColumnWidths(allRows);
        const chars = {
            topLeft: '╭',
            topRight: '╮',
            bottomLeft: '╰',
            bottomRight: '╯',
            horizontal: '─',
            vertical: '│',
            midTop: '┬',
            midBottom: '┴',
            midLeft: '├',
            midRight: '┤',
            center: '┼'
        };

        const makeLine = (left: string, mid: string, right: string) =>
            this.frameColor(left + colWidths.map((w) => chars.horizontal.repeat(w)).join(mid) + right);

        const formatRow = (row: string[]) =>
            this.frameColor(chars.vertical) +
            row.map((cell, i) => this.padCell(` ${cell}`, colWidths[i])).join(this.frameColor(chars.vertical)) +
            this.frameColor(chars.vertical);

        console.log(makeLine(chars.topLeft, chars.midTop, chars.topRight));
        console.log(formatRow(headers));
        console.log(makeLine(chars.midLeft, chars.center, chars.midRight));
        for (const row of dataRows) {
            console.log(formatRow(row));
        }

        console.log(makeLine(chars.bottomLeft, chars.midBottom, chars.bottomRight));
    }

    /**
     * Draw a block
     *
     * @param {string} title - The title of the block
     * @param {ConsoleDisplayLine[]} lines - The lines of the block
     * @return {void} - Nothing
     */
    private drawBlock(title: string, lines: ConsoleDisplayLine[]): undefined {
        const maxLength = Math.max(this.stripAnsi(title).length, ...lines.map((l) => this.stripAnsi(l.text).length));
        const width = maxLength + 4;
        const top = this.frameColor(`╭${'─'.repeat(width)}╮`);
        const bottom = this.frameColor(`╰${'─'.repeat(width)}╯`);

        const centerText = (text: string) => {
            const len = this.stripAnsi(text).length;
            const totalPadding = width - len;
            const leftPadding = Math.floor(totalPadding / 2);
            const rightPadding = totalPadding - leftPadding;
            return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
        };

        console.log(top);
        console.log(this.frameColor('│') + centerText(title) + this.frameColor('│'));
        for (const line of lines) {
            const text = typeof line === 'object' && line.text ? line.text : line;
            const colored = typeof line === 'object' && chalk[line.color] ? chalk[line.color](text) : text;
            console.log(this.frameColor('│') + centerText(colored) + this.frameColor('│'));
        }
        console.log(bottom);
    }

    /**
     * Print the ready info
     *
     * @param {string} title - The title of the ready info
     * @return {void} - Nothing
     */
    private printInfo(title: string): undefined {
        if (this.readyInfo.length) this.drawBlock(title, this.readyInfo);
    }

    /**
     * Print the command status table
     *
     * @return {void} - Nothing
     */
    private printCommandStatus(): undefined {
        if (this.commandStatusTable.length) this.drawTable(['Command Information', 'Status'], this.commandStatusTable);
    }
}
