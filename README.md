Pala - AI-powered pickleball analysis and coaching platform with [Overshoot SDK](https://www.npmjs.com/package/@overshoot/sdk) integration for real-time AI vision analysis on live video streams.

## Setup

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Configure API Key and Endpoint

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_OVERSHOOT_API_KEY=your-api-key-here
NEXT_PUBLIC_OVERSHOOT_API_URL=https://api.overshoot.ai
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

Replace the placeholders with your actual API keys:
- **Overshoot API Key**: Get from [Overshoot Dashboard](https://overshoot.ai)
- **ElevenLabs API Key**: Get from [ElevenLabs Dashboard](https://elevenlabs.io) (required for voice coaching)
- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey) (required for chat with PALA)

**API URL Note:** Some accounts may use a different endpoint format:
- Default: `https://api.overshoot.ai`
- Alternative: `https://cluster1.overshoot.ai/api/v0.2`

If you're getting network errors, try setting `NEXT_PUBLIC_OVERSHOOT_API_URL` to the correct endpoint for your account. Check your Overshoot dashboard or documentation for the correct URL.

**Note:** For server-side API route testing, you can also use:
```bash
OVERSHOOT_API_KEY=your-api-key-here
OVERSHOOT_API_URL=https://api.overshoot.ai
```

The `NEXT_PUBLIC_` prefix makes the variable available in the browser (required for the SDK).

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Real-time AI vision analysis on live camera streams
- Text recognition (OCR)
- Object detection
- Video file processing support
- Structured JSON output support
- Dynamic prompt updates

## Troubleshooting

### Network/CORS Errors

If you encounter "NetworkError when attempting to fetch resource", this is typically a CORS (Cross-Origin Resource Sharing) issue.

**The Problem:**
The Overshoot SDK connects directly from your browser to `https://api.overshoot.ai`. Browsers block cross-origin requests unless the server explicitly allows them via CORS headers.

**Solutions:**

1. **Verify API CORS Support**: The Overshoot API should support CORS for browser clients. If you're getting CORS errors, contact Overshoot support to ensure CORS is enabled.

2. **Use HTTPS**: Some APIs require HTTPS. Deploy to a hosting platform that supports HTTPS, or use HTTPS locally.

3. **Check Browser Console**: Open browser DevTools (F12) and check the Console/Network tabs for detailed CORS error messages.

4. **Test Connection**: Use the "Test Connection" button in the app - it uses a server-side API route that bypasses CORS for testing purposes.

**Note:** The SDK requires direct browser-to-API connections for WebSocket and WebRTC, so CORS must be properly configured on the API side.

## Overshoot SDK

This project uses `@overshoot/sdk` (version 0.1.0-alpha.2) for real-time vision analysis.

### Example Usage

The main page (`src/app/page.tsx`) demonstrates:
- Camera stream initialization
- Real-time inference results
- Error handling
- Start/stop controls

### Documentation

For more information about the Overshoot SDK, see:
- [npm package](https://www.npmjs.com/package/@overshoot/sdk)
- [GitHub repository](https://github.com/Overshoot-ai/overshoot-js-sdk)

## Deployment

Deploy the application to any hosting platform that supports Node.js applications.
