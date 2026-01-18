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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      let errorMessage = `Gemini API error: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Keep default error message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
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
