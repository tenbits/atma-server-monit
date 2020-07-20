
declare var axios;

export class ChannelViewCtr {

    name: string
    loadingView: boolean = true;
    viewTick = 0

    columns: { name: string, idx: number }[]
    rows: any[][]
    formattedRows: any[][]

    @mask.deco.slot()
    async viewActivation (sender, vm) {
        this.loadingView = true;
        this.name = vm.route.current.params.channel;
        await this.loadInner();
        this.viewTick++;
        this.loadingView = false;
    }


    private async loadInner() {
        let resp = await axios.get(`./api/logs/channel/${this.name}`);
        let { columns, rows, size } = resp.data;

        this.columns = columns;
        this.rows = rows;
        this.formattedRows = rows.map(row => {
            return row.map((val, index) => {
                let type = columns[index].type;
                let display = getDisplayValue(val, type);
                return {
                    value: val,
                    display,
                    type
                };
            })
        })

        function getDisplayValue (val, type) {
            if (!val) {
                return val;
            }
            switch (type) {
                case 'date':
                    return val
                        .replace(/^\d{4}\-/, '')
                        .replace(/\..+$/, '')
                        .replace('T', ' ');
            }
            return val;
        }
    }
}
