import { Csv } from './csv';

export namespace Err {
    export function serializeError (error: Error | string) {
        let str = serializeErrorInner(error);
        return Csv.escape(str);
    }
    
    function serializeErrorInner (error: Error | string) {
        if (typeof error === 'string') {
            return error;
        }
        if (error.stack) {
            return error.stack;
        }
        if (error.message) {
            return error.message;
        }
        return String(error);
    }
}