import { LifecycleEvents } from 'atma-server'
import * as logger from 'atma-logger'
import { SlackClient } from './Slack';

interface IMonitOptions {
    directory: string,
    slack: {
        // clientId: string
        // clientSecret: string
        token: string
        channelId: string
    }
}

export namespace Monit {
    let watcher: Watcher;

    export function start (events: LifecycleEvents, opts: IMonitOptions) {
        watcher = new Watcher(events, opts);
    }
}


class Watcher {
    messages: { date: Date, message: string }[] = []

    slack: SlackClient;
    logger: any;
    constructor (public events: LifecycleEvents, opts: IMonitOptions) {
        this.slack = new SlackClient(opts.slack);
        this.logger = logger.cfg({
            color: 'none',
            logCaller: false,
            logDate: 'dd.MM hh:mm',
            transport: {
                type: 'fs', 
                extension: 'csv',
                directory: opts.directory
            }
        });
        this.watch();
    }

    watch () {
        this.events.on('AppStart', (event) => {
            this.slack.send(event.message);
            this.logger.log(event.message);
        });
        this.events.on('HandlerError', (event, req, res) => {
            if (this.add(event) === false) {
                return;
            }
            this.slack.send(event.message);
            this.logger.error(event.message);
        });
        this.events.on('HandlerSuccess', (event, req, res) => {
            this.logger.log(event.message);
        });
    }

    private add (event) {
        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].message === event.message) {
                return false;
            }
        }
        let remove = this.messages.length - 10;
        if (remove > 0) {
            this.messages.splice(0, remove);
        }
        this.messages.push(event.message);
        return true;
    }
}
