import { Tw2GemServer } from '@tw2gem/server';

const tw2gemServer = () => {
    const server = new Tw2GemServer({
        serverOptions: {
            port: 6593
        },
        geminiOptions: {
            server: {
                apiKey: process.env.GOOGLE_API_KEY1,
            },
            model: 'models/gemini-2.0-flash-live-001',
            generationConfig: {
                responseModalities: ['audio'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Puck'
                        }
                    },
                    languageCode: 'es-US'
                },
            },
            systemInstruction: {
                parts: [{ text: 'Eres un asistente virtual de la tienda online store.com' }]
            },
            tools: []
        }
    });

    server.onNewCall = (socket) => {
        console.log('New call from twilio');
    }

    server.onGeminiReady = (socket) => {
        console.log('Gemini live connection is ready');
    }

    server.onError = (socket, event) => {
        console.error(event);
    }

    server.onClose = () => {
        console.log('End call');
    }

    console.log(`WebSocket server is running in ${server.options.port}`);
};

tw2gemServer();