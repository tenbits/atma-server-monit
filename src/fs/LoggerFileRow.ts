import { Csv } from '../utils/csv';
import { ICsvColumn } from '../model/ICsvColumn';


export namespace LoggerFileRow {
    export function serialize (cells: any[], fields: ICsvColumn[]) {
        if (fields == null) {
            let row = cells
                .map((val, i) => {
                    if (val instanceof Date) {
                        return val.toISOString();
                    }
                    return val;
                })
                .map(Csv.escape)
                .join(', ');
            return row;
        }
        let row = '';
        for (let i = 0; i < fields.length; i++) {
            if (i !== 0) row += ', ';

            let field = fields[i];
            let val = cells[i];
            if (val != null) {
                switch (field.type) {
                    case 'date':
                        if (val instanceof Date === false) {
                            val = new Date(val);
                        }
                        break;
                }
            }
            if (val instanceof Date) {
                row += val.toISOString();
                continue;
            }
            if (typeof val === 'number') {
                row += val;
                continue;
            }
            row += Csv.escape(val);
        }
        return row;
    }
}
