import { File } from 'atma-io';
import { LoggerFile } from '../../src/fs/LoggerFile';
import { ICsvColumn } from "../../src/model/ICsvColumn";
import { date_sameDate } from '../../src/utils/date';

const cache = new Map<string, FileReader>();

export class FileReader {
    day: Date;
    dayEnd: Date;
    fields: ICsvColumn[]
    cached = true
    table: any[][] = null;

    static create (channel: LoggerFile, uri: string) {
        if (cache.has(uri)) {
            return cache.get(uri);
        }
        let reader = new FileReader(channel, uri);
        cache.set(uri, reader);
        return reader;
    }

    protected constructor(public channel: LoggerFile, public uri: string) {
        this.fields = channel.opts?.fields ?? channel.opts?.columns;
        if (this.fields == null) {
            throw new Error(`Logger FileReader: fields are not defined for a channel ${channel.opts.directory}`)
        }
        // const filename = `${ d.getTime() }_${this._idx}__${Formatter(d, 'MM-dd')}.csv`;
        let rgx = /(\d+)_(\d+)__(\d+)\-(\d+)(\-(\d+))?/;
        let match = rgx.exec(uri);
        if (match == null) {
            throw new Error(`Invalid filename: ${uri}`);
        }
        let [_, timestamp, idx, MM, dd, _1, YYYY] = match;

        let year = YYYY ? Number(YYYY) : (new Date()).getFullYear();
        let month = Number(MM);
        let date = Number(dd);

        this.day = new Date(
            year,
            month - 1,
            date,
            0, 0, 0, 0
        );
        this.dayEnd = new Date(this.day);
        this.dayEnd.setDate(this.dayEnd.getDate() + 1);

    }


    async read() {
        if (this.table) {
            return this.table;
        }
        let file = new File(this.uri, { cached: false });
        let str = await file.readAsync<string>();
        let table = this.parse(str);
        if (date_sameDate(new Date(), this.day) === false) {
            // Cache everything, but not for today
            this.table = table;
        }
        console.log('READ', 'cached', this.table?.length);
        return table;
    }

    private parse(str: string) {
        let NEW_LINE = '\n';
        let i = str.indexOf('\n')
        if (str[i - 1] === '\r') {
            NEW_LINE = '\r\n';
        }

        let rows = str.split(NEW_LINE).reverse().map(row => {
            if (row === '') {
                return null;
            }
            let cells = Csv.splitRow(row);
            return this.fields.map((field, index) => {
                return Csv.parseType(cells[index], field);
            });
        });
        return rows.filter(Boolean);
    }
}

export namespace Csv {
    export function parseType (val: string, field: ICsvColumn) {
        if (!val) {
            return null;
        }
        switch (field.type) {
            case 'number':
                return parseFloat(val);
            case 'date':
                return new Date(val);
            case 'text':
                return val.replace(/\\{1,2}n/g, '\n').trim();
            default:
                return val;
        }
    }

    export function splitRow (row: string) {
        let cells = [];
        let str = row;
        let i = -1;
        while (i < row.length) {
            let c = str[i];
            let match: '"' | "'" | ',' = ',';
            let skipAfterMatch = 1;

            if (c === '"' || c === "'") {
                match = c;
                skipAfterMatch = 2;
            }
            let [ resultI, resultVal ] = readToChar(row, match, i + 1);
            cells.push(resultVal);
            i = resultI + skipAfterMatch;
        }
        return cells;
    }

    let result = [0, ''] as [number, string];
    let rgx = { '"': /\\"/g, "'": /\\'/g, ",": /\\,/g }
    function readToChar (str: string, char: "'" | '"' | ',', i: number) {
        let start = i;
        let escaped = false;
        while (i < str.length) {
            i = str.indexOf(char, i);
            if (i === -1) {
                i = str.length;
                break;
            }
            if (str[i - 1] === '\\') {
                escaped = true;
                i++;
                continue;
            }
            break;
        }
        let value = str.substring(start, i);
        if (escaped) {
            value = value.replace(rgx[char], char);
        }

        result[0] = i;
        result[1] = value;
        return result;
    }
}
