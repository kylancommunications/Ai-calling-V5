import { BidiGenerateContentSetup, GeminiLiveClient, GeminiServer } from '@tw2gem/gemini-live-client';
import { TwilioWebSocket } from '@tw2gem/twilio-server';
import { ServerOptions } from 'ws';

export class Tw2GemSocket extends TwilioWebSocket {
    twilioStreamSid?: string;
    geminiClient?: GeminiLiveClient;
}

export class Tw2GemServerOptions {
    serverOptions: ServerOptions;
    geminiOptions: BidiGenerateContentSetup;
}