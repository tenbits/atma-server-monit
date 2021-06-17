import { LoggerFile } from '../fs/LoggerFile';
import { ICsvColumn } from '../model/ICsvColumn';
import { GetChannelParams } from './LogsReader';
import { DirectoryReader } from './DirectoryReader';
import { Table } from '../model/Table';
import alot from 'alot'


export interface IChannelLinesQuery {
    offset?: number
    limit?: number
    from?: Date
    to?: Date
}

export class ChannelReader {
    constructor (public channel: LoggerFile) {

    }
    async fetch (query: IChannelLinesQuery) {
        let readers = await this.getReaders();
        let result = [];

        let offset = query.offset ?? 0;
        let limit = query.limit ?? 500;
        let matched = false;

        for (let i = 0; i < readers.length; i++) {
            let { total, rows } = await readers[i].fetch({
                offset: matched ? 0 : offset,
                limit: limit - result.length,
                from: query.from,
                to: query.to,
            });
            if (matched === true && rows.length === 0) {
                // this file has no extra rows after matched.
                break;
            }

            if (rows.length > 0) {
                result = result.concat(rows);
                if (total < rows.length) {
                    break;
                }
                // otherwise continue to next file
                matched = true;
            }
            if (limit === rows.length) {
                break;
            }
        }
        return {
            rows: result,
        };
    }
    async getDays () {
        let readers = await this.getReaders();
        let days = alot(readers)
            .map(reader => {
                return {
                    day: reader.day.serialize()
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
        let fields: ICsvColumn[] = channel.opts.fields ?? channel.opts.columns;

        let directory = DirectoryReader.create(channel)
        let readers = await directory.readFiles();

        readers = readers.filter(reader => {
            if (query.day != null) {
                return query.day.isEqual(reader.day);
            }

            if (reader.day.isAfter(rangeEnd)) {
                return false;
            }
            if (reader.day.isBefore(rangeStart)) {
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

        if (fields == null) {
            fields = rows?.[0]?.map((x, idx) => {
                return {
                    idx: idx,
                    name: '',
                    type: 'string'
                }
            });
        }
        let table = new Table(fields, rows);
        return {
            columns: fields,
            rows: table.getTable(query),
            size: table.size
        }
    }

    protected async getReaders () {
        let directory = DirectoryReader.create(this.channel);
        let readers = await directory.readFiles();
        return alot(readers)
            .sortBy(x => x.day.valueOf(), 'desc')
            .toArray();
    }
}
