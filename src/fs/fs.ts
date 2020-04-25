import * as Fs from 'fs'
import * as Path from 'path'
import { os_EndOfLine } from '../utils/os';

export function dir_read(path) {

    try {
        return Fs.readdirSync(path);
    } catch (error) {
        exception_(path, error);
        return [];
    }
};


export function dir_ensure(path) {
    if (Fs.existsSync(path)) {
        return;
    }

    dir_ensure(Path.dirname(path));

    try {
        Fs.mkdirSync(path);
    } catch (error) {
        exception_(path, error);
    }
};


export function file_readSize(path) {
    try {
        return Fs.lstatSync(path).size;
    } catch (error) {
        return 0;
    }
};

export function file_removeAsync(path, callback) {
    Fs.unlink(path, function (error) {
        if (error) {
            exception_(path, error);
        }
        callback(error);
    });
};

export function file_remove(path) {
    try {
        Fs.unlinkSync(path);
    } catch (error) {
        exception_(path, error);
    }
};

export function file_appendAsync(path, str, callback) {
    if (!str) {
        callback?.();
        return;
    }

    Fs.open(path, 'a', function (error, fd) {
        if (error != null) {
            exception_(path, error);
            callback?.(error);
            return;
        }
        Fs.write(fd, str, () => {
            if (error) {
                exception_(path, error);
            }
            Fs.close(fd, () => callback?.());
        })
    });
};

export function file_append(path, str) {
    if (!str) {
        return;
    }
    try {
        const fd = Fs.openSync(path, 'a');
        Fs.writeSync(fd, str);
        Fs.closeSync(fd);
    } catch (error) {
        exception_(path, error);
    }
};

function exception_(filename, error, logStd = false) {
    if (logStd !== true) {
        console.error(error);
    }

    let directory = Path.dirname(filename);
    try {
        Fs.appendFileSync(
            Path.resolve(directory, 'logger-exceptions.txt'),
            `${filename}: ${error.message} ${os_EndOfLine}`
        );
    } catch (error_) {
        if (error_.code === 'ENOENT') {
            dir_ensure(directory);
            exception_(filename, error, false);
            return;
        }
        console.error(error_);
    }
}