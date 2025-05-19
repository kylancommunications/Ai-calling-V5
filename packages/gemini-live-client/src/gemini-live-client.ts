
import { Blob } from 'buffer';
import { BidiGenerateContentRealtimeInput, BidiGenerateContentServerContent, BidiGenerateContentServerMessage, BidiGenerateContentSetup, BidiRequest } from './gemini-live.dto';

export class GeminiLiveClient {

    private static readonly DEFAULT_GEMINI_BIDI_SERVER = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

    private socket: WebSocket;
    public isReady: boolean;

    constructor(
        private setup: BidiGenerateContentSetup
    ) {
        const server = setup.server;
        delete setup.server;

        const baseUrl = server?.url || GeminiLiveClient.DEFAULT_GEMINI_BIDI_SERVER;
        const queryParams = server?.apiKey ? `key=${server.apiKey}` : '';

        const url = `${baseUrl}?${queryParams}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = this.sendSetup.bind(this);
        this.socket.onmessage = this.handlerMessage.bind(this);

        this.socket.onerror = (event) => {
            this.isReady = false;
            this.onError(<any> event);
        };

        this.socket.onclose = (event) => {
            this.isReady = false;
            this.onClose(event);
        };
    }

    protected sendSetup() {
        const jsonPayload = JSON.stringify({ setup: this.setup });
        this.socket.send(jsonPayload);
    }

    protected async handlerMessage(event: any) {
        const blob = <Blob>event.data;
        const text = await blob.text();
        const obj: BidiGenerateContentServerMessage = JSON.parse(text);
        if (obj.setupComplete) {
            this.isReady = true;
            return this.onReady();
        }

        if (obj.serverContent) {
            return this.onServerContent(obj.serverContent);
        }
    };

    public sendText(text: string) {
        const realtimeInput: BidiGenerateContentRealtimeInput = { text };
        this.send({ realtimeInput })
    }

    public sendRealTime(realTimeData: BidiGenerateContentRealtimeInput) {
        this.send({ realtimeInput: realTimeData })
    }

    protected send(request: BidiRequest) {
        if (!this.isReady)
            return;
        const jsonPayload = JSON.stringify(request);
        this.socket.send(jsonPayload);
    }

    public close() {
        this.socket.close();
    } 

    public onReady() {}

    public onError(event: ErrorEvent) {}

    public onClose(event: CloseEvent) {}

    public onServerContent(serverContent: BidiGenerateContentServerContent) {}
}