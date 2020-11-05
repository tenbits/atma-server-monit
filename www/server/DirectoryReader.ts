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
        if (/file:/.test(dir) === false) {
            dir = 'file://' + dir;
        }
        let files = await Directory.readFiles(dir);

        let readers = files
            .filter(x => x.uri.file !== 'meta.json')
            .map(file => {
                return FileReader.create(this.channel, file.uri.toString());
            });

        return readers;
    }


    static create(channel: LoggerFile) {
        return new DirectoryReader(channel);
    }
}
