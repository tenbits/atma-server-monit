import alot = require('alot');
import { ICsvColumn } from './ICsvColumn';

export interface ITableQuery {

    sortByColumnIdx?: number
    sortDir?: 'asc' | 'desc'

    columnFilters?: ITableColumnFilter[]

    rangeStart?: Date
    rangeEnd?: Date

    offset?: number
    limit?: number
}

export interface ITableColumnFilter {
    columnIdx: number
    q: string
}

export class Table {

    dateIdx: number
    size = 0

    constructor (private fields: ICsvColumn[], public rows: any[][]) {

        this.dateIdx = fields.findIndex(x => x.type === 'date');
        fields.forEach((f, idx) => f.idx = idx);
    }

    getTable (params: ITableQuery): any[][] {
        if (typeof params.columnFilters === 'string') {
            // hacky workaround, parse as json
            params.columnFilters = JSON.parse(params.columnFilters);
        }


        let rows = this.rows;
        let filters = params.columnFilters?.map(def => {
            return ColumnFilters.create(def, this.fields[def.columnIdx]);
        });

        if (params.rangeStart) {
            rows = rows.filter(x => x[this.dateIdx] >= params.rangeStart);
        }
        if (params.rangeEnd) {
            rows = rows.filter(x => x[this.dateIdx] <= params.rangeEnd);
        }

        if (filters?.length > 0) {
            rows = rows.filter(row => {
                let notMatched = filters.some(filter => {
                    return filter.exec(row) === false;
                });
                return notMatched !== true;
            });
        }
        if (params.sortByColumnIdx) {
            rows = alot(rows)
                .sortBy(x => x[params.sortByColumnIdx], params.sortDir)
                .toArray();
        }

        this.size = rows.length;

        if (params.offset != null || params.limit != null) {
            let offset = params.offset ?? 0;
            let limit = params.limit ?? 100;
            rows = rows.slice(offset, offset + limit);
        }
        return rows;
    }
}

namespace ColumnFilters {
    export function create (def: ITableColumnFilter, field: ICsvColumn) {
        switch (field.type) {
            case 'number':
                return new NumberNs.NumberFilter(def, field);
            case 'string':
            case 'text':
                return new StringNs.StringFilter(def, field);
        }
    }

    interface IFilter {
        exec (row: any[]): boolean
    }

    namespace StringNs {
        export class StringFilter implements IFilter  {
            fn: (currentVal: string) => boolean
            idx: number
            constructor(def: ITableColumnFilter, field: ICsvColumn) {
                this.idx = field.idx;
                this.fn = StringFilter.getCompareFn(def, field);
            }
            exec(row: any[]): boolean {
                let value = row[this.idx] as string;
                return this.fn(value);
            }
            static getCompareFn (def: ITableColumnFilter, field: ICsvColumn) {
                let q = def.q;
                let rgx = new RegExp(q);
                return (val: string) => rgx.test(val);
            }
        }
    }

    namespace NumberNs {

        type NumCompare = '>' | '<' | '=' | '<=' | '>=' | '!=';

        export class NumberFilter implements IFilter {

            fn: (currentVal: number) => boolean
            idx: number

            constructor(def: ITableColumnFilter, field: ICsvColumn) {
                this.idx = field.idx;
                this.fn = NumberFilter.getCompareFn(def, field);
            }
            exec(row: any[]): boolean {
                let value = row[this.idx] as number;
                return this.fn(value);
            }

            static getCompareFn (def: ITableColumnFilter, field: ICsvColumn) {
                let q = def.q;
                let matchCompare = /^(>|<|<=|>=|!=|=)([-.\d]+)$/.exec(q);
                if (matchCompare) {

                    let compare = <any> matchCompare[1];
                    let a = parseFloat(matchCompare[2]);
                    return NumberCompare.delegateFn(a, compare);
                }
                let matchRange = /^(\(\[)?([-.\d]+)\-([-.\d]+)(\)\])?$/.exec(q);
                if (matchRange) {
                    let [ _, startInc, start, end, endInc ] = matchRange;
                    startInc = startInc ?? '[';
                    endInc = endInc ?? ']';
                    let a = parseFloat(start);
                    let b = parseFloat(end);
                    return NumberCompare.delegateRangeFn(a, b);
                }
                return () => true;
            }
        }


        export namespace NumberCompare {

            const Methods = {
                'lt' (a) {
                    return (currentVal) => currentVal < a;
                },
                'lte' (a) {
                    return (currentVal) => currentVal <= a;
                },
                'gt' (a) {
                    return (currentVal) => currentVal > a;
                },
                'gte' (a) {
                    return (currentVal) => currentVal >= a;
                },
                'eq' (a) {
                    return (currentVal) => currentVal == a;
                },
                'ne' (a) {
                    return (currentVal) => currentVal != a;
                },
            }
            export function delegateFn (a: number, compare: NumCompare) {
                switch (compare) {
                    case '<':
                        return Methods.lt(a);
                    case '<=':
                        return Methods.lte(a);
                    case '>':
                        return Methods.gt(a);
                    case '>=':
                        return Methods.gte(a);
                    case '!=':
                        return Methods.ne(a);
                    default:
                        return Methods.eq(a);
                }
            }
            export function delegateRangeFn (a: number, b: number) {
                return (value) => value >= a && value <= b;
            }
        }
    }
}
