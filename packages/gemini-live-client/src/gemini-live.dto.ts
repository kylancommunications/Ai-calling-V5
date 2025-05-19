export interface GeminiBlob {
    mimeType: string;
    data: string;
}

export interface GeminiContentPart {
    thought?: boolean;
    text?: string;
    inlineData?: GeminiBlob;
}

export interface GeminiContent {
    parts: GeminiContentPart[];
    role?: string;
}

export interface BidiRequest {
    setup?: BidiGenerateContentSetup;
    realtimeInput?: BidiGenerateContentRealtimeInput;
}

export interface GeminiServer {
    url?: string;
    apiKey?: string;
}

export interface BidiGenerateContentSetup {
    server?: GeminiServer;
    model: string;
    generationConfig: {
        candidateCount?: number,
        maxOutputTokens?: number,
        temperature?: number,
        topP?: number,
        topK?: number,
        presencePenalty?: number,
        frequencyPenalty?: number,
        mediaResolution?: object
        responseModalities: string[],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: string
                }
            },
            languageCode: string
        },
    };
    systemInstruction: {
        parts: [{ text: string }]
    };
    tools: any[]
}

export interface BidiGenerateContentRealtimeInput {
    mediaChunks?: GeminiBlob[];
    audio?: GeminiBlob;
    video?: GeminiBlob;
    // activityStart?: ActivityStart;
    // activityEnd?: ActivityEnd;
    audioStreamEnd?: boolean;
    text?: string;
}

export interface BidiGenerateContentServerContent {
    generationComplete?: boolean;
    turnComplete?: boolean;
    interrupted?: boolean;
    // groundingMetadata?: GroundingMetadata;
    // outputTranscription?: BidiGenerateContentTranscription;
    modelTurn?: GeminiContent;
}

export interface BidiGenerateContentSetupComplete { }

export interface BidiGenerateContentServerMessage {
    setupComplete?: BidiGenerateContentSetupComplete;
    serverContent?: BidiGenerateContentServerContent;
}