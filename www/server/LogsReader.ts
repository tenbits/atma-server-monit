import { MonitWorker } from '../../src/MonitWorker';
import { Json, Rule } from 'class-json';
import alot from 'alot';
import { DirectoryReader } from './DirectoryReader';
import { Table, ITableColumnFilter } from '../../src/model/Table';
import { ICsvColumn } from '../../src/model/ICsvColumn';
import { ChannelReader } from './ChannelReader';
import { DayDate } from '../../src/model/DayDate';

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
    getChannelInfo (key: string) {
        let channel = this.monit.loggers[key];
        if (channel == null) {
            throw new Error(`Channel ${key} not found`);
        }
        return {
            name: key,
            directory: channel.directory,
            columns: channel.opts.fields
        };

    }
    async getChannelDays (key: string) {
        let channel = this.monit.loggers[key];
        if (channel == null) {
            throw new Error(`Channel ${key} not found`);
        }
        let channelReader = new ChannelReader(channel);
        return channelReader.getDays();
    }
    async getChannelData (query: GetChannelParams) {

        let channel = this.monit.loggers[query.key];
        if (channel == null) {
            throw new Error(`Channel ${query.key} not found`);
        }
        let channelReader = new ChannelReader(channel);
        return channelReader.getData(query);
    }
}

export class GetChannelParams {

    @Rule.required()
    key: string

    @Json.type(Number)
    sortByColumnIdx?: number
    sortDir?: 'asc' | 'desc'

    columnFilters?: ITableColumnFilter[]

    @Json.type(DayDate)
    day: DayDate

    @Json.type(Date)
    rangeStart?: Date

    @Json.type(Date)
    rangeEnd?: Date

    @Json.type(Number)
    offset?: number

    @Json.type(Number)
    limit?: number
};



