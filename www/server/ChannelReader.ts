import { LoggerFile } from '../../src/fs/LoggerFile';
import { ICsvColumn } from '../../src/model/ICsvColumn';
import { GetChannelParams } from './LogsReader';
import { DirectoryReader } from './DirectoryReader';
import { Table } from '../../src/model/Table';
import alot = require('alot');

export class ChannelReader {
    constructor (public channel: LoggerFile) {

    }
    async getDays () {
        let directory = DirectoryReader.create(this.channel);
        let readers = await directory.readFiles();

        let days = alot(readers)
            .sortBy(x => x.day.valueOf(), 'desc')
            .map(reader => {
                return {
                    day: reader.day
                };
            })
            .toArray();
        return days;
    }
    async getData (query: GetChannelParams) {
        let rangeStart = query.rangeStart;
        let rangeEnd = query.rangeEnd ?? new Date();
        if (rangeStart == null) {
            rangeStart = new Date(
                rangeEnd.getFullYear(),
                rangeEnd.getMonth(),
                rangeEnd.getDate(),
                0, 0, 0, 0
            );
        }

        let channel = this.channel;
        let fields: ICsvColumn[] = channel.opts.fields ?? (channel.opts as any).columns;
        if (fields == null) {
            throw new Error(`Channel ${query.key} has no fields defined`);
        }

        let directory = DirectoryReader.create(channel)
        let readers = await directory.readFiles();

        readers = readers.filter(reader => {
            if (reader.day > rangeEnd) {
                return false;
            }
            if (reader.dayEnd < rangeStart) {
                return false;
            }
            return true;
        });


        let rows = await alot(readers)
            .sortBy(x => x.day.valueOf(), 'desc')
            .mapManyAsync(async reader => {
                return await reader.read();
            })
            .toArrayAsync();


        let table = new Table(fields, rows);
        return {
            columns: fields,
            rows: table.getTable(query),
            size: table.size
        }
    }
}
