import { file_readSize, file_appendAsync, file_append, dir_ensure, dir_read, file_remove } from './fs';
import { os_EndOfLine } from '../utils/os';
import * as Path from 'path'
import  * as Formatter from 'atma-formatter'

export interface ILoggerOpts {
    directory: string
    fileCountMax?: number
    fileBytesMax?: number
    fileMessagesMax?: number
    messageBufferMax?: number
}

export class LoggerFile {
    private switch_ = 0

    private _file: File;
    private _opts: ILoggerOpts;

    write(message: string): void {
        if (this._file == null) {
            throw new Error('Call init with options first');
        }
        this._file.write(message);

        if (this._file.buffer.length > this._opts.messageBufferMax) {
            this._file.flushAsync();
        }
        if (this._file.size >= this._opts.fileBytesMax) {
            this.nextFile();
        }
    }
    flush () {
        this._file.flush();
    }
    init (opts: ILoggerOpts) {
        this._opts = opts;
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

        const rgx = /^\d+_/g;
        let files = dir_read(directory).sort();
        let i = files.length;
        let filename: string;
        while (--i > -1) {
            filename = files[i];
            if (rgx.test(filename)) {
                break;
            }
        }

        this._file = i > -1
            ? new File(filename.replace(/\.\w+$/, ''), this._opts, true)
            : this.nextFile()
            ;

        if (this._file.size >= opts.fileBytesMax) {
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
            this._file?.flush();
        });
    }

    private nextFile() {
        if (this._file != null)
            this._file.flush();

        const d = new Date();
        const filename = `${d.getTime()}_${this.switch_++}_${Formatter.format(d, 'dd-MM_hh')}.txt`;
        const path = Path.resolve(this._opts.directory, filename);
        return new File(path, this._opts);
    }
}

class File {
    buffer: string[] = []
    size = 0

    busy = false
    errored = false
    listeners = []

    constructor(public path: string, public opts: ILoggerOpts, shouldReadStats = false) {

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
    flush() {
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
