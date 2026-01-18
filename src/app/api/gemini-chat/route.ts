import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, analysisText } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Use Gemini API to answer questions about the performance analysis
    const prompt = `You are PALA, a friendly and encouraging pickleball coach AI assistant. 

Based on the following performance analysis of a pickleball player, answer their question in a warm, supportive, and actionable way. Be concise but helpful.

Performance Analysis:
${analysisText || "No analysis available yet."}

User Question: ${question}

Provide a helpful, encouraging response that references the analysis when relevant. Keep it conversational and friendly, like you're chatting with a friend who wants to improve their game.`;

    // First, try to get available models to see what's supported
    let availableModel: string | null = null;
    try {
      const modelsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        // Look for a model that supports generateContent
        const supportedModel = modelsData.models?.find((m: any) => 
          m.supportedGenerationMethods?.includes('generateContent') &&
          (m.name?.includes('gemini-pro') || m.name?.includes('gemini-2.0') || m.name?.includes('gemini-1.0'))
        );
        if (supportedModel) {
          // Extract model name (format: models/gemini-pro)
          availableModel = supportedModel.name.replace('models/', '');
        }
      }
    } catch (err) {
      console.log("Could not fetch available models, using fallback list");
    }

    // Try current Gemini models (v1 API is more stable)
    // Updated to use currently available models - gemini-1.5 models are deprecated
    // Using v1 API version which is more stable than v1beta
    const modelCandidates = availableModel 
      ? [availableModel]
      : [
          'gemini-pro',
          'gemini-1.0-pro',
          'gemini-2.0-flash-exp',
        ];

    const endpoints = modelCandidates.map(
      model => `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    );

    let lastError: any = null;
    let response: Response | null = null;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          break; // Success, exit loop
        } else {
          const errorText = await response.text();
          console.error(`Gemini API error for ${endpoint}:`, errorText);
          lastError = errorText;
          response = null; // Reset for next attempt
        }
      } catch (err) {
        console.error(`Fetch error for ${endpoint}:`, err);
        lastError = err;
        response = null;
      }
    }

    if (!response || !response.ok) {
      let errorMessage = "Failed to get response from Gemini API";
      try {
        if (lastError && typeof lastError === "string") {
          const errorData = JSON.parse(lastError);
          errorMessage = errorData.error?.message || errorMessage;
        }
      } catch (e) {
        errorMessage = lastError?.message || String(lastError) || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm having trouble processing that question. Could you try rephrasing it?";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response from PALA",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
