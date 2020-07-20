import { Directory } from 'atma-io';
import { LoggerFile } from '../../src/fs/LoggerFile';
import { FileReader } from './FileReader';


export class DirectoryReader {
    constructor(public channel: LoggerFile) {
    }
    async readFiles(): Promise<FileReader[]> {
        let dir = this.channel.directory;
        if (dir.endsWith('/') === false) {
            dir += '/';
        }
        let files = await Directory.readFiles(dir);

        let readers = files.map(file => {
            return new FileReader(this.channel, file);
        });

        return readers;
    }


    static create(channel: LoggerFile) {
        return new DirectoryReader(channel);
    }
}
