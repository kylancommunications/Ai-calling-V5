import { ServerOptions, WebSocket } from 'ws';

export interface TwilioEvent {
    event: string;
}

export interface TwilioSequencialMessage extends TwilioEvent {
    sequenceNumber: number;
    streamSid: string;
}

export interface TwilioConnectedEvent extends TwilioEvent {
    event: 'connected';
    protocol: string;
    version: string;
}

export interface TwilioStartEvent extends TwilioSequencialMessage {
    event: 'start';
    start: {
        streamSid: string;
        accountSid: string;
        callSid: string;
        tracks: string[];
        customParameters: Record<string, unknown>;
        mediaFormat: {
            encoding: string;
            sampleRate: number;
            channels: number;
        }
    };
}

export interface TwilioMediaEvent extends TwilioSequencialMessage {
    event: 'media';
    media: {
        track: 'inbound' | 'outbound';
        chunk: number;
        timestamp: string;
        payload: string;
    }
}

export interface TwilioSendMedia {
    streamSid: string;
    media: {
        payload: string;
    }
}

export interface TwilioStopEvent extends TwilioSequencialMessage {
    event: 'stop';
    stop: {
        accountSid: string;
        callSid: string;
    }
}

export interface TwilioDtmfEvent extends TwilioSequencialMessage {
    event: 'dtmf';
    dtmf: {
        track: string;
        digit: string;
    }
}

export interface TwilioMarkEvent extends TwilioSequencialMessage {
    event: 'mark';
    mark: {
        name: string;
    }
}

export interface TwilioMessageHandlers {
    onConnected?: (socket: TwilioWebSocket, event: TwilioConnectedEvent) => any;
    onStart?: (socket: TwilioWebSocket, event: TwilioStartEvent) => any;
    onMedia?: (socket: TwilioWebSocket, event: TwilioMediaEvent) => any;
    onStop?: (socket: TwilioWebSocket, event: TwilioStopEvent) => any;
    onDtmf?: (socket: TwilioWebSocket, event: TwilioDtmfEvent) => any;
    onMark?: (socket: TwilioWebSocket, event: TwilioMarkEvent) => any;
}

export interface TwilioServerOptions extends ServerOptions {
    handlers?: TwilioMessageHandlers;
}

export class TwilioWebSocket extends WebSocket {

    sendMedia(media: TwilioSendMedia) {
        this.sendEvent({
            event: 'media',
            ...media
        });
    }

    sendEvent(event: TwilioEvent) {
        const json = JSON.stringify(event);
        this.send(json);
    }
}