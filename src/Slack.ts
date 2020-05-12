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
    private messages: { date: Date, message: string }[] = []

    constructor (opts: { token: string, channelId: string }) {
        this.token = opts.token;
        this.channelId = opts.channelId;
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
        if (this.wasSendShortly(message)) {
            return;
        }
        if (this.isReady === false) {
            await this.login();
        }
        await this.web.chat.postMessage({
            text: message,
            channel: this.channelId,
        });
    }

    private wasSendShortly (message: string) {

        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].message === message) {
                return true;
            }
        }
        let bufferCount = 20;
        let remove = this.messages.length - bufferCount;
        // keeps buffering between [bufferCount, bufferCount * 2]
        if (remove > bufferCount * 2) {
            this.messages.splice(0, remove);
        }
        this.messages.push({ date: new Date(), message });
        return false;
    }
}
