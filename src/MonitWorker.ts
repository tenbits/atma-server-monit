import { SlackClient } from './Slack';
import { LoggerFile, ILoggerOpts } from './fs/LoggerFile';
import { Csv } from './utils/csv';
import { LifecycleEvent, LifecycleEvents } from 'atma-server/HttpApplication/LifecycleEvents';
import { Err } from './utils/err';


export interface IMonitOptions {
    directory?: string
    slack?: {
        token: string
        channelId: string
    }
    filterForSlack?: (event: LifecycleEvent) => boolean
}

export class MonitWorker {

    slack: SlackClient;
    loggers: {
        start: LoggerFile
        requests: LoggerFile
        errors: LoggerFile

        [name: string]: LoggerFile
    }
    constructor (public events: LifecycleEvents, public opts: IMonitOptions) {
        if (opts.slack) {
            this.slack = new SlackClient(opts.slack);
        }

        const loggerOpts = {
            directory: opts.directory
        };
        this.loggers = {
            start: LoggerFile.create('start', Object.assign(<Partial<ILoggerOpts>>{
                columns: [
                    {
                        name: 'Date',
                        type: 'date',
                        sortable: true
                    },
                    {
                        name: 'message'
                    }
                ]
            }, loggerOpts)),
            requests: LoggerFile.create('requests', Object.assign(<Partial<ILoggerOpts>>{
                columns: [
                    {
                        name: 'Date',
                        type: 'date',
                        sortable: true
                    },
                    {
                        name: 'Status',
                        type: 'number',
                        sortable: true
                    },
                    {
                        name: 'Method',
                        type: 'string'
                    },
                    {
                        name: 'Url',
                        type: 'string',
                        filterable: true
                    },
                    {
                        name: 'Time',
                        type: 'number',
                        sortable: true
                    },
                    {
                        name: 'User'
                    },
                    {
                        name: 'Error',
                    }
                ]
            }, loggerOpts)),
            errors: LoggerFile.create('errors', Object.assign(
                <Partial<ILoggerOpts>>{
                    columns: [
                        {
                            name: 'Date',
                            type: 'date',
                            sortable: true
                        },
                        {
                            name: 'Error',
                        }
                    ]
            }, loggerOpts)),
        };
        this.watch(events);
    }

    createChannel (name: string, opts?: Partial<ILoggerOpts>): LoggerFile {
        if (name in this.loggers) {
            return this.loggers[name];
        }
        return this.loggers[name] = LoggerFile.create(name, Object.assign({
            directory: this.opts.directory
        }, opts ?? {}));
    }

    watch (events: LifecycleEvents) {
        events.on('AppStart', (event) => {
            this.slack?.send(event.message);
            this.loggers.start.write(
                `${new Date().toISOString()}, ${Csv.escape(event.message)}, ${event.time}ms`
            );
        });
        events.on('HandlerError', (event, req, res) => {
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.method}, ${Csv.escape(event.url)}, ${event.time}ms, ${event.user ?? ''}, ${ Err.serializeError(event.error ?? event.message)}`
            );
            let status = event.status ?? (event.error as any)?.statusCode ?? 500;
            if (status <= 404 || this.slack == null) {
                return;
            }
            if (this.opts?.filterForSlack?.(event) === false) {
                return;
            }
            let message = event.message;
            let stack = event.error?.stack;
            if (stack) {
                message += "\n" + "```" + stack + "```";
            }
            this.slack.send(message);
        });
        events.on('HandlerSuccess', (event, req, res) => {
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.method}, ${Csv.escape(event.url)}, ${event.time}ms, ${event.user ?? ''}`
            );
        });
    }

    writeError (error: Error) {
        this.loggers.errors.write(
            `${new Date().toISOString()}, ${Err.serializeError(error)}`
        );
        if (this.opts?.filterForSlack(<any> { error })) {
            this.slack?.send(event.toString());
        }
    }

    /** Flush all buffered content to disk */
    flush () {
        for (let key in this.loggers) {
            this.loggers[key].flush();
        }
    }
}
