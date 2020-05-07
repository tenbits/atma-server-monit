import { MonitWorker } from '../../src/MonitWorker';

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
            }
        })
    }
}
