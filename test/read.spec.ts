import { FileReader } from '../src/reader/FileReader';
import { LoggerFile } from '../src/fs/LoggerFile';
import { class_Uri } from 'atma-utils';
import { File, Directory } from 'atma-io';
import { Monit } from '../src/index';

UTest({
    $config: {
        timeout: 60 * 60 * 1000
    },
    async $before () {
        let files = await Directory.readFilesAsync('./test/fixtures/', '**.idx.json');
        await Promise.all(files.map(file => file.removeAsync()));
    },
    async 'read file partial' () {
        let channel = LoggerFile.create('foo', {
            fields: [
                { name: 'Date', type: 'date' },
                { name: 'Message', type: 'string' },
            ],
            directory: './test/fixtures'
        });

        let file = new File('./test/fixtures/foo/1614761176387_0__03-03.csv');
        let reader = FileReader.create(channel, file.uri.toString());

        let result = await reader.fetch({
            offset: 1,
            limit: 2,
        });
        let letters = result.rows.map(x => x[1]);
        deepEq_(letters, ['c', 'b']);
    },
    async 'reader channel partial' () {
        let reader = Monit.createChannelReader('foo', {
            fields: [
                { name: 'Date', type: 'date' },
                { name: 'Message', type: 'string' },
            ],
            directory: './test/fixtures'
        });

        let resultAll = await reader.fetch({});
        let lettersAll = resultAll.rows.map(x => x[1]);
        deepEq_(lettersAll, 'abcdefgh'.split('').reverse());

        let result = await reader.fetch({
            offset: 1,
            limit: 2,
        });
        let letters1 = result.rows.map(x => x[1]);
        deepEq_(letters1, ['g', 'f']);


        let result2 = await reader.fetch({
            offset: 3,
            limit: 3,
        });
        let letters2 = result2.rows.map(x => x[1]);
        deepEq_(letters2, ['e', 'd', 'c']);

        let result3 = await reader.fetch({
            from: new Date('2021-03-04T00:00:00Z'),
            to: new Date('2021-03-04T08:15:00Z'),
        });
        let letters3 = result3.rows.map(x => x[1]);
        deepEq_(letters3, ['f', 'e']);
    }
})
