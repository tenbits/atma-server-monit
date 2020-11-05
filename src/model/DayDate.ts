export class DayDate implements IDay {

    year: number
    date: number

    // 0-based
    month: number

    constructor (year: number, month: number, date: number)
    constructor (str: string)
    constructor (day: IDay)
    constructor (date: Date)

    constructor (arg1?: string | number | IDay | Date, arg2?: number, arg3?: number) {
        if (arg1 == null) {
            return;
        }

        if (typeof arg1 === 'string') {
            Object.assign(this, DayDateUtils.parse(arg1));
        } else if (typeof arg1 === 'number') {
            this.year = arg1;
            this.month = arg2;
            this.date = arg3;
        } else if ('year' in arg1) {
            this.year = arg1.year;
            this.month = arg1.month;
            this.date = arg1.date;
        } else if ('getFullYear' in arg1) {
            this.year = arg1.getFullYear();
            this.month = arg1.getMonth();
            this.date = arg1.getDate();
        }
    }

    toDate () {
        return new Date(this.year, this.month, this.date);
    }

    isEqual (date: DayDate) {
        return date.year === this.year
            && date.month === this.month
            && date.date === this.date
            ;
    }

    isSame (date: Date) {
        return date.getFullYear() === this.year
            && date.getMonth() === this.month
            && date.getDate() === this.date
            ;
    }
    isAfter (date: Date) {
        let y = date.getFullYear();
        let m = date.getMonth();
        let d = date.getDate();

        let thisSemi = this.year * 365 + this.month * 31 + this.date;
        let dateSemi = y * 365 + m * 31 + d;
        return thisSemi > dateSemi;
    }
    isBefore (date: Date) {
        let y = date.getFullYear();
        let m = date.getMonth();
        let d = date.getDate();

        let thisSemi = this.year * 365 + this.month * 30 + this.date;
        let dateSemi = y * 365 + m * 30 + d;
        return thisSemi < dateSemi;
    }

    valueOf () {
        return this.toDate().valueOf();
    }

    format (pattern) {
        return pattern
            .replace('MM', String(this.month + 1).padStart(2, '0'))
            .replace('dd', String(this.date).padStart(2, '0'))
            .replace('yyyy', this.year);
    }

    serialize () {
        return DayDateUtils.serialize(this);
    }

    getFullYear () {
        return this.year;
    }
    getMonth () {
        return this.month;
    }
    getDate () {
        return this.date;
    }
    getHours () {
        return 0;
    }
    getMinutes () {
        return 0;
    }
    getSeconds () {
        return 0;
    }

    static now () {
        return new DayDate(new Date());
    }
}

export interface IDay {
    year: number
    date: number

    // 0-based
    month: number

}

namespace DayDateUtils {
    let rgx = /(\d{4})\-(\d{2})\-(\d{2})/;
    export function parse (str: string): IDay {
        if (str.includes('T')) {
            let d = new Date(str);
            return {
                year: d.getFullYear(),
                month: d.getMonth(),
                date: d.getDate(),
            }
        }
        let match = rgx.exec(str);
        let [_, year, month, date ] = match;

        return {
            year: Number(year),
            month: Number(month) - 1,
            date: Number(date)
        };
    }
    export function serialize (day: IDay) {
        let y = day.year;
        let m = String(day.month + 1).padStart(2, '0');
        let d = String(day.date).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
