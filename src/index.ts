import { LifecycleEvents } from 'atma-server'
import { SlackClient } from './Slack';
import { LoggerFile } from './fs/LoggerFile';
import { LifecycleEvent } from 'atma-server/HttpApplication/LifecycleEvents';


export namespace Monit {
    let watcher: Watcher;

    export function start (events: LifecycleEvents, opts: IMonitOptions) {
        watcher = new Watcher(events, opts);
    }
    export function flush () {
        watcher?.flush();
    }
    export function error (error: Error ) {
        watcher?.writeError(error);
    }
}

interface IMonitOptions {
    directory?: string
    slack?: {
        token: string
        channelId: string
    }
    filterForSlack?: (event: LifecycleEvent) => boolean
}


class Watcher {
    messages: { date: Date, message: string }[] = []

    slack: SlackClient;
    loggers: {
        start: LoggerFile
        requests: LoggerFile
        errors: LoggerFile
    } 
    constructor (public events: LifecycleEvents, public opts: IMonitOptions) {
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
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.url}, ${event.time}ms, ${event.user ?? ''}, ${ Utils.serializeError(event.error ?? event.message)}`
            );
            let status = event.status;
            if (event.error) {
                status = (event.error as any)?.statusCode ?? 500;
            }
            if (status <= 404 || this.slack == null) {
                return;
            }
            if (this.add(event) === false) {
                return;
            }
            if (this.opts?.filterForSlack?.(event) === false) {
                return;
            }
            this.slack.send(event.error?.stack ?? event.message);
        });
        this.events.on('HandlerSuccess', (event, req, res) => {
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.url}, ${event.time}ms, ${event.user ?? ''}`
            );
        });
    }

    writeError (error: Error) {
        if (this.add(error) === false) {
            return;
        }
        if (this.opts?.filterForSlack(<any> { error })) {
            this.slack?.send(event.toString());
        }
        this.loggers.errors.write(
            `${new Date().toISOString()}, ${Utils.serializeError(error)}`
        );
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


namespace Utils {
    export function serializeError (error: Error | string) {
        if (typeof error === 'string') {
            return error.replace(/\n/g, '\\\\n');
        }
        if (error.stack) {
            return error.stack.replace(/\n/g, '\\\\n');
        }
        if (error.message) {
            return error.message;
        }
        return String(error);
    }
}