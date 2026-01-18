This is a [Next.js](https://nextjs.org) project with [Overshoot SDK](https://www.npmjs.com/package/@overshoot/sdk) integration for real-time AI vision analysis on live video streams.

## Setup

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_OVERSHOOT_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with your actual Overshoot API key.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
