import { FilterInputCtr } from './filter/FilterInputCtr';

declare var axios;

interface IUiColumn {
    name: string
    idx: number
    q: string
    sorted: boolean
    sortDir: 'asc' | 'desc'
}
interface IUiDay {
    day: Date
    title: string
}

export class ChannelViewCtr {

    @mask.deco.refCompo('FilterInput')
    filterInput: FilterInputCtr

    name: string
    isViewLoading: boolean = true;
    isViewBusy: boolean = true;
    viewTick = 0

    days: IUiDay[] = null;

    columns: IUiColumn[]
    rows: any[][]
    formattedRows: any[][]
    query: {
        sortByColumnIdx?: number
        sortDir?: 'asc' | 'desc'
        columnFilters?: {
            columnIdx: number
            q: string
        }[]

        rangeStart?: Date
        rangeEnd?: Date

        offset?: number
        limit?: number
    } = {
        offset: 0,
        limit: 100
    }
    pager = {
        offset: 0,
        limit: 100,
        page: 0,
        totalPages: 0,
        totalItems: 0
    }

    @mask.deco.slot()
    async viewActivation (sender, vm) {
        this.isViewLoading = true;
        this.name = vm.route.current.params.channel;
        this.columns = null;

        let days = await this.loadDays();

        this.query.rangeStart = days?.[0].day;
        this.days = days;
        await this.loadData();


        this.viewTick++;
        this.isViewLoading = false;
    }


    @mask.deco.slotPrivate()
    async doFilter (sender, column: IUiColumn ) {
        this.filterInput.show(column);
    }

    @mask.deco.slotPrivate()
    async doSort (sender, column: IUiColumn ) {
        let sorted = column.sorted;
        this.columns.forEach(x => {
            if (x !== column) {
                x.sorted = false
            }
        });

        column.sorted = true;
        if (sorted) {
            column.sortDir = column.sortDir === 'asc' ? 'desc' : 'asc';
        }

        this.query.sortByColumnIdx = column.idx;
        this.query.sortDir = column.sortDir;


        await this.loadData();
    }

    @mask.deco.slotPrivate()
    async doFilterPicked (sender, column: IUiColumn) {
        if (this.query.columnFilters == null) {
            this.query.columnFilters = [];
        }
        let current = this.query.columnFilters?.find(x => x.columnIdx === column.idx);
        if (current == null) {
            current = {
                q: column.q,
                columnIdx: column.idx
            };
            this.query.columnFilters.push(current);
        } else {
            current.q = column.q;
        }
        await this.loadData();
    }

    @mask.deco.slotPrivate()
    async onDaySelected (sender, selected) {
        this.query.rangeStart = selected.day;
        this.query.offset = 0;
        await this.loadData();
    }
    @mask.deco.slotPrivate()
    async doPagerNext (sender) {
        this.query.offset += this.query.limit;
        await this.loadData();
    }
    @mask.deco.slotPrivate()
    async doPagerBack (sender) {
        this.query.offset = Math.max(this.query.offset - this.query.limit, 0);
        await this.loadData();
    }

    private async loadDays() {
        let resp = await axios.get(`./api/logs/channel/${this.name}/days`);
        let days = resp.data;
        return days;
    }
    private async loadData() {
        this.isViewBusy = true;

        let params = Object.assign({}, this.query);
        if (params.columnFilters) {
            params.columnFilters = <any> JSON.stringify(this.query.columnFilters);
        }
        let resp = await axios.get(`./api/logs/channel/${this.name}`, { params });
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
            })
        });
        this.isViewBusy = false;

        function getDisplayValue (val, type) {
            if (!val) {
                return val;
            }
            switch (type) {
                case 'date':
                    return Utils.formatDate(val);
            }
            return val;
        }
    }
}

export class QueryCtr {
    emitOut

    constructor (public query: ChannelViewCtr['query']) {

    }

    protected _selected: { day: Date } = { day: null }
    protected _days: { day: Date }[]
    protected _hasBack = false;
    protected _hasForward = false;

    @mask.deco.attr({ name: 'days' })
    set days (value: ChannelViewCtr['days']) {
        if (value == null) {
            return;
        }
        this._days = value;
        this._selected = value[value.length - 1];
        this._hasForward = false;
        this._hasBack = value.length > 1;
    }

    @mask.deco.slotPrivate()
    goDay (event, diff: number) {
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

namespace Utils {
    export function formatDate (date: string | Date, format: 'full' | 'short' = 'full') {
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
    mask._.formatDate = Utils.formatDate;
}
