export interface ICsvColumn {
    idx?: number
    name: string;
    type: 'string' | 'number' | 'date' | 'text' | 'boolean';

    summable?: boolean;
    groupable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
}
