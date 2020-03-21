import { WebClient } from '@slack/web-api'
import memd from 'memd'

export class SlackClient {
    access_token: string;
    team_id: string
    enterprise_id: string
    web: WebClient;

    token: string
    channelId: string
    private isReady = false

    constructor (opts: { token: string, channelId: string }) {
        this.token = opts.token;
        this.channelId = this.channelId;
    }

    @memd.deco.memoize()
    async login () {
        this.web = new WebClient(this.token);
        this.isReady = true;

        // const result: any = await this.web.oauth.v2.access({
        //     client_id: clientId,
        //     client_secret: clientSecret,
        //     code
        //   });

        //   this.access_token = result.access_token;
        //   this.enterprise_id = result.enterprise_id;
        //   this.team_id = result.team_id;
    }

    @memd.deco.debounce(500)
    async send (message: string) {
        if (this.isReady === false) {
            await this.login();
        }
        await this.web.chat.postMessage({
            text: message,
            channel: this.channelId,
          });
    }
}