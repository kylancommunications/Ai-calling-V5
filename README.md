# TW2GEM Monorepo

This monorepo contains all the packages for the TW2GEM project, a system that integrates Twilio with Google's Gemini AI for real-time audio processing and AI interactions.

## Project Structure

The monorepo is organized into the following packages:

- `audio-converter`: Handles audio format conversion and processing
- `twilio-server`: Manages Twilio integration and audio streaming
- `tw2gem-server`: Core server that coordinates between Twilio and Gemini
- `gemini-live-client`: Client for interacting with Google's Gemini AI
- `examples`: Example implementations and usage scenarios

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

### Development

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## Available Scripts

- `npm run lint`: Run ESLint on all packages
- `npm run lint:fix`: Fix ESLint issues automatically
- `npm run format`: Format code using Prettier
- `npm run clean`: Remove build artifacts
- `npm run build`: Build all packages

## Contributing

Please read the individual package READMEs for specific contribution guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 