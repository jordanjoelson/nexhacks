import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "ElevenLabs API key not configured. Please set ELEVENLABS_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    // Log first few characters for debugging (don't log full key)
    console.log("Using ElevenLabs API key (first 10 chars):", apiKey.substring(0, 10) + "...");

    // Use the streaming endpoint for better performance
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5", // Fast, low-latency model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      let errorMessage = `ElevenLabs API error: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail?.message) {
          errorMessage = errorData.detail.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the text as is
        if (errorText) {
          errorMessage = errorText.substring(0, 200);
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Return the audio as a blob
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
