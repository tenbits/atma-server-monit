import { Monit } from '../../src/Monit';

export class LogsReader {
    constructor (public monit: Monit) {

    }

    getChannels () {
        return Object.keys(this.monit.loggers).map(key => {
            let channel = this.monit.loggers[key];
            return {
                name: key,
                directory: channel.directory,
                columns: channel.opts.fields
            }
        })
    }
}