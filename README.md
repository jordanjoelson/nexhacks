# Pala - AI Pickleball Coach

AI-powered pickleball analysis and coaching platform that democratizes world-class sports training through real-time video analysis.

## About

Pala transforms how pickleball players train by providing professional-grade coaching feedback accessible to anyone with a smartphone. Built with the [Overshoot SDK](https://www.npmjs.com/package/@overshoot/sdk), Pala analyzes game footage to deliver comprehensive performance insights - identifying strengths, weaknesses, and providing personalized recommendations through voice narration (ElevenLabs) and interactive AI chat (Google Gemini).

**Key Features:**
- Shot-by-shot gameplay breakdown with AI vision analysis
- Real-time player tracking and court positioning insights
- Voice-narrated coaching feedback
- Interactive chat for personalized advice
- Pickleball-specific metrics (serve quality, footwork, reaction times)

## Tech Stack

- **Frontend:** Next.js 16.1.3, React 19.2.3, TypeScript 5
- **AI Vision:** Overshoot SDK (v0.1.0-alpha.2) for gameplay analysis
- **Player Tracking:** TensorFlow.js (v4.22.0) with COCO-SSD
- **Voice Coaching:** ElevenLabs API
- **Interactive Chat:** Google Gemini API
- **State Management:** Zustand (v5.0.10)
- **Styling:** Tailwind CSS 4, Framer Motion

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_OVERSHOOT_API_KEY=your-api-key-here
NEXT_PUBLIC_OVERSHOOT_API_URL=https://api.overshoot.ai
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

**Get Your API Keys:**
- **Overshoot:** [Dashboard](https://overshoot.ai)
- **ElevenLabs:** [Dashboard](https://elevenlabs.io)
- **Gemini:** [Google AI Studio](https://makersuite.google.com/app/apikey)

**Note:** Some Overshoot accounts use `https://cluster1.overshoot.ai/api/v0.2` instead. Check your dashboard if you encounter network errors.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How It Works

1. **Upload:** Submit pickleball game footage
2. **Analyze:** Overshoot SDK processes video with custom prompts for pickleball-specific insights
3. **Review:** Get detailed breakdowns with synchronized video annotations and voice narration
4. **Improve:** Ask follow-up questions through AI chat for tailored coaching advice

## Roadmap

- **Injury Prevention:** MediaPipe Pose integration for movement pattern analysis
- **Multi-Sport:** Expand to tennis and badminton
- **Training Programs:** Structured skill assessments and progression tracking
- **Social Features:** Community building and peer comparison
- **Wearables:** Biometric data integration for comprehensive performance metrics

## Troubleshooting

### CORS/Network Errors
If you see "NetworkError when attempting to fetch resource":
1. Verify CORS is enabled on your Overshoot API account
2. Try the alternative API URL in your `.env.local`
3. Check browser console (F12) for detailed error messages
4. Use the "Test Connection" button to verify server-side connectivity

## Mission

Breaking down financial and accessibility barriers in sports coaching. Pala proves you don't need unlimited resources to achieve excellence - every player deserves quality coaching regardless of financial situation or location.

---

Built at NexHacks in 24 hours with passion for democratizing sports excellence.
