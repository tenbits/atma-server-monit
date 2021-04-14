import { Directory } from 'atma-io';
import { ILoggerOpts, LoggerFile } from '../fs/LoggerFile';
import { FileReader } from './FileReader';
import { File } from 'atma-io';
import * as alot from 'alot';

export class DirectoryReader {
    constructor(public channel: LoggerFile) {
    }
    async readFiles(): Promise<FileReader[]> {
        let dir = this.channel.directory;
        if (dir.endsWith('/') === false) {
            dir += '/';
        }
        if (/file:/.test(dir) === false) {
            dir = 'file://' + dir;
        }
        let files = await Directory.readFiles(dir);

        let metaFile = files.find(x => x.uri.file === 'meta.json');
        if (metaFile != null) {
            files = files.filter(x => x !== metaFile);

            if (0 === (this.channel.opts?.fields?.length ?? 0)) {
                let meta = await metaFile.readAsync<ILoggerOpts>();
                this.channel.opts = {
                    ...(this.channel.opts ?? {}),
                    ...meta
                };
            }
        }

        let indexesHash = new Map<string, InstanceType<typeof File>>();
        let indexes = files
            .filter(x => x.uri.file.endsWith('.idx.json'));

        if (indexes.length > 0) {
            files = files.filter(x => indexes.includes(x) === false);

            indexesHash = alot(indexes)
                .toMap(x => x.uri.file.replace('.idx.json', ''), x => x);
        }


        let readers = files
            .map(file => {
                return FileReader.create(
                    this.channel,
                    file.uri.toString(),
                    indexesHash.get(file.uri.getName())
                );
            });

        return readers;
    }


    static create(channel: LoggerFile) {
        return new DirectoryReader(channel);
    }
}
