import { File } from 'atma-io';

export interface IFileIndex {
    lineCount: number
    lines: [number /* StartPos */, number /* Timestamp */]
}

type FileType = InstanceType<typeof File>;

export const Idx_LINE_START = 0;
export const Idx_LINE_END = 1;
export const Idx_Date = 2;

export class FileIndex {


    static async create (uri: string) {
        let file = new File(uri, { cached: false });
        let buffer = await file.readAsync <Buffer> ({ encoding: 'buffer' });
        let lines = [];
        let isNewLine = true;

        for (let i = 0; i < buffer.length; i++) {

            let c = buffer[i];
            if (c === 10 /* \n */ || c === 13 /* \r */) {
                if (isNewLine === false) {
                    lines[lines.length - 1][Idx_LINE_END] = i
                }
                isNewLine = true;
                continue;
            }
            if (isNewLine) {
                isNewLine = false;
                let j = i + 1;
                for (; j < buffer.length; j++) {
                    let c = buffer[j];
                    if (c === 44 /* , */ || c === 10 /* \n */ || c === 13 /* \r */) {
                        break;
                    }
                }
                let dateStr = buffer.slice(i, j).toString();
                let timestamp = new Date(dateStr).valueOf();
                lines.push([
                    i, // Line Start
                    null, // Line End
                    isNaN(timestamp) ? null : timestamp // Date
                ]);
            }
        }


        let idx = <IFileIndex> {
            lineCount: lines.length,
            lines: lines
        };
        let path = uri.replace(/\.\w+$/, '.idx.json');
        await File.writeAsync(path, idx, { minify: true });
        return idx;
    }
}
