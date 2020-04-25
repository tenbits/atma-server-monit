import { HttpEndpoint, HttpError } from 'atma-server';
import { LogsReader } from '../server/LogsReader';
import { Directory } from 'atma-io'
import { Rule, Json } from 'class-json';

const { fromUri, fromBody, Types } = HttpEndpoint;


class GetChannelParams {

    @Rule.required()
    key: string

    orderBy: string
    orderDir: 'asc' | 'desc'

    @Json.type(Date)
    rangeStart: Date

    @Json.type(Date)
    rangeEnd: Date
};

class GetChannelResponse {

}

@HttpEndpoint.route('/api/logs')
export default class extends HttpEndpoint {

    async '$get /channels' (
        req
    ) {
        let reader = new LogsReader(this.app.lib.monit);
        return reader.getChannels();
    }

    @HttpEndpoint.response({ Type: Types.ArrayOf(GetChannelResponse) })
    async '$get /channel' (
        @fromUri({ Type: GetChannelParams }) params: GetChannelParams
    ) {
        let reader = new LogsReader(this.app.lib.monit);
        let channels = reader.getChannels();
        let channel = channels.find(x => x.name === params.key);
        if (channel == null) {
            throw new HttpError(`Channel not found: ${params.key}`, 400);
        }
        let files = await Directory.readFiles(channel.directory);

        
        let arr = files.map(async file => {
            return {
                count: (await file.readAsync<string>()).split('\n').length,
                path: file.uri.toLocalFile()
            }
        });
        let rows = await Promise.all(arr);
        return rows;
    }
}
