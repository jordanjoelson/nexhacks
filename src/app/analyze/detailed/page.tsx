"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";
import { useVideoStore } from "@/store/videoStore";
import { useRouter } from "next/navigation";

import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Loader2,
  CheckCircle,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Camera,
  Move,
  Play,
} from "lucide-react";

type Phase = "analyzing" | "ready";

export default function DetailedAnalysisPage() {

  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [fullText, setFullText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const file = useVideoStore((s) => s.file);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const visionRef = useRef<RealtimeVision | null>(null);
  const resultsRef = useRef<StreamInferenceResult[]>([]);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  useEffect(() => {
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";

    if (!apiKey) {
      setError("Missing Overshoot API key");
      return;
    }

    const initAnalysis = async () => {
      try {
        setError(null);
        setPhase("analyzing");
        resultsRef.current = [];

        const vision = new RealtimeVision({
          apiUrl,
          apiKey,
          prompt: `Provide a DETAILED pickleball breakdown. Include:
        
1) Technique breakdown by category (serve, return, dinks, volleys, drives)
2) Footwork & positioning notes
3) Shot selection / decision making
4) Tactical notes (when to attack, when to reset)
5) 3 drills tailored to the biggest weaknesses
6) A short "next session plan" (10 minutes warmup + 3 drills + 5 minutes game simulation)

Be specific and actionable.`,
          // ✅ Use url source
          source: { type: "video", file },
          onResult: (result) => {
            if (result.result?.trim()) {
              resultsRef.current.push(result);
            }
          },
          onError: (err) => {
            console.error("Overshoot error:", err);
            setError("Overshoot error while analyzing the video.");
          },
        });

        visionRef.current = vision;
        await vision.start();

        analysisTimeoutRef.current = setTimeout(() => {
          vision.stop();

          const text = resultsRef.current
            .map((r) => r.result)
            .filter((r) => r && r.trim())
            .join(" ");

          setFullText(text || "Analysis complete. (No detailed text returned.)");
          setPhase("ready");
        }, 20000); // longer for detailed
      } catch (e: any) {
        console.error("Error starting detailed analysis:", e);
        setError(e?.message || "Failed to start analysis.");
      }
    };

    initAnalysis();

    return () => {
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
    <div className="min-h-screen bg-[#FFFAF5] p-6">
      <div className="max-w-4xl mx-auto">
        {/* IDENTICAL header block */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4 text-[#2D3142]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Detailed Breakdown
          </h1>
          <p className="text-xl text-[#6B7280]">
            {phase === "analyzing"
              ? "PALA is preparing your detailed breakdown"
              : "Your detailed breakdown is ready"}
          </p>
        </div>

        {/* IDENTICAL main Card shell */}
        <Card className="border-2 border-dashed border-[#FF6B35] bg-white shadow-xl">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              {/* Processing block */}
              {phase === "analyzing" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 text-[#FF6B35] animate-spin mx-auto" />
                  <div>
                    <p className="text-2xl font-bold text-[#2D3142] mb-2">Processing...</p>
                    <p className="text-[#6B7280]">PALA is analyzing your video</p>
                  </div>
                </div>
              )}

              {/* Error block */}
              {error && (
                <div className="w-full p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-[#FF6B35] mt-0.5" />
                    <div>
                      <p className="font-bold text-[#2D3142]">Something went wrong</p>
                      <p className="text-sm text-[#6B7280]">{error}</p>
                      <p className="text-xs text-[#6B7280] mt-2">
                        If your video URL is a <span className="font-mono">blob:</span> URL, it will fail after navigation.
                        Upload to storage and pass an https URL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video preview (same as Summary) */}
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
                    <VideoPlayer videoUrl={previewUrl} />
                  </div>
                </div>
              )}

              {/* Detailed output */}
              {phase === "ready" && (
                <div className="w-full space-y-6">
                  <div className="p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                      <p className="font-bold text-[#2D3142]">Detailed Notes</p>
                    </div>
                    <p className="text-[#2D3142] leading-relaxed whitespace-pre-wrap">
                      {fullText}
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      size="lg"
                      className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-10 group"
                      onClick={() => {
                        const href = `/analyze/summary?video=${encodeURIComponent(previewUrl || "")}`;
                        router.push
                      }}
                    >
                      Back to Summary
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

        {/* Bottom grid — identical style */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#4ECDC4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Replay Moments</h3>
                  <p className="text-sm text-[#6B7280]">Scrub to see key decisions</p>
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
                  <h3 className="font-bold text-[#2D3142] mb-1">Drill Plan</h3>
                  <p className="text-sm text-[#6B7280]">Use the drills section next session</p>
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
                  <h3 className="font-bold text-[#2D3142] mb-1">Keep Improving</h3>
                  <p className="text-sm text-[#6B7280]">Record again to track progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
