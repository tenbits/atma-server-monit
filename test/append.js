var fs = require('fs');
var Path = require('path');

var filename = Path.resolve(process.cwd(), 'test/tmp/multiprocess.txt');
var data = process.argv[2];
if (!data) throw new Error('data expected');


fs.appendFileSync(filename, data);
