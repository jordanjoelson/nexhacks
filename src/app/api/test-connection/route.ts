import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.OVERSHOOT_API_KEY || process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set OVERSHOOT_API_KEY or NEXT_PUBLIC_OVERSHOOT_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    // Test the healthz endpoint
    // Note: API URL format may be: https://cluster1.overshoot.ai/api/v0.2
    const apiUrl = process.env.OVERSHOOT_API_URL || process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";
    const healthzUrl = apiUrl.endsWith("/") ? `${apiUrl}healthz` : `${apiUrl}/healthz`;
    
    const response = await fetch(healthzUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({ status: "ok" }));

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Connection successful",
        data,
        status: response.status,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `API returned status ${response.status}`,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Connection test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
