import memd from 'memd';
import alot from 'alot';
import { File } from 'atma-io';
import { DayDate } from '../model/DayDate';
import { LoggerFile } from '../fs/LoggerFile';
import { ICsvColumn } from "../model/ICsvColumn";
import { FileIndex, Idx_LINE_END, Idx_LINE_START, IFileIndex } from './FileIndex';

const cache = new Map<string, FileReader>();

type FileType = InstanceType<typeof File>;

export interface IFileQuery {
    offset?: number
    limit?: number
    from?: Date
    to?: Date
}

export class FileReader {
    private _file: FileType;

    day: DayDate;
    nr: number

    fields: ICsvColumn[]
    cached = true
    table: any[][] = null;

    static create (channel: LoggerFile, uri: string, idxFile?: FileType) {
        if (cache.has(uri)) {
            return cache.get(uri);
        }
        let reader = new FileReader(channel, uri, idxFile);
        cache.set(uri, reader);
        return reader;
    }

    protected constructor(public channel: LoggerFile, public uri: string, public idxFile?: FileType) {
        this.fields = channel.opts?.fields ?? channel.opts?.columns;

        // const filename = `${ d.getTime() }_${this._idx}__${Formatter(d, 'MM-dd')}.csv`;
        let rgx = /(?<nr>\d+)__(?<MM>\d+)\-(?<dd>\d+)(\-(?<YYYY>\d+))?/;
        let match = rgx.exec(uri);
        if (match == null) {
            throw new Error(`Invalid filename pattern: ${uri}`);
        }
        let { MM, dd, YYYY, nr } = match.groups;

        let year = YYYY ? Number(YYYY) : (new Date()).getFullYear();
        let month = Number(MM);
        let date = Number(dd);

        this.nr = Number(nr);
        this.day = new DayDate(
            year,
            month - 1,
            date
        );
        this._file = new File(this.uri, { cached: false });
    }


    async read() {
        if (this.table) {
            return this.table;
        }

        let str = await this._file.readAsync<string>();
        let table = this.parse(str);
        if (this.day.isSame(new Date()) === false) {
            // Cache everything, but not for today
            this.table = table;
        }
        return table;
    }

    async fetch(opts: IFileQuery) {

        let idx = await this.readIndex();
        if (idx == null) {
            let rows = await this.read();
            return FilterUtils.fetch(rows, 0, opts)
        }

        let { total, rows: lines } = FilterUtils.fetch(idx.lines as any, 2, opts);

        let start = alot(lines).min(x => x[Idx_LINE_START]);
        let end = alot(lines).max(x => x[Idx_LINE_END]);

        let block = await this._file.readRangeAsync(start, end - start);
        let rows = this.parse(block);
        return {
            total,
            rows
        };
    }

    //@memd.deco.memoize()
    private async readIndex (): Promise<IFileIndex> {
        if (this.idxFile) {
            return await this.idxFile.readAsync<IFileIndex>();
        }
        let isActiveFile = this.channel.path?.endsWith(this._file.uri.file) ?? false;
        if (isActiveFile) {
            return null;
        }
        return FileIndex.create(this.uri);
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
            if (this.fields == null) {
                return cells;
            }
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
            if (c === ' ') {
                i++;
                continue;
            }
            let match: '"' | "'" | ',' = ',';
            let skipAfterMatch = 1;
            let skipBefore = 0;
            if (c === ',') {
                let nextI = i + 1;
                while(nextI < str.length) {
                    let nextC = str[nextI];
                    if (nextC === ' ') {
                        nextI++;
                        continue;
                    }
                    if (nextC === '"' || nextC === "'") {
                        c = nextC;
                        i = nextI;
                    }
                    break;
                }
            }

            if (c === '"' || c === "'") {
                match = c;
                skipAfterMatch = 2;
                skipBefore = 1;
            }
            let [ resultI, resultVal ] = readToChar(row, match, i + skipBefore);
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

namespace TypeUtils {
    export function getTimestamp (x: Date | number | string | any) {
        if (x == null) {
            return null;
        }
        if (typeof x === 'number') {
            return x;
        }
        let date: Date;
        if (typeof x === 'string') {
            date = new Date(x)
        } else {
            date = x;
        }
        let timestamp = date?.getTime();
        return isNaN(timestamp) ? null : timestamp;
    }
}

namespace FilterUtils {
    export function fetch (rows: any[][], dateIdx: number, opts: IFileQuery) {
        let total = rows.length;
        let from = TypeUtils.getTimestamp(opts.from);
        let to = TypeUtils.getTimestamp(opts.to);
        let offset = opts.offset ?? 0;
        let limit = opts.limit ?? rows.length;

        let startIdx: number = null;
        let endIdx: number = null;

        if (from != null) {
            for (startIdx = 0; startIdx < rows.length; startIdx++) {
                let timestamp = TypeUtils.getTimestamp(rows[startIdx][dateIdx]);
                if (timestamp >= from) {
                    break;
                }
            }
        }
        if (to != null) {
            for (endIdx = startIdx ?? 0; endIdx < rows.length; endIdx++) {
                let timestamp = TypeUtils.getTimestamp(rows[endIdx][dateIdx]);
                if (timestamp > to) {
                    break;
                }
            }
        }

        if (startIdx != null || endIdx != null) {
            rows = rows.slice(startIdx ?? 0, endIdx ?? rows.length);
        }

        rows = rows
            .reverse()
            .slice(offset, offset + limit);

        return {
            total,
            rows,
        };
    }
}
