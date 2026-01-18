"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vision, setVision] = useState<RealtimeVision | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [latestResult, setLatestResult] = useState<StreamInferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize RealtimeVision
    const rv = new RealtimeVision({
      apiUrl: "https://api.overshoot.ai",
      apiKey: process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY || "",
      prompt:
        "Read any visible text and return JSON: {text: string | null, confidence: number}",
      onResult: (result) => {
        setLatestResult(result);
        console.log("Result:", result.result);
        console.log(`Latency: ${result.total_latency_ms}ms`);
      },
      onError: (err) => {
        setError(err.message);
        console.error("Overshoot error:", err);
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

  useEffect(() => {
    if (vision && videoRef.current) {
      const stream = vision.getMediaStream();
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [vision]);

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
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={isActive || !vision}
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
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
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
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-800">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
              Latest Result
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Result:</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {latestResult.result}
                </span>
              </p>
              <p>
                <span className="font-semibold">Latency:</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {latestResult.total_latency_ms}ms
                </span>
              </p>
              <p>
                <span className="font-semibold">Model:</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {latestResult.model_name}
                </span>
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={
                    latestResult.ok
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {latestResult.ok ? "Success" : "Error"}
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
