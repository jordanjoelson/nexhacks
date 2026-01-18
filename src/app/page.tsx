"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vision, setVision] = useState<RealtimeVision | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [latestResult, setLatestResult] = useState<StreamInferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [corsDiagnostics, setCorsDiagnostics] = useState<string | null>(null);

  useEffect(() => {
    // Check API key availability
    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";
    
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_OVERSHOOT_API_KEY is not set");
    } else {
      console.log("API key found (length:", apiKey.length, ")");
    }
    
    console.log("Using API URL:", apiUrl);
    console.log("Note: Some accounts may need: https://cluster1.overshoot.ai/api/v0.2");

    // Initialize RealtimeVision
    // Note: API URL format may vary by account:
    // - https://api.overshoot.ai (default)
    // - https://cluster1.overshoot.ai/api/v0.2 (some accounts)
    // Check Overshoot docs for the correct endpoint for your account
    const rv = new RealtimeVision({
      apiUrl: apiUrl,
      apiKey: apiKey || "",
      prompt:
        "You are analyzing a pickleball game. Describe what you see in real-time. Focus on: number of players, ball position, player positions on court, serves, rallies, ball hits, player movements, and game actions. Use simple, concise format like '2 players, ball in play, player serving' or '4 players, ball on left side, rally in progress'. Count players and describe ball location and game state.",
      onResult: (result) => {
        setLatestResult(result);
        setError(null); // Clear any previous errors on success
        console.log("Result:", result.result);
        console.log(`Latency: ${result.total_latency_ms}ms`);
      },
      onError: (err) => {
        let errorMessage = err.message;
        
        // Provide more context for network errors
        if (err.name === "NetworkError" || err.message.includes("NetworkError")) {
          const currentApiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";
          const origin = typeof window !== "undefined" ? window.location.origin : "unknown";
          
          errorMessage = `Network Error: ${err.message}. 
          
⚠️ CORS Preflight Request Failed

The browser sent an OPTIONS request to ${currentApiUrl}/streams but it failed or was blocked.

Your origin: ${origin}
API endpoint: ${currentApiUrl}

🔍 How to diagnose:

1. Open Browser DevTools (F12) → Network tab
2. Look for the OPTIONS request to ${currentApiUrl}/streams
3. Check the response:
   - Status code (should be 200 or 204)
   - Response headers should include:
     * Access-Control-Allow-Origin: ${origin} (or *)
     * Access-Control-Allow-Methods: POST, OPTIONS
     * Access-Control-Allow-Headers: Authorization, Content-Type

4. If OPTIONS fails:
   - The API doesn't support CORS from your origin
   - Contact Overshoot support to enable CORS
   - Try deploying to HTTPS (Vercel/Netlify)

5. Alternative API endpoint:
   - Some accounts use: https://cluster1.overshoot.ai/api/v0.2
   - Set NEXT_PUBLIC_OVERSHOOT_API_URL in .env.local

Check the Network tab for the exact error details.`;
          
          setCorsDiagnostics(`Check Network tab for OPTIONS request to ${currentApiUrl}/streams`);
        } else if (err.name === "UnauthorizedError") {
          errorMessage = "Unauthorized: Invalid or missing API key. Please verify your NEXT_PUBLIC_OVERSHOOT_API_KEY in .env.local";
        }
        
        setError(errorMessage);
        console.error("Overshoot error:", {
          name: err.name,
          message: err.message,
          error: err,
        });
      },
      source: {
        type: "camera",
        cameraFacing: "environment",
      },
      debug: true,
    });
    setVision(rv);

    return () => {
      rv.stop().catch(console.error);
    };
  }, []);

  // Update video element when stream becomes available
  useEffect(() => {
    if (isActive && vision && videoRef.current) {
      // Try to get the stream - it may not be available immediately
      const stream = vision.getMediaStream();
      if (stream) {
        console.log("Attaching stream to video element");
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      } else {
        // Stream not available yet, try again after a short delay
        const timeout = setTimeout(() => {
          const retryStream = vision.getMediaStream();
          if (retryStream && videoRef.current) {
            console.log("Attaching stream to video element (retry)");
            videoRef.current.srcObject = retryStream;
            videoRef.current.play().catch(console.error);
          }
        }, 100);
        return () => clearTimeout(timeout);
      }
    } else if (!isActive && videoRef.current) {
      // Clear the stream when stopped
      videoRef.current.srcObject = null;
    }
  }, [isActive, vision]);

  const handleStart = async () => {
    if (!vision) return;
    
    // Check if API key is set
    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    if (!apiKey) {
      setError("API key is missing. Please set NEXT_PUBLIC_OVERSHOOT_API_KEY in .env.local");
      return;
    }

    try {
      setIsActive(true);
      setError(null);
      await vision.start();
      
      // After starting, attach the stream to the video element
      if (videoRef.current) {
        const stream = vision.getMediaStream();
        if (stream) {
          console.log("Stream available after start, attaching to video");
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        } else {
          console.warn("Stream not available immediately after start");
        }
      }
    } catch (err) {
      setIsActive(false);
      let errorMessage = "Failed to start";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide more helpful error messages
        if (err.message.includes("NetworkError") || err.message.includes("fetch")) {
          errorMessage = `Network error: Unable to connect to Overshoot API. This could be due to:
            - CORS issues (try accessing via HTTPS)
            - Invalid API endpoint
            - Network connectivity issues
            - API service may be down
            
            Original error: ${err.message}`;
        } else if (err.message.includes("Unauthorized") || err.message.includes("401")) {
          errorMessage = "Unauthorized: Invalid or missing API key. Please check your NEXT_PUBLIC_OVERSHOOT_API_KEY";
        } else if (err.message.includes("WebSocket")) {
          errorMessage = `WebSocket connection failed: ${err.message}. Check your network connection and API key.`;
        }
      }
      
      setError(errorMessage);
      console.error("Failed to start:", err);
      console.error("Error details:", {
        name: err instanceof Error ? err.name : "Unknown",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  };

  const handleStop = async () => {
    if (!vision) return;
    try {
      await vision.stop();
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("Failed to stop:", err);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setError(null);

    try {
      // Use Next.js API route to bypass CORS (server-side request)
      const response = await fetch("/api/test-connection", {
        method: "GET",
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        alert(`✅ Connection successful!\n\nAPI is reachable and responding.\n\nResponse: ${JSON.stringify(data.data, null, 2)}`);
      } else {
        if (data.error?.includes("API key")) {
          setError(`❌ ${data.error}\n\nNote: For server-side testing, use OVERSHOOT_API_KEY (without NEXT_PUBLIC_ prefix) in .env.local`);
        } else if (data.status === 401) {
          setError("❌ Unauthorized: Invalid API key. Please check your API key in .env.local");
        } else {
          setError(`❌ Connection test failed: ${data.error || "Unknown error"}\n\nStatus: ${data.status || "N/A"}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`❌ Connection test failed: ${errorMessage}\n\nThis could indicate:\n- API route not working\n- Network connectivity issues\n- Server-side configuration problem`);
      console.error("Connection test error:", err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <main className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Overshoot SDK Demo
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Real-time AI vision analysis on live video streams
          </p>
        </div>

        {!process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY && (
          <div className="rounded-lg bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <p className="font-semibold">⚠️ API Key Required</p>
            <p className="text-sm">
              Please set NEXT_PUBLIC_OVERSHOOT_API_KEY in your .env.local file
            </p>
            <p className="text-xs mt-2 opacity-75">
              Note: For server-side API route testing, you can also use OVERSHOOT_API_KEY (without NEXT_PUBLIC_ prefix)
            </p>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-4 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-2">ℹ️ About CORS and Network Errors</p>
          <p className="text-sm">
            The Overshoot SDK connects directly from your browser to the API. If you see network errors, it's likely a CORS (Cross-Origin Resource Sharing) issue.
          </p>
          <p className="text-sm mt-2 font-semibold">Current API URL:</p>
          <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded block mt-1">
            {process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai"}
          </code>
          <p className="text-xs mt-2 opacity-75">
            💡 Tip: Some accounts use <code>https://cluster1.overshoot.ai/api/v0.2</code>. 
            Set <code>NEXT_PUBLIC_OVERSHOOT_API_URL</code> in .env.local if your endpoint differs.
          </p>
          
          <details className="mt-3">
            <summary className="text-sm font-semibold cursor-pointer">🔍 How to Check OPTIONS Request (CORS Preflight)</summary>
            <div className="mt-2 text-xs space-y-2">
              <p>When you click "Start Camera", the browser sends an OPTIONS request first:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open DevTools (F12) → Network tab</li>
                <li>Click "Start Camera"</li>
                <li>Look for: <code>OPTIONS https://api.overshoot.ai/streams</code></li>
                <li>Click on it to see details</li>
              </ol>
              <p className="font-semibold mt-2">✅ Successful OPTIONS Response Should Have:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Status: <code>200 OK</code> or <code>204 No Content</code></li>
                <li>Response Headers include:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code>Access-Control-Allow-Origin: *</code> or your origin</li>
                    <li><code>Access-Control-Allow-Methods: POST, OPTIONS</code></li>
                    <li><code>Access-Control-Allow-Headers: Authorization, Content-Type</code></li>
                  </ul>
                </li>
              </ul>
              <p className="font-semibold mt-2">❌ If OPTIONS Fails:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Status: <code>(failed)</code> or <code>CORS error</code></li>
                <li>Missing CORS headers in response</li>
                <li>This means the API doesn't allow requests from your origin</li>
                <li><strong>Solution:</strong> Contact Overshoot support to enable CORS</li>
              </ul>
            </div>
          </details>
          
          <p className="text-sm mt-2">
            <strong>Solutions:</strong>
          </p>
          <ul className="text-sm mt-1 list-disc list-inside space-y-1">
            <li>Verify the API endpoint URL is correct for your account</li>
            <li>Check if the API supports CORS from your origin</li>
            <li>Try accessing via HTTPS (deploy to Vercel/Netlify for testing)</li>
            <li>Contact Overshoot support to ensure CORS is enabled</li>
            <li>Check browser console (F12) Network tab for detailed error messages</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleStart}
            disabled={isActive || !vision || isTestingConnection}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Camera
          </button>
          <button
            onClick={handleStop}
            disabled={!isActive}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop Camera
          </button>
          <button
            onClick={testConnection}
            disabled={isTestingConnection || isActive}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            <p className="font-semibold">Error:</p>
            <p className="text-sm whitespace-pre-line">{error}</p>
            {corsDiagnostics && (
              <div className="mt-3 p-3 bg-red-200 dark:bg-red-800 rounded">
                <p className="font-semibold text-xs mb-2">🔍 CORS Diagnostics:</p>
                <p className="text-xs">{corsDiagnostics}</p>
                <div className="mt-2 text-xs">
                  <p className="font-semibold">What to check in Network tab:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                    <li>Find the OPTIONS request to <code>/streams</code></li>
                    <li>Check Status: Should be 200 or 204 (not failed/blocked)</li>
                    <li>Check Response Headers for:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><code>Access-Control-Allow-Origin</code></li>
                        <li><code>Access-Control-Allow-Methods</code></li>
                        <li><code>Access-Control-Allow-Headers</code></li>
                      </ul>
                    </li>
                    <li>If missing or wrong, CORS is not configured on the API</li>
                  </ol>
                </div>
              </div>
            )}
            <div className="mt-2 text-xs opacity-75">
              <p>💡 Troubleshooting tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Verify your API key is set in .env.local</li>
                <li>Restart the dev server after adding .env.local</li>
                <li>Check browser console for detailed error logs</li>
                <li>Ensure you have a valid Overshoot API key</li>
                <li>Try accessing via HTTPS (some APIs require it)</li>
              </ul>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-auto w-full"
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white">
              <p>Camera feed will appear here when started</p>
            </div>
          )}
        </div>

        {latestResult && (
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-800 border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                AI Analysis Results
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  Analysis Result
                </p>
                <p className="text-base text-black dark:text-zinc-50 whitespace-pre-wrap break-words">
                  {latestResult.result}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Latency
                  </p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {latestResult.total_latency_ms}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Model
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 truncate" title={latestResult.model_name}>
                    {latestResult.model_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Status
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      latestResult.ok
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {latestResult.ok ? "✓ Success" : "✗ Error"}
                  </p>
                </div>
              </div>
              {latestResult.error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                    Error Details
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {latestResult.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isActive && !latestResult && (
          <div className="rounded-lg bg-blue-50 p-4 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm font-semibold">Waiting for AI analysis results...</p>
            </div>
            <p className="text-xs mt-2 opacity-75">
              The camera is active. Results will appear here as the AI processes the video stream.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
