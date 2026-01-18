"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";
import { useVideoStore } from "@/store/videoStore";

import VideoPlayer from "@/components/VideoPlayer";
import Loader from "@/components/Loader";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Move,
  Play,
  CheckCircle,
} from "lucide-react";

// Simple inline typing component that always works
function SimpleTypingAnimation({
  text,
  speed = 15,
  onComplete,
  skip = false,
}: {
  text: string;
  speed?: number;
  onComplete: () => void;
  skip?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const textKeyRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log("SimpleTypingAnimation effect triggered", { text: text?.substring(0, 50), skip, textLength: text?.length });
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Increment key when text changes to force reset
    textKeyRef.current += 1;

    // If no text, reset everything
    if (!text || text.length === 0) {
      console.log("No text, resetting");
      setDisplayText("");
      setIsTyping(false);
      indexRef.current = 0;
      return;
    }

    // If user skips, instantly complete
    if (skip) {
      console.log("Skip enabled, showing full text");
      setDisplayText(text);
      setIsTyping(false);
      indexRef.current = text.length;
      onCompleteRef.current();
      return;
    }

    // Always reset and start fresh when text changes
    console.log("Starting typing animation", text.length, "characters");
    indexRef.current = 0;
    setDisplayText("");
    setIsTyping(true);

    // Start typing animation with a small delay to ensure state is set
    const startTyping = () => {
      console.log("Starting interval for typing");
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayText(text.substring(0, currentIndex));
          indexRef.current = currentIndex;
          timeoutRef.current = setTimeout(typeNextChar, speed);
        } else {
          // Typing complete
          console.log("Typing complete");
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsTyping(false);
          onCompleteRef.current();
        }
      };
      
      timeoutRef.current = setTimeout(typeNextChar, speed);
    };

    // Small delay to ensure component is ready
    const initialTimeoutId = setTimeout(startTyping, 50);
    
    return () => {
      clearTimeout(initialTimeoutId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, speed, skip]);

  return (
    <p className="text-[#2D3142] leading-relaxed whitespace-pre-wrap">
      {displayText}
      {isTyping && (
        <span className="inline-block w-2 h-5 bg-[#FF6B35] ml-1 animate-pulse" />
      )}
    </p>
  );
}

interface AnalysisPoint {
  title: string;
  type: "strength" | "weakness";
  improvement?: string;
}

// Parse structured analysis from Overshoot
function parseStructuredAnalysis(text: string): { summary: string; points: AnalysisPoint[] } {
  console.log("parseStructuredAnalysis called with text length:", text.length);
  
  if (!text || text.trim().length === 0) {
    console.log("Empty text provided to parser");
    return { summary: "", points: [] };
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  console.log("Parsing", lines.length, "lines");

  const summary: string[] = [];
  const points: AnalysisPoint[] = [];

  let inStrengths = false;
  let inWeaknesses = false;
  let strengthCount = 0;
  let weaknessCount = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes("strength") && lower.includes(":")) {
      inStrengths = true;
      inWeaknesses = false;
      continue;
    }
    if ((lower.includes("weakness") || lower.includes("improvement")) && lower.includes(":")) {
      inWeaknesses = true;
      inStrengths = false;
      continue;
    }

    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      const content = line.substring(1).trim();

      if (inStrengths && strengthCount < 3) {
        const shortTitle = content.split(".")[0].substring(0, 80);
        points.push({ title: shortTitle, type: "strength" });
        strengthCount++;
      } else if (inWeaknesses && weaknessCount < 3) {
        const parts = content.split(":");
        const title = parts[0].trim().substring(0, 80);
        const improvement =
          parts.length > 1 ? parts[1].trim().substring(0, 100) : "Focus on this during practice";
        points.push({ title, type: "weakness", improvement });
        weaknessCount++;
      }
    } else if (!inStrengths && !inWeaknesses) {
      // Collect summary lines (everything before strengths/weaknesses sections)
      summary.push(line);
    }
  }

  const limitedPoints = [
    ...points.filter((p) => p.type === "strength").slice(0, 3),
    ...points.filter((p) => p.type === "weakness").slice(0, 3),
  ];

  const summaryText = summary.join(" ").trim();
  
  // If no structured summary found, use the entire text (up to first strength/weakness section)
  const finalSummary = summaryText || text.split(/strength|weakness|improvement/i)[0]?.trim() || text.trim();
  
  console.log("Parser result - summary length:", finalSummary.length, "points:", limitedPoints.length);
  
  return { summary: finalSummary, points: limitedPoints };
}

