import { LoggerFileRow } from '../src/fs/LoggerFileRow';

UTest({
    async 'serialize'() {
        let row = LoggerFileRow.serialize([ new Date(2020, 0, 5) ], [
            { type: 'date', name: 'Date' },
        ]);

        // do not checkk date, as it is not UTC safe.
        has_(row, '2020-01-0');
    }
})
