
// source ./RootModule.js
(function(){
	
	var _src_Slack = {};
var _src_fs_LoggerFile = {};
var _src_fs_fs = {};
var _src_utils_os = {};

// source ./ModuleSimplified.js
var _src_Slack;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web_api_1 = require("@slack/web-api");
var memd_1 = require("memd");
var SlackClient = /** @class */ (function () {
    function SlackClient(opts) {
        this.isReady = false;
        this.token = opts.token;
        this.channelId = opts.channelId;
    }
    SlackClient.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.web = new web_api_1.WebClient(this.token);
                this.isReady = true;
                return [2 /*return*/];
            });
        });
    };
    SlackClient.prototype.send = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.isReady === false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.login()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.web.chat.postMessage({
                            text: message,
                            channel: this.channelId,
                        })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        memd_1.default.deco.memoize()
    ], SlackClient.prototype, "login", null);
    __decorate([
        memd_1.default.deco.debounce(500)
    ], SlackClient.prototype, "send", null);
    return SlackClient;
}());
exports.SlackClient = SlackClient;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Slack) && isObject(module.exports)) {
		Object.assign(_src_Slack, module.exports);
		return;
	}
	_src_Slack = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_os;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
exports.os_EndOfLine = os_1.EOL;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_os) && isObject(module.exports)) {
		Object.assign(_src_utils_os, module.exports);
		return;
	}
	_src_utils_os = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_fs_fs;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fs = require("fs");
var Path = require("path");
var os_1 = _src_utils_os;
function dir_read(path) {
    try {
        return Fs.readdirSync(path);
    }
    catch (error) {
        exception_(path, error);
        return [];
    }
}
exports.dir_read = dir_read;
;
function dir_ensure(path) {
    if (Fs.existsSync(path)) {
        return;
    }
    dir_ensure(Path.dirname(path));
    try {
        Fs.mkdirSync(path);
    }
    catch (error) {
        exception_(path, error);
    }
}
exports.dir_ensure = dir_ensure;
;
function file_readSize(path) {
    try {
        return Fs.lstatSync(path).size;
    }
    catch (error) {
        return 0;
    }
}
exports.file_readSize = file_readSize;
;
function file_removeAsync(path, callback) {
    Fs.unlink(path, function (error) {
        if (error) {
            exception_(path, error);
        }
        callback(error);
    });
}
exports.file_removeAsync = file_removeAsync;
;
function file_remove(path) {
    try {
        Fs.unlinkSync(path);
    }
    catch (error) {
        exception_(path, error);
    }
}
exports.file_remove = file_remove;
;
function file_appendAsync(path, str, callback) {
    if (!str) {
        callback === null || callback === void 0 ? void 0 : callback();
        return;
    }
    Fs.open(path, 'a', function (error, fd) {
        if (error != null) {
            exception_(path, error);
            callback === null || callback === void 0 ? void 0 : callback(error);
            return;
        }
        Fs.write(fd, str, function () {
            if (error) {
                exception_(path, error);
            }
            Fs.close(fd, callback);
        });
    });
}
exports.file_appendAsync = file_appendAsync;
;
function file_append(path, str) {
    if (!str) {
        return;
    }
    try {
        var fd = Fs.openSync(path, 'a');
        Fs.writeSync(fd, str);
        Fs.closeSync(fd);
    }
    catch (error) {
        exception_(path, error);
    }
}
exports.file_append = file_append;
;
function exception_(filename, error, logStd) {
    if (logStd === void 0) { logStd = false; }
    if (logStd !== true) {
        console.error(error);
    }
    var directory = Path.dirname(filename);
    try {
        Fs.appendFileSync(Path.resolve(directory, 'logger-exceptions.txt'), filename + ": " + error.message + " " + os_1.os_EndOfLine);
    }
    catch (error_) {
        if (error_.code === 'ENOENT') {
            dir_ensure(directory);
            exception_(filename, error, false);
            return;
        }
        console.error(error_);
    }
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_fs_fs) && isObject(module.exports)) {
		Object.assign(_src_fs_fs, module.exports);
		return;
	}
	_src_fs_fs = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_fs_LoggerFile;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = _src_fs_fs;
