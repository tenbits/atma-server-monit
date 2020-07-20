import { MonitWorker } from '../../src/MonitWorker';
import { Json, Rule } from 'class-json';
import alot from 'alot';
import { DirectoryReader } from './DirectoryReader';
import { Table, ITableColumnFilter } from '../../src/model/Table';
import { ICsvColumn } from '../../src/model/ICsvColumn';

export class LogsReader {
    constructor (public monit: MonitWorker) {

    }

    getChannels () {
        return Object.keys(this.monit.loggers).map(key => {
            let channel = this.monit.loggers[key];
            return {
                name: key,
                directory: channel.directory,
                columns: channel.opts.fields
            };
        });
    }
    async getChannelData (query: GetChannelParams) {
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

        let channel = this.monit.loggers[query.key];
        if (channel == null) {
            throw new Error(`Channel ${query.key} not found`);
        }
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

export class GetChannelParams {

    @Rule.required()
    key: string

    sortByColumnIdx?: number
    sortDir?: 'asc' | 'desc'

    columnFilters?: ITableColumnFilter[]

    @Json.type(Date)
    rangeStart?: Date

    @Json.type(Date)
    rangeEnd?: Date

    offset?: number
    limit?: number
};



