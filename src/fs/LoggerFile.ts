import { file_readSize, file_appendAsync, file_append, dir_ensure, dir_read, file_remove } from './fs';
import { os_EndOfLine } from '../utils/os';
import * as Path from 'path'
import  * as Formatter from 'atma-formatter'
import { date_getMidnight } from '../utils/date';
import { class_Uri } from 'atma-utils';
import { Directory, File } from 'atma-io';
import { Csv } from '../utils/csv';
import { ICsvColumn } from '../model/ICsvColumn';


export interface ILoggerOpts {
    directory: string
    fileCountMax?: number
    fileBytesMax?: number
    fileMessagesMax?: number
    messageBufferMax?: number
    writeTimeout?: number
    fields?: ICsvColumn[]

    //@obsolete Use fields
    columns?: ICsvColumn[]
}
export interface ILogger {
    writeRow (cells: any[])
    write(mix: string | any[]): void
    flush ()
    removeAll (): Promise<any>
}

export class EmptyLoggerFile implements ILogger {
    writeRow(cells: any[]) {

    }
    write(mix: string | any[]): void {

    }
    flush() {

    }
    removeAll () {
        return null;
    }
}
export class LoggerFile implements ILogger {
    public directory: string;
    public opts: ILoggerOpts;

    /** Filecounter, in case we have to create multiple files for a day due to filesize limit */
    private _idx = 0
    private _file: FileHandler;
    private _todayMid = date_getMidnight(new Date());
    private _tomorrowMid = date_getMidnight(new Date(), 1);
    private _writeTimer = null;
    private _initialized = false;

    static create (key: string, opts: ILoggerOpts) {
        let logger = new LoggerFile({
            ...opts,
        });
        return logger;
    }

    static prepair (opts: ILoggerOpts) {
        let logger = new LoggerFile(opts);
        return logger;
    }

    static async restore (directory: string, key: string, options?: ILoggerOpts) {
        let directoryPath = class_Uri.combine(directory, key, '/');
        let metaPath = class_Uri.combine(directoryPath, 'meta.json');

        let opts = <ILoggerOpts> {
            directory: directoryPath,
            ...(options ?? {})
        };

        let meta = {};
        try {
            meta = await File.readAsync<object>(metaPath);
        } catch (error) { /* doesnt exists */ }

        let logger = new LoggerFile({
            ...opts,
            ...meta,
        });
        return logger;
    }

    protected constructor (opts: ILoggerOpts) {
        this.initOptions(opts);
        this.onTimeout = this.onTimeout.bind(this);
    }

    writeRow (cells: any[]) {
        let row = this.serializeRow(cells);
        this.write(row);
    }
    writeRows (cellsMany: any[][]) {
        let rows = cellsMany.map(cells => this.serializeRow(cells));
        this.write(rows.join('\n'));
    }
    write(mix: string | any[]): void {
        if (this._initialized === false) {
            this.init();
        }
        if (this._file == null) {
            throw new Error('Create the instance via static::create');
        }
        if (typeof mix !== 'string' && Array.isArray(mix)) {
            this.writeRow(mix);
            return;
        }

        let message = mix;
        if (Date.now() >= this._tomorrowMid) {
            this._todayMid = this._tomorrowMid;
            this._tomorrowMid = date_getMidnight(new Date(), 1);
            this._file = this.nextFile();
        }
        if (this._file.size >= this.opts.fileBytesMax) {
            this._idx++;
            this._file = this.nextFile();
        }

        this._file.write(message);

        if (this._file.buffer.length > this.opts.messageBufferMax) {
            this.flushAsync();
        }
        if (this._writeTimer == null && this.opts.writeTimeout !== 0) {
            this._writeTimer = setTimeout(this.onTimeout, this.opts.writeTimeout)
        }
    }
    get path () {
        return this._file?.path;
    }

    flush () {
        this.flushSync();
    }

    async removeAll() {
        if (this.directory) {
            await Directory.removeAsync(this.directory);
        }
        return null;
    }

    protected initOptions (opts: ILoggerOpts) {
        this.opts = opts;
        if (/^(\.?\/)/.test(opts.directory)) {
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
        if (opts.writeTimeout == null) {
            opts.writeTimeout = 10 * 1000;
        }
        this.directory = opts.directory;
    }

    protected init () {
        this._initialized = true;

        dir_ensure(this.directory);

        const rgx = /^(\d+)_((\d{1,3})_)?/;
        let files = dir_read(this.directory).sort();
        let i = files.length;
        let filename: string;
        while (--i > -1) {
            filename = files[i];
            if (rgx.test(filename)) {
                break;
            }
        }
        let lastPath = i > - 1 ? Path.resolve(this.directory, filename) : null;
        if (lastPath != null && rgx.test(filename)) {
            let match = rgx.exec(filename);

            let idx = Number(match[3] ?? 1);
            let timestamp = Number(match[1]);
            if (timestamp <= this._todayMid || timestamp >= this._tomorrowMid) {
                this._idx = idx;
                this._file = this.nextFile();
            } else {
                this._file = new FileHandler(lastPath, this.opts, true);
            }
        }
        if (this._file == null) {
            this._file = this.nextFile();
        }
        if (this._file.size >= this.opts.fileBytesMax) {
            this._idx++;
            this._file = this.nextFile();
        }
        if (files.length >= this.opts.fileCountMax) {
            files
                .slice(0, files.length - this.opts.fileCountMax + 1)
                .forEach(function (filename) {
                    file_remove(Path.resolve(this.directory, filename));
                });
        }

        const onExit = require('signal-exit');
        onExit(() => {
            this._file?.flushSync();
        });
    }

    private nextFile() {
        if (this._file != null) {
            this.flushSync();
        }

        const d = new Date();
        // TIMESTAMP_FILECOUNTER_READABLETIME
        const filename = `${ d.getTime() }_${this._idx}__${Formatter(d, 'MM-dd-yyyy')}.csv`;
        const path = Path.resolve(this.opts.directory, filename);
        return new FileHandler(path, this.opts);
    }
    private serializeRow (cells: any[]) {
        let fields = this.opts.fields;
        if (fields == null) {
            let row = cells.map(Csv.escape).join(', ');
            return row;
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
        return row;
    }
    private onTimeout () {
        this.flushAsync();
    }
    private flushAsync () {
        if (this._writeTimer != null) {
            clearTimeout(this._writeTimer);
            this._writeTimer = null;
        }
        this._file.flushAsync();
    }
    private flushSync () {
        if (this._writeTimer != null) {
            clearTimeout(this._writeTimer);
            this._writeTimer = null;
        }
        this._file?.flushSync();
    }
}

class FileHandler {
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
