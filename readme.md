Atma Server Monit
-----

Simple Request and Error watcher - log to fs and slack.

```ts
import { Monit } from 'atma-server-monit'

Monit.start(app.lifecycle, {
    directory: `/logs/`,
    slack: {
        token: '',
        channelId: ''
    }
})
```

----
The MIT License