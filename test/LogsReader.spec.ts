
import { LogsReader } from '../src/reader/LogsReader';
import { MonitWorker } from '../src/MonitWorker'

UTest({
    async 'should parse csv' () {
        let monit = new MonitWorker(null, {
            directory: './test/fixtures/'
        });

        let reader = new LogsReader(monit)

        let data = await reader.getChannelData({
            key: 'requests',
            rangeStart: new Date(2000, 0, 1),
        });

        gt_(data.size, 2);
        is_(data.rows[0][0], Date);
        eq_(typeof data.rows[0][1], 'number');
    }
})
