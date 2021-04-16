import { Application } from 'atma-server'
import { MonitWorker, IMonitOptions } from './MonitWorker';
import { ILoggerOpts, EmptyLoggerFile, LoggerFile } from './fs/LoggerFile';
import { class_Uri } from 'atma-utils';
import { ChannelReader } from './reader/ChannelReader';


export namespace Monit {
    let monit: MonitWorker;

    export async function startLogger (opts: IMonitOptions) {
        if (monit == null) {
            monit = new MonitWorker(null, { ...(opts ?? {}), disableDefaultLoggers: true });
            await monit.restoreChannelsAsync();
        }
    }

    export function start (app: Application, opts: IMonitOptions) {
        monit = new MonitWorker(app.lifecycle, opts);
        monit.restoreChannelsAsync();

        let basicAuth = require('express-basic-auth');
        let base = 'file://' + __dirname.replace(/\\/g, '/').replace(/[^\/]+\/?$/, 'www/');

        let pss = app.config.$get('monit.pss') ?? app.config.$get('server.monit.pss');
        let noPssFn = function (req, res, next) {
            next(new Error(`Password not set in 'monit.pss' nor in 'server.monit.pss'`));
        };
        let basicAuthFn = pss == null ? noPssFn : basicAuth({
            users: { [pss]: pss },
            challenge: true,
            realm: 'MonitPss'
        });

        const { Application, StaticContent } = require('atma-server');

        let subApp = new Application({
            base,
            configs: null,
            config: {
                service: {
                    endpoints: base + 'endpoints/'
                }
            },
        });
        subApp.processor({
            before: [
                function (req, res, next) {
                    res.status = function (code) {
                        this.statusCode = code;
                        return this;
                    };
                    res.send = function (data) {
                        this.end(data);
                        return this;
                    };
                    res.set = function (key, val) {
                        this.setHeader(key, val);
                    }
                    next();
                },
                basicAuthFn
            ],
            after: [
                StaticContent.create()
            ]
        });
        subApp.lib = {
            monit
        };
        app.handlers.registerSubApp('atma/monit', subApp, null);
    }
    export function createChannel (name: string, opts?: Partial<ILoggerOpts>) {
        return monit?.createChannel(name, opts) ?? new EmptyLoggerFile();
    }

    export function createChannelReader (channel: LoggerFile)
    export function createChannelReader (name: string, opts?: Partial<ILoggerOpts>)
    export function createChannelReader (mix: string | LoggerFile, opts?: Partial<ILoggerOpts>) {
        let channel: LoggerFile = null;
        if (typeof mix === 'string') {
            if (opts?.directory == null) {
                throw new Error(`Set the root directory to read the logs from`);
            }
            channel = LoggerFile.create(mix, {
                directory: null,
                ...opts
            });
        } else {
            channel = mix;
        }

        return new ChannelReader(channel);
    }
    export function flush () {
        monit?.flush();
    }
    export function error (error: Error ) {
        monit?.writeError(error);
    }
}

declare var global;
if (global.atma == null) {
    global.atma = {};
}
global.atma.Monit = Monit;
