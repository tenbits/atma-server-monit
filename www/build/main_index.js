
            include.cfg('version', '${version}');
            include.cfg({"0":"m","1":"a","2":"p","commonjs":true,"amd":true,"lockToFolder":true,"extentionDefault":{"js":"ts"},"base":"./"});
            include.pauseStack();
            
            include.register({"js":[{"type":"js","url":"/compo/LogViewerCtr.ts"},{"type":"js","url":"/compo/views/channels/ChannelsViewCtr.ts"},{"type":"js","url":"/compo/views/channel/ChannelViewCtr.ts"},{"type":"js","url":"/compo/views/channel/filter/FilterInputCtr.ts"}]});
        
            
            include.register({"css":[{"type":"css","url":"/compo/LogViewer.less"},{"type":"css","url":"/compo/views/channel/ChannelView.less"},{"type":"css","url":"/node_modules/material-components-web/dist/material-components-web.css"},{"type":"css","url":"/src/style/layout.less"}]});
        
            
            include.register({"load":[{"type":"load","url":"/compo/mdc/AppBar.mask"},{"type":"load","url":"/compo/views/channels/ChannelsView.mask"},{"type":"load","url":"/compo/mdc/Dialog.mask"},{"type":"load","url":"/compo/mdc/Input.mask"},{"type":"load","url":"/compo/mdc/Button.mask"},{"type":"load","url":"/compo/views/channel/filter/FilterInput.mask"},{"type":"load","url":"/compo/views/channel/ChannelView.mask"},{"type":"load","url":"/compo/LogViewer.mask"}]});
        
        include.setCurrent({ url: '/compo/LogViewerCtr.ts', aliases: [] });
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogViewerCtr = void 0;
    class LogViewerCtr {
        constructor(name) {
        }
    }
    exports.LogViewerCtr = LogViewerCtr;
});
//# sourceMappingURL=LogViewerCtr.js.map
//# sourceMappingURL=LogViewerCtr.ts.map
include.getResourceById('/compo/LogViewerCtr.ts', 'js').readystatechanged(3);
include.setCurrent({ url: '/compo/views/channels/ChannelsViewCtr.ts', aliases: [] });
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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChannelsViewCtr = void 0;
    class ChannelsViewCtr {
        goToChannel(event, name) {
            ruta.navigate(`?channel=${name}`);
        }
        onRenderStart() {
            return __awaiter(this, void 0, void 0, function* () {
                let resp = yield axios.get('./api/logs/channels');
                this.channels = resp.data;
            });
        }
    }
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelsViewCtr.prototype, "goToChannel", null);
    exports.ChannelsViewCtr = ChannelsViewCtr;
});
//# sourceMappingURL=LogViewerCtr.js.map
//# sourceMappingURL=ChannelsViewCtr.ts.map
include.getResourceById('/compo/views/channels/ChannelsViewCtr.ts', 'js').readystatechanged(3);
include.setCurrent({ url: '/compo/views/channel/ChannelViewCtr.ts', aliases: [] });
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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QueryCtr = exports.ChannelViewCtr = void 0;
    class ChannelViewCtr {
        constructor() {
            this.isViewLoading = true;
            this.isViewBusy = true;
            this.viewTick = 0;
            this.days = null;
            this.query = {
                offset: 0,
                limit: 100
            };
            this.pager = {
                offset: 0,
                limit: 100,
                page: 0,
                totalPages: 0,
                totalItems: 0
            };
        }
        viewActivation(sender, vm) {
            return __awaiter(this, void 0, void 0, function* () {
                this.isViewLoading = true;
                this.name = vm.route.current.params.channel;
                this.columns = null;
                let days = yield this.loadDays();
                this.query.rangeStart = days === null || days === void 0 ? void 0 : days[0].day;
                this.days = days;
                yield this.loadData();
                this.viewTick++;
                this.isViewLoading = false;
            });
        }
        doFilter(sender, column) {
            return __awaiter(this, void 0, void 0, function* () {
                this.filterInput.show(column);
            });
        }
        doSort(sender, column) {
            return __awaiter(this, void 0, void 0, function* () {
                let sorted = column.sorted;
                this.columns.forEach(x => {
                    if (x !== column) {
                        x.sorted = false;
                    }
                });
                column.sorted = true;
                if (sorted) {
                    column.sortDir = column.sortDir === 'asc' ? 'desc' : 'asc';
                }
                this.query.sortByColumnIdx = column.idx;
                this.query.sortDir = column.sortDir;
                yield this.loadData();
            });
        }
        doFilterPicked(sender, column) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (this.query.columnFilters == null) {
                    this.query.columnFilters = [];
                }
                let current = (_a = this.query.columnFilters) === null || _a === void 0 ? void 0 : _a.find(x => x.columnIdx === column.idx);
                if (current == null) {
                    current = {
                        q: column.q,
                        columnIdx: column.idx
                    };
                    this.query.columnFilters.push(current);
                }
                else {
                    current.q = column.q;
                }
                yield this.loadData();
            });
        }
        onDaySelected(sender, selected) {
            return __awaiter(this, void 0, void 0, function* () {
                this.query.rangeStart = selected.day;
                this.query.offset = 0;
                yield this.loadData();
            });
        }
        doPagerNext(sender) {
            return __awaiter(this, void 0, void 0, function* () {
                this.query.offset += this.query.limit;
                yield this.loadData();
            });
        }
        doPagerBack(sender) {
            return __awaiter(this, void 0, void 0, function* () {
                this.query.offset = Math.max(this.query.offset - this.query.limit, 0);
                yield this.loadData();
            });
        }
        loadDays() {
            return __awaiter(this, void 0, void 0, function* () {
                let resp = yield axios.get(`./api/logs/channel/${this.name}/days`);
                let days = resp.data;
                return days;
            });
        }
        loadData() {
            return __awaiter(this, void 0, void 0, function* () {
                this.isViewBusy = true;
                let params = Object.assign({}, this.query);
                if (params.columnFilters) {
                    params.columnFilters = JSON.stringify(this.query.columnFilters);
                }
                let resp = yield axios.get(`./api/logs/channel/${this.name}`, { params });
                let { columns, rows, size } = resp.data;
                this.pager.offset = this.query.offset;
                this.pager.limit = this.query.limit;
                this.pager.page = Math.round(this.query.offset / this.query.limit);
                this.pager.totalItems = size;
                this.pager.totalPages = Math.floor(size / this.query.limit);
                if (this.columns == null) {
                    columns.forEach(x => {
                        x.sorted = false;
                        x.sortDir = 'asc';
                    });
                    this.columns = columns;
                }
                this.rows = rows;
                this.formattedRows = rows.map(row => {
                    return row.map((val, index) => {
                        let type = columns[index].type;
                        let display = getDisplayValue(val, type);
                        return {
                            value: val,
                            display,
                            type
                        };
                    });
                });
                this.isViewBusy = false;
                function getDisplayValue(val, type) {
                    if (!val) {
                        return val;
                    }
                    switch (type) {
                        case 'date':
                            return Utils.formatDate(val);
                    }
                    return val;
                }
            });
        }
    }
    __decorate([
        mask.deco.refCompo('FilterInput')
    ], ChannelViewCtr.prototype, "filterInput", void 0);
    __decorate([
        mask.deco.slot()
    ], ChannelViewCtr.prototype, "viewActivation", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "doFilter", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "doSort", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "doFilterPicked", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "onDaySelected", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "doPagerNext", null);
    __decorate([
        mask.deco.slotPrivate()
    ], ChannelViewCtr.prototype, "doPagerBack", null);
    exports.ChannelViewCtr = ChannelViewCtr;
    class QueryCtr {
        constructor(query) {
            this.query = query;
            this._selected = { day: null };
            this._hasBack = false;
            this._hasForward = false;
        }
        set days(value) {
            if (value == null) {
                return;
            }
            this._days = value;
            this._selected = value[value.length - 1];
            this._hasForward = false;
            this._hasBack = value.length > 1;
        }
        goDay(event, diff) {
            let i = this._days.indexOf(this._selected);
            let iNext = i + diff;
            if (i === -1 || iNext < 0 || iNext > this._days.length - 1) {
                return;
            }
            this._selected = this._days[iNext];
            this._hasBack = iNext > 0;
            this._hasForward = iNext < this._days.length - 1;
            this.emitOut('onDaySelected', this._selected);
        }
    }
    __decorate([
        mask.deco.attr({ name: 'days' })
    ], QueryCtr.prototype, "days", null);
    __decorate([
        mask.deco.slotPrivate()
    ], QueryCtr.prototype, "goDay", null);
    exports.QueryCtr = QueryCtr;
    var Utils;
    (function (Utils) {
        function formatDate(date, format = 'full') {
            if (date == null) {
                return '';
            }
            if (date instanceof Date) {
                date = date.toISOString();
            }
            let str = date
                .replace(/^\d{4}\-/, '')
                .replace(/\..+$/, '')
                .replace('T', ' ');
            if (format === 'short') {
                str = str.replace(/:\d{2}$/, '');
            }
            return str;
        }
        Utils.formatDate = formatDate;
        mask._.formatDate = Utils.formatDate;
    })(Utils || (Utils = {}));
});
//# sourceMappingURL=LogViewerCtr.js.map
//# sourceMappingURL=ChannelViewCtr.ts.map
include.getResourceById('/compo/views/channel/ChannelViewCtr.ts', 'js').readystatechanged(3);
include.setCurrent({ url: '/compo/views/channel/filter/FilterInputCtr.ts', aliases: [] });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterInputCtr = void 0;
    class FilterInputCtr {
        constructor() {
            this.model = {
                columnName: '',
                columnType: '',
                value: '',
                column: null
            };
        }
        show(column) {
            this.model.columnName = column.name;
            this.model.columnType = column.type;
            this.model.value = column.q;
            this.model.column = column;
            this.dialog.open();
        }
        submit() {
            this.model.column.q = this.model.value;
            this.dialog.close();
            this.emitOut('doFilterPicked', this.model.column);
        }
    }
    __decorate([
        mask.deco.refCompo('Dialog')
    ], FilterInputCtr.prototype, "dialog", void 0);
    __decorate([
        mask.deco.slotPrivate()
    ], FilterInputCtr.prototype, "submit", null);
    exports.FilterInputCtr = FilterInputCtr;
});
//# sourceMappingURL=LogViewerCtr.js.map
//# sourceMappingURL=FilterInputCtr.ts.map
include.getResourceById('/compo/views/channel/filter/FilterInputCtr.ts', 'js').readystatechanged(3);
include.resumeStack();