declare var axios;

export class LogViewerCtr {


    constructor (name: string) {

    }

    @mask.deco.slotPrivate()
    doFlush () {
        axios.post('./api/logs/flush')
    }

}
