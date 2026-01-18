"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import TypingAnimation from "@/components/TypingAnimation";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import Loader from "@/components/Loader";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";

// Helper function to clean and format Overshoot results into a summary
function formatOvershootSummary(results: StreamInferenceResult[]): string {
  if (results.length === 0) {
    return "Analyzing your pickleball video...";
  }

  // Combine all results
  const combinedText = results
    .map((r) => r.result)
    .filter((r) => r && r.trim())
    .join(" ");

  // Clean up the text - remove markdown, extra spaces, etc.
  let cleaned = combinedText
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/\*/g, "") // Remove italic markers
    .replace(/#{1,6}\s/g, "") // Remove markdown headers
    .replace(/\n{3,}/g, "\n\n") // Max 2 newlines
    .replace(/\s{2,}/g, " ") // Multiple spaces to single
    .trim();

  // Format into a structured summary
  const lines = cleaned.split("\n").filter((line) => line.trim());
  
  // If it's already well-formatted, return as-is
  if (lines.length > 5) {
    return cleaned;
  }

  // Otherwise, create a structured summary
  return `After analyzing your pickleball video, here's what I observed:

${cleaned}

Key observations from the video analysis above.`;
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("video");
  const [showDiveDeeper, setShowDiveDeeper] = useState(false);
  const [summary, setSummary] = useState<string>("Analyzing your pickleball video...");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const visionRef = useRef<RealtimeVision | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultsRef = useRef<StreamInferenceResult[]>([]);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Overshoot SDK and analyze video
  useEffect(() => {
    if (!videoUrl) return;

    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";

    if (!apiKey) {
      setSummary("Error: API key not configured. Please set NEXT_PUBLIC_OVERSHOOT_API_KEY in .env.local");
      setIsAnalyzing(false);
      return;
    }

    // Convert blob URL to File object for Overshoot SDK
    const initAnalysis = async () => {
      try {
        if (!videoUrl) {
          throw new Error("No video URL provided");
        }

        // Fetch the blob URL to get the File object
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        
        // Create a File object from the blob (Overshoot SDK needs a File, not a Blob)
        const videoFile = new File([blob], "video.mp4", { type: blob.type || "video/mp4" });

        // Initialize Overshoot SDK with video file (NOT camera)
        // Use source: { type: 'video', file: videoFile } as per documentation
        const vision = new RealtimeVision({
          apiUrl: apiUrl,
          apiKey: apiKey,
          prompt:
            "You are analyzing a pickleball game video. Provide a comprehensive summary focusing on: player performance, technique, key moments, strengths, and areas for improvement. Be concise and structured. Format as plain text without markdown.",
          source: { type: 'video', file: videoFile }, // Use video file, NOT camera
          onResult: (result: StreamInferenceResult) => {
            if (result.result && result.ok) {
              resultsRef.current.push(result);
              // Update summary every few results to show progress
              if (resultsRef.current.length % 3 === 0 || resultsRef.current.length === 1) {
                const formatted = formatOvershootSummary(resultsRef.current);
                setSummary(formatted);
              }
            }
          },
          onError: (err) => {
            console.error("Overshoot error:", err);
            setSummary(`Analysis error: ${err.message}. Please try again.`);
            setIsAnalyzing(false);
          },
        });

        visionRef.current = vision;

        // Start analysis - no parameters needed, SDK uses source from constructor
        await vision.start();
        setIsAnalyzing(true);

        // Collect results for 12 seconds, then finalize summary
        analysisTimeoutRef.current = setTimeout(() => {
          const finalSummary = formatOvershootSummary(resultsRef.current);
          setSummary(finalSummary);
          setIsAnalyzing(false);
          vision.stop();
        }, 12000);
      } catch (error) {
        console.error("Error starting analysis:", error);
        setSummary(`Error starting video analysis: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        setIsAnalyzing(false);
      }
    };

    // Small delay to ensure everything is ready
    const timeout = setTimeout(initAnalysis, 500);

    return () => {
      clearTimeout(timeout);
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      if (visionRef.current) {
        visionRef.current.stop();
      }
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            Analysis Summary
          </h1>
          <p className="mt-2 text-lg text-black">
            {isAnalyzing ? "Pala is analyzing your pickleball video..." : "Pala has analyzed your pickleball video"}
          </p>
        </div>

        {videoUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-black mb-4">
              Video Preview
            </h2>
            <VideoPlayer videoUrl={videoUrl} />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 border border-gray-200 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">Pala</h2>
              <p className="text-sm text-black">AI Analysis Assistant</p>
            </div>
          </div>

          <div className="max-w-none">
            {isAnalyzing && summary === "Analyzing your pickleball video..." ? (
              <div className="flex items-center gap-3">
                <Loader />
                <div className="text-black">
                  {summary}
                </div>
              </div>
            ) : (
              <TypingAnimation
                text={summary}
                speed={20}
                onComplete={() => setShowDiveDeeper(true)}
                showSkip={false}
              />
            )}
          </div>

          {showDiveDeeper && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href={`/analyze/detailed?video=${encodeURIComponent(videoUrl || "")}`}
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-lg border border-gray-200 hover:from-green-500 hover:to-green-600 hover:border-green-500 transition-all"
              >
                <span>Dive Deeper</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
