export namespace Csv {
    export function escape (str: string) {
        
        str = str.replace(/\n/g, '\\\\n')

        if (str.includes(',') === false) {
            return str;
        }
        str = str.replace(/"/g, "'");
        return `"${str}"`;
    }
}