var os_1 = _src_utils_os;
var Path = require("path");
var Formatter = require("atma-formatter");
var LoggerFile = /** @class */ (function () {
    function LoggerFile() {
        this.switch_ = 0;
    }
    LoggerFile.create = function (group, opts) {
        if (opts.directory.endsWith('/') === false) {
            opts.directory += '/';
        }
        opts.directory += group;
        var logger = new LoggerFile();
        logger.init(opts);
        return logger;
    };
    LoggerFile.prototype.write = function (message) {
        if (this._file == null) {
            throw new Error('Call init with options first');
        }
        this._file.write(message);
        if (this._file.buffer.length > this._opts.messageBufferMax) {
            this._file.flushAsync();
        }
        if (this._file.size >= this._opts.fileBytesMax) {
            this.nextFile();
        }
    };
    LoggerFile.prototype.flush = function () {
        this._file.flush();
    };
    LoggerFile.prototype.init = function (opts) {
        var _this = this;
        this._opts = opts;
        if (opts.directory.startsWith('./')) {
            opts.directory = Path.resolve(process.cwd(), opts.directory);
        }
        if (opts.fileCountMax == null) {
            opts.fileCountMax = 10;
        }
        if (opts.fileBytesMax == null) {
            opts.fileBytesMax = 500 * 1024;
        }
        if (opts.fileMessagesMax == null) {
            opts.fileMessagesMax = 100 * 1000;
        }
        if (opts.messageBufferMax == null) {
            opts.messageBufferMax = 50;
        }
        var directory = opts.directory;
        fs_1.dir_ensure(directory);
        var rgx = /^\d+_/g;
        var files = fs_1.dir_read(directory).sort();
        var i = files.length;
        var filename;
        while (--i > -1) {
            filename = files[i];
            if (rgx.test(filename)) {
                break;
            }
        }
        var lastPath = i > -1 ? Path.resolve(directory, filename) : null;
        this._file = i > -1
            ? new File(lastPath, this._opts, true)
            : this.nextFile();
        if (this._file.size >= opts.fileBytesMax) {
            this.nextFile();
        }
        if (files.length >= opts.fileCountMax) {
            files
                .slice(0, files.length - opts.fileCountMax + 1)
                .forEach(function (filename) {
                fs_1.file_remove(Path.resolve(directory, filename));
            });
        }
        var onExit = require('signal-exit');
        onExit(function () {
            var _a;
            (_a = _this._file) === null || _a === void 0 ? void 0 : _a.flush();
        });
    };
    LoggerFile.prototype.nextFile = function () {
        if (this._file != null)
            this._file.flush();
        var d = new Date();
        var filename = d.getTime() + "_" + this.switch_++ + "_" + Formatter(d, 'dd-MM_hh') + ".txt";
        var path = Path.resolve(this._opts.directory, filename);
        return new File(path, this._opts);
    };
    return LoggerFile;
}());
exports.LoggerFile = LoggerFile;
var File = /** @class */ (function () {
    function File(path, opts, shouldReadStats) {
        if (shouldReadStats === void 0) { shouldReadStats = false; }
        this.path = path;
        this.opts = opts;
        this.buffer = [];
        this.size = 0;
        this.busy = false;
        this.errored = false;
        this.listeners = [];
        this.size = shouldReadStats
            ? fs_1.file_readSize(this.path)
            : 0;
    }
    File.prototype.write = function (message) {
        this.size += message.length + os_1.os_EndOfLine.length;
        this.buffer.push(message);
    };
    File.prototype.flushAsync = function (cb) {
        var str = this.getBuffer();
        if (str == null) {
            cb === null || cb === void 0 ? void 0 : cb();
            return;
        }
        fs_1.file_appendAsync(this.path, str, cb);
    };
    File.prototype.flush = function () {
        var str = this.getBuffer();
        if (str == null) {
            return;
        }
        fs_1.file_append(this.path, str);
    };
    File.prototype.getBuffer = function () {
        if (this.buffer.length === 0) {
            return null;
        }
        var data = this.buffer.join(os_1.os_EndOfLine) + os_1.os_EndOfLine;
        this.buffer.length = 0;
        return data;
    };
    return File;
}());
;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_fs_LoggerFile) && isObject(module.exports)) {
		Object.assign(_src_fs_LoggerFile, module.exports);
		return;
	}
	_src_fs_LoggerFile = module.exports;
}());
// end:source ./ModuleSimplified.js

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Slack_1 = _src_Slack;
var LoggerFile_1 = _src_fs_LoggerFile;
var Monit;
(function (Monit) {
    var watcher;
    function start(events, opts) {
        watcher = new Watcher(events, opts);
    }
    Monit.start = start;
    function flush() {
        watcher === null || watcher === void 0 ? void 0 : watcher.flush();
    }
    Monit.flush = flush;
})(Monit = exports.Monit || (exports.Monit = {}));
var Watcher = /** @class */ (function () {
    function Watcher(events, opts) {
        this.events = events;
        this.messages = [];
        if (opts.slack) {
            this.slack = new Slack_1.SlackClient(opts.slack);
        }
        var loggerOpts = {
            directory: opts.directory
        };
        this.loggers = {
            start: LoggerFile_1.LoggerFile.create('start', Object.assign({}, loggerOpts)),
            requests: LoggerFile_1.LoggerFile.create('requests', Object.assign({}, loggerOpts)),
            errors: LoggerFile_1.LoggerFile.create('errors', Object.assign({}, loggerOpts)),
        };
        this.watch();
    }
    Watcher.prototype.watch = function () {
        var _this = this;
        this.events.on('AppStart', function (event) {
            var _a;
            (_a = _this.slack) === null || _a === void 0 ? void 0 : _a.send(event.message);
            _this.loggers.start.write(new Date().toISOString() + ", " + event.message + ", " + event.time + "ms");
        });
        this.events.on('HandlerError', function (event, req, res) {
            var _a;
            if (_this.add(event) === false) {
                return;
            }
            (_a = _this.slack) === null || _a === void 0 ? void 0 : _a.send(event.message);
            _this.loggers.requests.write(new Date().toISOString() + ", " + event.message);
        });
        this.events.on('HandlerSuccess', function (event, req, res) {
            _this.loggers.requests.write(new Date().toISOString() + ", " + event.status + ", " + event.url + ", " + event.time + "ms, " + event.user);
        });
    };
    Watcher.prototype.flush = function () {
        this.loggers.start.flush();
        this.loggers.requests.flush();
        this.loggers.errors.flush();
    };
    Watcher.prototype.add = function (event) {
        for (var i = 0; i < this.messages.length; i++) {
            if (this.messages[i].message === event.message) {
                return false;
            }
        }
        var remove = this.messages.length - 10;
        if (remove > 0) {
            this.messages.splice(0, remove);
        }
        this.messages.push(event.message);
        return true;
    };
    return Watcher;
}());


}());
// end:source ./RootModule.js
