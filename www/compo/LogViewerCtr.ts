declare var axios;

export class LogViewerCtr {


    constructor (name: string) {

    }

    @mask.deco.slotPrivate()
    async doFlush () {
        await axios.post('./api/logs/flush');
        location.reload();
    }

    @mask.deco.slotPrivate()
    async goHome () {
        let path = location.href;
        location.href = path.replace(/\?.+$/, '');
    }

}
