export namespace Csv {
    export function escape (str: string) {
        if (typeof str === 'number') {
            return str;
        }

        str = String(str).replace(/\n/g, '\\\\n')

        if (str.includes(',') === false) {
            return str;
        }
        str = str.replace(/"/g, "'");
        return `"${str}"`;
    }
}
