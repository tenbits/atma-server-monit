import { file_readSize, file_appendAsync, file_append, dir_ensure, dir_read, file_remove } from './fs';
import { os_EndOfLine } from '../utils/os';
import * as Path from 'path'
import  * as Formatter from 'atma-formatter'
import { date_getMidnight } from '../utils/date';
import { class_Uri } from 'atma-utils';
import { Csv } from '../utils/csv';
import { ICsvColumn } from '../model/ICsvColumn';


export interface ILoggerOpts {
    directory: string
    fileCountMax?: number
    fileBytesMax?: number
    fileMessagesMax?: number
    messageBufferMax?: number
    fields?: ICsvColumn[]

    //@obsolete Use fields
    columns?: ICsvColumn[]
}
export interface ILogger {
    writeRow (cells: any[])
    write(mix: string | any[]): void
    flush ()
}

export class EmptyLoggerFile implements ILogger {
    writeRow(cells: any[]) {

    }
    write(mix: string | any[]): void {

    }
    flush() {

    }
}
export class LoggerFile implements ILogger {
    public directory: string;
    public opts: ILoggerOpts;

    /** Filecounter, in case we have to create multiple files for a day due to filesize limit */
    private _idx = 0
    private _file: File;
    private _todayMid = date_getMidnight(new Date());
    private _tomorrowMid = date_getMidnight(new Date(), 1);

    static create (key: string, opts: ILoggerOpts) {

        opts.directory = class_Uri.combine(opts.directory, key, '/');

        let logger = new LoggerFile();
        logger.init(opts);
        return logger;
    }

    protected constructor () {}

    writeRow (cells: any[]) {
        let fields = this.opts.fields;
        if (fields == null) {
            let row = cells.map(Csv.escape).join(', ');
            this.write(row);
            return;
        }
        let row = '';
        for (let i = 0; i < fields.length; i++) {
            if (i !== 0) row += ', ';

            let val = cells[i];
            if (val instanceof Date) {
                row += val.toISOString();
                continue;
            }
            if (typeof val === 'number') {
                row += val;
                continue;
            }
            row += Csv.escape(val);
        }
        this.write(row);
    }
    write(mix: string | any[]): void {
        if (this._file == null) {
            throw new Error('Create the instance via static::create');
        }
        if (typeof mix !== 'string' && Array.isArray(mix)) {
            this.writeRow(mix);
            return;
        }
        let message = mix;

        this._file.write(message);

        if (this._file.buffer.length > this.opts.messageBufferMax) {
            this._file.flushAsync();
        }

        if (this._file.size >= this.opts.fileBytesMax) {
            this._idx++;
            this.nextFile();
            return;
        }
        if (Date.now() >= this._tomorrowMid) {
            this._todayMid = this._tomorrowMid;
            this._tomorrowMid = date_getMidnight(new Date(), 1);
            this.nextFile();
            return;
        }
    }
    flush () {
        this._file.flushSync();
    }
    protected init (opts: ILoggerOpts) {
        this.opts = opts;
        if (opts.directory.startsWith('./')) {
            opts.directory = Path.resolve(process.cwd(), opts.directory);
        }
        if (opts.fileCountMax == null) {
            opts.fileCountMax = 10;
        }
        if (opts.fileBytesMax == null) {
            opts.fileBytesMax = 500 * 1024;
        }
        if (opts.fileMessagesMax == null) {
            opts.fileMessagesMax = 100 * 1000;
        }
        if (opts.messageBufferMax == null) {
            opts.messageBufferMax = 50;
        }

        let directory = opts.directory;

        dir_ensure(directory);

        this.directory = directory;

        const rgx = /^(\d+)_((\d{1,3})_)?/;
        let files = dir_read(directory).sort();
        let i = files.length;
        let filename: string;
        while (--i > -1) {
            filename = files[i];
            if (rgx.test(filename)) {
                break;
            }
        }
        let lastPath = i > - 1 ? Path.resolve(directory, filename) : null;
        if (lastPath != null && rgx.test(filename)) {
            let match = rgx.exec(filename);

            let idx = Number(match[3] ?? 1);
            let timestamp = Number(match[1]);
            if (timestamp <= this._todayMid || timestamp >= this._tomorrowMid) {
                this._idx = idx;
                this._file = this.nextFile();
            } else {
                this._file = new File(lastPath, this.opts, true);
            }
        }
        if (this._file == null) {
            this._file = this.nextFile();
        }
        if (this._file.size >= opts.fileBytesMax) {
            this._idx++;
            this.nextFile();
        }
        if (files.length >= opts.fileCountMax) {
            files
                .slice(0, files.length - opts.fileCountMax + 1)
                .forEach(function (filename) {
                    file_remove(Path.resolve(directory, filename));
                });
        }

        const onExit = require('signal-exit');
        onExit(() => {
            this._file?.flushSync();
        });
    }

    private nextFile() {
        if (this._file != null) {
            this._file.flushSync();
        }

        const d = new Date();
        // TIMESTAMP_FILECOUNTER_READABLETIME
        const filename = `${ d.getTime() }_${this._idx}__${Formatter(d, 'MM-dd')}.csv`;
        const path = Path.resolve(this.opts.directory, filename);
        return new File(path, this.opts);
    }
}

class File {
    buffer: string[] = []
    size = 0

    busy = false
    errored = false
    listeners = []

    constructor(public path: string, public opts: ILoggerOpts, shouldReadStats = false) {
        // read file size to ensure we are under the file size limit (in opts).
        this.size = shouldReadStats
            ? file_readSize(this.path)
            : 0
            ;
    }
    write (message) {
        this.size += message.length + os_EndOfLine.length;
        this.buffer.push(message);
    }
    flushAsync(cb?) {
        const str = this.getBuffer();
        if (str == null) {
            cb?.();
            return;
        }
        file_appendAsync(this.path, str, cb);
    }
    flushSync() {
        const str = this.getBuffer();
        if (str == null) {
            return;
        }
        file_append(this.path, str);
    }
    private getBuffer() {
        if (this.buffer.length === 0) {
            return null;
        }
        const data = this.buffer.join(os_EndOfLine) + os_EndOfLine;
        this.buffer.length = 0;
        return data;
    }
};
