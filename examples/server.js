

let lib = require('includejs');
let server = require('atma-server');
let { Monit } = require('../lib/index');

lib
    .include
    .cfg('amd', true)
    .cfg('es6Exports', true)
    .cfg('extentionDefault', { js: 'ts' });

new server
    .Application({
        base:__dirname,
        configs: './configs/**.yml',
        config: {
            SERVER: true,
            TEST: true
        }
    })
    .done((app) => {

            app
                .processor({
                    before: [],
                    middleware: [],
                    after: [
                        server.middleware.static
                    ]
                })
                .listen(app.config.$get('port') || 5777);

            Monit.start(app, { directory: './logs/' });

    });
