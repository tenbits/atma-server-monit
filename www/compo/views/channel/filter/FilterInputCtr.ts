export class FilterInputCtr {

    emitOut

    model = {
        columnName: '',
        columnType: '',
        value: '',
        column: null
    }

    @mask.deco.refCompo('Dialog')
    dialog


    show (column) {
        this.model.columnName = column.name;
        this.model.columnType = column.type;
        this.model.value = column.q;
        this.model.column = column;

        this.dialog.open();
    }

    @mask.deco.slotPrivate()
    submit () {
        this.model.column.q = this.model.value;
        this.dialog.close();
        this.emitOut('doFilterPicked', this.model.column);
    }
}
