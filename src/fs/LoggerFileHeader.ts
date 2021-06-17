import { ICsvColumn } from '../model/ICsvColumn';
import { ILoggerOpts } from './LoggerFile';

export namespace LoggerFileHeader {
    export const SYMBOL = '‖';
    export const BUFFER = [ 0xe2, 0x80, 0x96 ];

    export function serialize (opts: ILoggerOpts) {
        let line = opts
            ?.fields
            ?.map(field => {
                return `${field.name}:${field.type}`;
            })
            .join(',');

        if (line) {
            line = `${SYMBOL}${line}`;
        }
        return line;
    }
    export function parse (row: string[]) {
        let rgx = /(?<name>.+):(?<type>\w+)?$/
        return row.map((str, i) => {
            let { name, type } = rgx.exec(str)?.groups ?? {};
            return <ICsvColumn> {
                idx: i,
                name: name,
                type: type
            };
        })
    }
}
