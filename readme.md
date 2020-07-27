Atma Server Monit
-----

> High-performance fs logging with buffering, file retention and thread safe.

1. Simple Request and Error watcher - logs to fs and slack.

```ts
import { Monit } from 'atma-server-monit'

Monit.start(app.lifecycle, {
    directory: `./logs/`,
    slack: {
        token: '',
        channelId: ''
    },

    fileCountMax: 20,
    fileBytesMax: 500 * 1024;
    fileMessagesMax: 10 ** 7
    messageBufferMax: 50;
    columns: [] as ICsvColumn[];
})
```

2. Custom Event Streams

```ts
const channel = Monit.createChannel('foo', {
    columns: [
        { name: 'Title', filterable: true },
        { name: 'MyVal', type: 'number', sortable: true, groupable: true },
        { name: 'Timestamp', type: 'date', sortable: true, groupable: true },
    ]
});
channel.write(`Lorem ipsum, 123, ${Date.now()}`);
```

## Dev

### Core (`/src/`)

* Collects events from a server or from custom streams, and proceeds with persistence or further propagation (_slack_)
* Creates a subapp to view collected events

### Viewer (`/www/`)

SubApplication to view/sort/filter collected events

* Development endpoints (_unbuild source_):
    * web: `http://localhost:5777/atma/monit/index.dev.html`
    * api, e.g: `http://localhost:5777/atma/monit/api/logs/channels`


### Prepair

```sh
> npm i
> cd www/
> npm i
```

### Start Example(_Dev Project for the viewer_)

```sh
# builds core to be available for example as lib
> npm run watch

# starts demo server with Core and Viewer attached
> npm run example

# navigate to http://localhost:5777/atma/monit/index.dev.html
```

----
The MIT License
