
// source ./RootModule.js
(function(){
	
	var _src_Slack = {};

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
        this.channelId = this.channelId;
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger = require("atma-logger");
var Slack_1 = _src_Slack;
var Monit;
(function (Monit) {
    var watcher;
    function start(events, opts) {
        watcher = new Watcher(events, opts);
    }
    Monit.start = start;
})(Monit = exports.Monit || (exports.Monit = {}));
var Watcher = /** @class */ (function () {
    function Watcher(events, opts) {
        this.events = events;
        this.messages = [];
        this.slack = new Slack_1.SlackClient(opts.slack);
        this.logger = logger.cfg({
            color: 'none',
            logCaller: false,
            logDate: 'dd.MM hh:mm',
            transport: {
                type: 'fs',
                extension: 'csv',
                directory: opts.directory
            }
        });
        this.watch();
    }
    Watcher.prototype.watch = function () {
        var _this = this;
        this.events.on('AppStart', function (event) {
            _this.slack.send(event.message);
            _this.logger.log(event.message);
        });
        this.events.on('HandlerError', function (event, req, res) {
            if (_this.add(event) === false) {
                return;
            }
            _this.slack.send(event.message);
            _this.logger.error(event.message);
        });
        this.events.on('HandlerSuccess', function (event, req, res) {
            _this.logger.log(event.message);
        });
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
