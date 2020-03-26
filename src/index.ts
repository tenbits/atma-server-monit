import { LifecycleEvents } from 'atma-server'
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
        watcher?.flush();
    }
}


class Watcher {
    messages: { date: Date, message: string }[] = []

    slack: SlackClient;
    loggers: {
        start: LoggerFile
        requests: LoggerFile
        errors: LoggerFile
    } 
    constructor (public events: LifecycleEvents, opts: IMonitOptions) {
        if (opts.slack) {
            this.slack = new SlackClient(opts.slack);
        }
        
        const loggerOpts = {
            directory: opts.directory
        };
        this.loggers = {
            start: LoggerFile.create('start', Object.assign({}, loggerOpts)),
            requests: LoggerFile.create('requests', Object.assign({}, loggerOpts)),
            errors: LoggerFile.create('errors', Object.assign({}, loggerOpts)),
        };
        this.watch();
    }

    watch () {
        this.events.on('AppStart', (event) => {
            this.slack?.send(event.message);
            this.loggers.start.write(
                `${new Date().toISOString()}, ${event.message}, ${event.time}ms`
            );
        });
        this.events.on('HandlerError', (event, req, res) => {
            if (this.add(event) === false) {
                return;
            }
            this.slack?.send(event.message);
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.message}`
            );
        });
        this.events.on('HandlerSuccess', (event, req, res) => {
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.url}, ${event.time}ms, ${event.user}`
            );
        });
    }

    flush () {
        this.loggers.start.flush();
        this.loggers.requests.flush();
        this.loggers.errors.flush();
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
