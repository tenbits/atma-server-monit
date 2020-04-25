import { Application, LifecycleEvents, StaticContent } from 'atma-server'
import { Monit, IMonitOptions } from './Monit';
import { ILoggerOpts } from 'atma-server-monit/fs/LoggerFile';


export namespace MonitFactory {
    let monit: Monit;

    export function start (app: Application, opts: IMonitOptions) {
        monit = new Monit(app.lifecycle, opts);

        let base = __dirname.replace(/[^\/]+\/?$/, 'www/');
        let subApp = new Application({
            base,
            configs: null,
            config: {
                service: {
                    endpoints: './endpoints/'
                }
            },
        });
        subApp.processor({
            after: [
                StaticContent.create()
            ]
        });
        subApp.lib = {
            monit
        };
        app.handlers.registerSubApp('atma/monit', subApp, null);
    }
    export function createChannel (name: string, opts?: ILoggerOpts) {
        return monit.createChannel(name, opts);
    }
    export function flush () {
        monit?.flush();
    }
    export function error (error: Error ) {
        monit?.writeError(error);
    }
}
