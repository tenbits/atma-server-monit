import { LifecycleEvent, LifecycleEvents } from 'atma-server/HttpApplication/LifecycleEvents';
import { class_Uri } from 'atma-utils';
import alot from 'alot';
import { SlackClient } from './Slack';
import { LoggerFile, ILoggerOpts } from './fs/LoggerFile';
import { Csv } from './utils/csv';
import { Err } from './utils/err';
import { dir_readAsync } from './fs/fs';
import { ChannelReader } from './reader/ChannelReader';
import { Directory } from 'atma-io';


export interface IMonitOptions {
    directory?: string
    channels?: {
        [name: string]: ILoggerOpts
    }
    slack?: {
        token: string
        channelId: string
    }
    filterForSlack?: (event: LifecycleEvent) => boolean
}

export class MonitWorker {

    slack: SlackClient;
    loggers: {
        start?: LoggerFile
        requests?: LoggerFile
        errors?: LoggerFile

        [name: string]: LoggerFile
    }
    constructor(public events: LifecycleEvents, public opts: IMonitOptions & { disableDefaultLoggers?: boolean }) {
        if (opts.slack) {
            this.slack = new SlackClient(opts.slack);
        }

        const loggerOpts = {
            directory: opts.directory
        };
        this.loggers = opts?.disableDefaultLoggers ? {} : {
            start: LoggerFile.create('start', {
                fields: [
                    {
                        name: 'Date',
                        type: 'date',
                        sortable: true
                    },
                    {
                        name: 'message'
                    }
                ],
                ...loggerOpts
            }),
            requests: LoggerFile.create('requests', {
                fields: [
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
                        name: 'IP'
                    },
                    {
                        name: 'Error',
                        type: 'text'
                    }
                ],
                ...loggerOpts
            }),
            errors: LoggerFile.create('errors', {
                fields: [
                    {
                        name: 'Date',
                        type: 'date',
                        sortable: true
                    },
                    {
                        name: 'Error',
                    }
                ],
                ...loggerOpts
            }),
        };

        if (events) {
            this.watch(events);
        }
    }

    createChannel(name: string, opts: Partial<ILoggerOpts> = {}): LoggerFile {
        if (name in this.loggers) {
            return this.loggers[name];
        }
        return this.loggers[name] = LoggerFile.create(name, {
            // directory could be overwritten in  options
            directory: class_Uri.combine(this.opts.directory, name, '/'),
            ...opts
        });
    }

    createChannelReader(channel: LoggerFile) {
        return new ChannelReader(channel);
    }

    watch(events: LifecycleEvents) {
        events.on('AppStart', (event) => {
            this.slack?.send(event.message);
            this.loggers.start.write(
                `${new Date().toISOString()}, ${Csv.escape(event.message)}, ${event.time}ms`
            );
        });
        events.on('HandlerError', (event, req, res) => {
            this.loggers.requests.write(
                `${new Date().toISOString()}, ${event.status}, ${event.method}, ${Csv.escape(event.url)}, ${event.time}ms, ${event.user ?? ''}, ${event.ip ?? ''}, ${Err.serializeError(event.error ?? event.message)}`
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
                `${new Date().toISOString()}, ${event.status}, ${event.method}, ${Csv.escape(event.url)}, ${event.time}ms, ${event.user ?? ''}, ${event.ip ?? ''}`
            );
        });
    }

    writeError(error: Error) {
        this.loggers.errors.write(
            `${new Date().toISOString()}, ${Err.serializeError(error)}`
        );
        if (this.opts?.filterForSlack(<any>{ error })) {
            this.slack?.send(event.toString());
        }
    }

    /** Flush all buffered content to disk */
    flush() {
        for (let key in this.loggers) {
            this.loggers[key].flush();
        }
    }

    async restoreChannelsAsync() {
        let channels = Object.keys(this.loggers);
        let directoryExists = false;
        try {
            directoryExists = await Directory.existsAsync(this.opts.directory);
        } catch (error) { }

        if (directoryExists === true) {
            let files = await dir_readAsync(this.opts.directory);
            await alot(files).forEachAsync(async dirName => {
                if (channels.some(name => name === dirName)) {
                    return;
                }
                let channel = await LoggerFile.restore(
                    this.opts.directory,
                    dirName,
                    this.opts.channels?.[dirName]
                );
                this.loggers[dirName] = channel;
            }).toArrayAsync();
        }
        if (this.opts.channels) {
            for (let key in this.opts.channels) {
                if (key in this.loggers === false) {
                    this.loggers[key] = LoggerFile.prepair(this.opts.channels[key]);
                }
            }
        }
    }
}
