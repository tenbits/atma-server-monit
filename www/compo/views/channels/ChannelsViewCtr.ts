
declare var axios, ruta;

interface IChannel {
    name: string
}

export class ChannelsViewCtr {

    channels: IChannel[]

    @mask.deco.slotPrivate()
    goToChannel (event, name) {
        ruta.navigate(`?channel=${name}`);
    }


    async onRenderStart () {
        let resp = await axios.get('./api/logs/channels');
        this.channels = resp.data;
    }
}
