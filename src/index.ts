import { LifecycleEvents } from 'atma-server'
import * as logger from 'atma-logger'
import { SlackClient } from './Slack';
import { LoggerFile } from './fs/LoggerFile';

interface IMonitOptions {
    directory?: string,
    slack?: {
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
    export function flush () {
        watcher?.logger.flush();
    }
}


class Watcher {
    messages: { date: Date, message: string }[] = []

    slack: SlackClient;
    logger: LoggerFile;
    constructor (public events: LifecycleEvents, opts: IMonitOptions) {
        if (opts.slack) {
            this.slack = new SlackClient(opts.slack);
        }
        
        this.logger = new LoggerFile();
        this.logger.init({
            directory: opts.directory
        });
        this.watch();
    }

    watch () {
        this.events.on('AppStart', (event) => {
            this.slack?.send(event.message);
            this.logger.write(event.message);
        });
        this.events.on('HandlerError', (event, req, res) => {
            if (this.add(event) === false) {
                return;
            }
            this.slack?.send(event.message);
            this.logger.write(event.message);
        });
        this.events.on('HandlerSuccess', (event, req, res) => {
            this.logger.write(event.message);
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
