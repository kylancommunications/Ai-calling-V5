const { Tw2GemServer } = require('@tw2gem/server');

const PORT = process.env.PORT || 6593;

const server = new Tw2GemServer({
    serverOptions: {
        port: PORT
    },
    geminiOptions: {
        server: {
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        },
        setup: {
            model: 'models/gemini-2.0-flash-live-001',
            generationConfig: {
                responseModalities: ['audio'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Puck'
                        }
                    },
                    languageCode: 'en-US'
                },
            },
            systemInstruction: {
                parts: [{ text: 'You are a professional AI assistant for customer service calls. Be helpful, polite, and efficient.' }]
            },
            tools: []
        }
    }
});

server.onNewCall = (socket) => {
    console.log('New call from Twilio:', socket.twilioStreamSid);
};

server.geminiLive.onReady = (socket) => {
    console.log('Gemini Live connection is ready for call:', socket.twilioStreamSid);
};

server.geminiLive.onClose = (socket) => {
    console.log('Gemini Live connection closed for call:', socket.twilioStreamSid);
};

server.onError = (socket, event) => {
    console.error('Server error:', event);
};

server.onClose = (socket, event) => {
    console.log('Call ended:', socket.twilioStreamSid);
};

console.log(`🚀 TW2GEM Server running on port ${PORT}`);
console.log(`📞 Twilio webhook URL: ws://localhost:${PORT}`);
console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);