export default function SummaryPage() {

  const router = useRouter()
  const [phase, setPhase] = useState<"analyzing" | "typing" | "points">("analyzing");
  const [summaryText, setSummaryText] = useState<string>("");
  const [analysisPoints, setAnalysisPoints] = useState<AnalysisPoint[]>([]);
  const [typingKey, setTypingKey] = useState(0);
  const file = useVideoStore((s) => s.file);
  const [previewUrl, setPreviewUrl] = useState("");

  // NEW: controls for "only show bullets after typing complete"
  const [typingComplete, setTypingComplete] = useState(false);
  const [skipTyping, setSkipTyping] = useState(false);

  const visionRef = useRef<RealtimeVision | null>(null);
  const resultsRef = useRef<StreamInferenceResult[]>([]);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const strengthPoints = useMemo(() => analysisPoints.filter((p) => p.type === "strength"), [analysisPoints]);
  const weaknessPoints = useMemo(() => analysisPoints.filter((p) => p.type === "weakness"), [analysisPoints]);

  const handleTypingComplete = useCallback(() => {
    // Mark complete and show points, but keep summary visible
    setTypingComplete(true);
    setTimeout(() => setPhase("points"), 500);
  }, []);

  const handleSkip = () => {
    if (!summaryText) return;
    setSkipTyping(true);
    setTypingComplete(true);
    setPhase("points");
  };

  useEffect(() => {
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";

    if (!apiKey) {
      console.error("Missing Overshoot API key");
      return;
    }

    const initAnalysis = async () => {
      try {
        setPhase("analyzing");
        resultsRef.current = [];
        const vision = new RealtimeVision({
          apiUrl,
          apiKey,
          prompt: `Analyze this pickleball video in detail and provide:

1. A COMPREHENSIVE, DETAILED summary (8-12 sentences) covering:
   - Overall performance assessment
   - Specific technique observations (serves, returns, volleys, dinks)
   - Court positioning and movement patterns
   - Shot selection and decision-making
   - Strategy and game awareness
   - Physical conditioning and footwork
   - Mental game and composure
   Be thorough and specific with observations throughout the entire video.

2. Top Strengths: (list EXACTLY 3 MOST IMPORTANT strengths, max 8 words each)
- [strength 1]
- [strength 2]
- [strength 3]

3. Top Areas for Improvement: (list EXACTLY 3 MOST CRITICAL weaknesses, max 8 words each, with a short 10-word improvement tip)
- [weakness 1]: [tip]
- [weakness 2]: [tip]
- [weakness 3]: [tip]

IMPORTANT: Make the summary VERY DETAILED and comprehensive. Keep bullet points SHORT (max 8 words).`,
          source: { type: "video", file },
          onResult: (result) => {
            console.log("Received result:", result.result?.substring(0, 100));
            if (result.result?.trim()) {
              resultsRef.current.push(result);
              console.log("Total results collected:", resultsRef.current.length);
            }
          },
          onError: (err) => console.error("Overshoot error:", err),
        });

        visionRef.current = vision;
        await vision.start();

        analysisTimeoutRef.current = setTimeout(() => {
          vision.stop();

          console.log("Analysis timeout reached. Results count:", resultsRef.current.length);
          console.log("Raw results:", resultsRef.current);

          const fullText = resultsRef.current
            .map((r) => r.result)
            .filter((r) => r && r.trim())
            .join(" ");

          console.log("Full text length:", fullText.length);
          console.log("Full text preview:", fullText.substring(0, 200));

          const parsed = parseStructuredAnalysis(fullText);

          console.log("Parsed summary length:", parsed.summary?.length || 0);
          console.log("Parsed points count:", parsed.points.length);

          const finalSummary =
            parsed.summary || fullText || "Analysis complete. Here are the key findings from your pickleball video.";

          console.log("Final summary length:", finalSummary.length);
          console.log("Final summary:", finalSummary.substring(0, 100));

          setSummaryText(finalSummary);
          setAnalysisPoints(parsed.points);

          // Reset typing controls every new run
          setTypingComplete(false);
          setSkipTyping(false);
          setTypingKey((prev) => prev + 1);

          setTimeout(() => setPhase("typing"), 100);
        }, 15000);
      } catch (error) {
        console.error("Error starting analysis:", error);
      }
    };

    const timeout = setTimeout(initAnalysis, 500);

    return () => {
      clearTimeout(timeout);
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
      if (visionRef.current) visionRef.current.stop();
    };
  }, [file]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="min-h-screen bg-[#FFFAF5] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/upload")}
            className="hover:bg-[#FF6B35]/10 text-[#6B7280] hover:text-[#2D3142] text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Upload
          </Button>
        </div>

        {/* IDENTICAL header block */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#2D3142] px-4" style={{ fontFamily: "var(--font-display)" }}>
            Analysis Summary
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] px-4">
            {phase === "analyzing" ? "PALA is analyzing your pickleball footage" : "PALA has analyzed your pickleball footage"}
          </p>
        </div>

        {/* IDENTICAL main Card shell (border-dashed + orange) */}
        <Card className="border-2 border-dashed border-[#FF6B35] bg-white shadow-xl relative">
          {/* pdle.png in bottom left corner */}
          <div className="absolute -bottom-6 sm:-bottom-8 lg:-bottom-10 -left-4 sm:-left-6 z-10">
            <img 
              src="/pdle.png" 
              alt="PALA" 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 object-contain drop-shadow-lg"
            />
          </div>
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
              {/* Status row */}
              {phase === "analyzing" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#FF6B35] animate-spin mx-auto" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-2">Processing...</p>
                    <p className="text-sm sm:text-base text-[#6B7280]">PALA is analyzing your video</p>
                  </div>
                </div>
              )}

              {/* Video preview */}
              {previewUrl && (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4ECDC4]" />
                    <div>
                      <p className="font-medium text-[#2D3142]">Video Ready</p>
                      <p className="text-sm text-[#6B7280]">Preview below</p>
                    </div>
                  </div>

                  <div className="mt-2 p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                    <VideoPlayer videoUrl={previewUrl} autoPlay={true} />
                  </div>
                </div>
              )}

              {/* Typing summary */}
              {phase === "typing" && summaryText && (
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                      <p className="font-bold text-[#2D3142]">Summary</p>
                    </div>

                    {/* NEW: Skip button */}
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="border-[#FFB84D]/30 text-[#2D3142] hover:bg-[#FFF5EB]"
                    >
                      Skip
                    </Button>
                  </div>

                  <div className="p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                    <SimpleTypingAnimation
                      key={`typing-${typingKey}`}
                      text={summaryText}
                      speed={15}
                      onComplete={handleTypingComplete}
                      skip={skipTyping}
                    />
                  </div>
                </div>
              )}

              {/* Points: Show above summary after typing completes (or skip) */}
              {phase === "points" && typingComplete && (
                <div className="w-full space-y-6">
                  {/* Strengths and Areas to Improve - shown above summary */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-[#4ECDC4]/10 to-white border-[#4ECDC4]/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-[#4ECDC4]" />
                          <p className="font-bold text-[#2D3142]">Strengths</p>
                        </div>
                        <ul className="space-y-2">
                          {strengthPoints.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                              <span className="text-[#4ECDC4] mt-1">•</span>
                              <span>{p.title}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#FF6B35]/10 to-white border-[#FF6B35]/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5 text-[#FF6B35]" />
                          <p className="font-bold text-[#2D3142]">Areas to Improve</p>
                        </div>
                        <ul className="space-y-3">
                          {weaknessPoints.map((p, i) => (
                            <li key={i} className="text-[#6B7280]">
                              <div className="flex items-start gap-2">
                                <span className="text-[#FF6B35] mt-1">•</span>
                                <span className="font-medium text-[#2D3142]">{p.title}</span>
                              </div>
                              {p.improvement && <div className="ml-4 mt-1 text-sm">💡 {p.improvement}</div>}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Summary text - shown below strengths/weaknesses */}
                  {summaryText && (
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                        <p className="font-bold text-[#2D3142]">Detailed Analysis</p>
                      </div>
                      <div className="p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                        <p className="text-[#2D3142] leading-relaxed whitespace-pre-wrap">
                          {summaryText}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <Button
                      size="lg"
                      className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-10 group"
                      onClick={() => {
                        const href = `/analyze/detailed?video=${encodeURIComponent(previewUrl || "")}`;
                        router.push("/analyze/detailed");
                      }}
                    >
                      Dive Deeper
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}


              {!previewUrl && (
                <div className="text-center space-y-2">
                  <AlertCircle className="w-10 h-10 text-[#FF6B35] mx-auto" />
                  <p className="text-[#2D3142] font-bold">Missing video</p>
                  <p className="text-[#6B7280] text-sm">Go back and upload again.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#4ECDC4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Replay Moments</h3>
                  <p className="text-sm text-[#6B7280]">Use the preview to spot key rallies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFB84D]/10 flex items-center justify-center">
                  <Move className="w-6 h-6 text-[#FFB84D]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Footwork Focus</h3>
                  <p className="text-sm text-[#6B7280]">Pick one weakness and drill it today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Dive Deeper</h3>
                  <p className="text-sm text-[#6B7280]">Open the detailed breakdown next</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
