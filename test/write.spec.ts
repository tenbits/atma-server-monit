import * as fs from 'fs'
import { File, Directory, env } from 'atma-io';
import { Shell } from 'shellbee'

UTest({
    $config: {
        timeout: 60 * 60 * 1000
    },
    async 'write parallel in single process' () {
        let path = './test/tmp/parallel.txt';
        let filename = env.currentDir.combine(path).toLocalFile();

        function append (data) {
            return new Promise((resolve, reject) => {
                fs.appendFile(filename, data, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        };
        if (await File.existsAsync(path)) {
            await File.removeAsync(path);
        }

        await Directory.ensureAsync(filename.substring(0, filename.lastIndexOf('/') + 1));

        let data = [];
        for (let i = 0; i < 100; i++) {
            let key = `${i}-${Math.round(Math.random() * (10 ** 10))}`;
            let str = key;
            while (str.length < 20000) {
                str += key;
            }
            data.push(`_${str}_`);
        }
        await Promise.all(data.map(append));

        let content = await File.readAsync(path);
        data.forEach(str => {
            let has = content.includes(str);
            eq_(has, true, `Should include ${str}`);
        })
    },
    async 'write parallel in multi process' () {
        let path = './test/tmp/multiprocess.txt';
        let filename = env.currentDir.combine(path).toLocalFile();

        function append (data) {
            //return new Promise((resolve, reject) => {
                
            return Shell.run({
                    command: `node test/append ${data}`
                });
                
            //});
        };
        if (await File.existsAsync(path)) {
            await File.removeAsync(path);
        }

        await Directory.ensureAsync(filename.substring(0, filename.lastIndexOf('/') + 1));

        let data = [];
        for (let i = 0; i < 100; i++) {
            let key = `${i}-${Math.round(Math.random() * (10 ** 10))}`;
            let str = key;
            while (str.length < 2000) {
                str += key;
            }
            data.push(`_${str}_`);
        }
        await Promise.all(data.map(append));

        let content = await File.readAsync(path);
        data.forEach(str => {
            let has = content.includes(str);
            eq_(has, true, `Should include ${str}`);
        })
    }
})