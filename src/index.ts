import { Application, LifecycleEvents, StaticContent } from 'atma-server'
import { MonitWorker, IMonitOptions } from './MonitWorker';
import { ILoggerOpts } from './fs/LoggerFile';


export namespace Monit {
    let monit: MonitWorker;

    export function start (app: Application, opts: IMonitOptions) {
        monit = new MonitWorker(app.lifecycle, opts);

        let basicAuth = require('express-basic-auth');
        let base = 'file://' + __dirname.replace(/\\/g, '/').replace(/[^\/]+\/?$/, 'www/');

        let pss = app.config.$get('monit.pss') ?? (Math.round(Math.random() * 10000000));
        let basicAuthFn = basicAuth({
            users: { [pss]: pss },
            challenge: true,
            realm: 'MonitPss'
        });

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
        return monit.createChannel(name, opts);
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
