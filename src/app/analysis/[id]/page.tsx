"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Target, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type AnalyzeResponse = {
  analysisText: string;
  strengths?: string[];
  improvements?: string[];
  quickWins?: string[];
};

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    // params.id can be string | string[] | undefined depending on your route
    const raw = (params as any)?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [analysisText, setAnalysisText] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [quickWins, setQuickWins] = useState<string[]>([]);

  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Fetch analysis from backend
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        // OPTION A: call your Next.js route (/api/analyze) which proxies to backend
        // const res = await fetch(`/api/analyze?id=${encodeURIComponent(id)}`);

        const res = await fetch(`/analyze/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Analyze failed (${res.status})`);
        }

        const data = (await res.json()) as AnalyzeResponse;

        if (cancelled) return;

        setAnalysisText(data.analysisText ?? "");
        setStrengths(data.strengths ?? []);
        setImprovements(data.improvements ?? []);
        setQuickWins(data.quickWins ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Something went wrong");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 2) Typing effect: run AFTER we have analysisText
  useEffect(() => {
    // reset typing whenever new analysis arrives
    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(true);
  }, [analysisText]);

  useEffect(() => {
    if (!analysisText) return;
    if (currentIndex < analysisText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + analysisText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, analysisText]);

  // Fallbacks if backend doesn’t send arrays
  const strengthsToShow = strengths.length
    ? strengths
    : ["Consistent serve placement", "Strong third shot drop", "Good dinking control at net", "Solid court awareness"];

  const improvementsToShow = improvements.length
    ? improvements
    : ["Weight distribution on serve", "Footwork during transitions", "Split-step timing", "Dink placement variety"];

  const quickWinsToShow = quickWins.length
    ? quickWins
    : ["Stay on toes, not flat-footed", "Forward weight shift on serve", "More cross-court dinks", "Practice split-step drills"];

  return (
    <div className="min-h-screen bg-[#FFFAF5] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className={`w-6 h-6 text-[#FF6B35] ${loading ? "animate-spin" : ""}`} />
            <h1 className="text-4xl font-bold text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              AI Analyzing Your Game
            </h1>
          </div>
          <p className="text-xl text-[#6B7280]">PALA is Watching...</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <Card className="border-2 border-[#FFB84D]/20 bg-white shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#FF6B35]" />
              <div>
                <CardTitle className="text-2xl text-[#2D3142]">Analysis Report</CardTitle>
                <CardDescription className="text-[#6B7280]">Real-time AI insights</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="min-h-[300px]">
              <p className="text-[#2D3142] leading-relaxed whitespace-pre-wrap">
                {loading && !analysisText ? "Generating analysis..." : displayedText}
                {isTyping && !!analysisText && (
                  <span className="inline-block w-2 h-5 bg-[#FF6B35] ml-1 animate-pulse" />
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[#4ECDC4]/10 to-white border-[#4ECDC4]/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4ECDC4]" />
                <CardTitle className="text-xl text-[#2D3142]">Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengthsToShow.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#4ECDC4] mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF6B35]/10 to-white border-[#FF6B35]/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#FF6B35]" />
                <CardTitle className="text-xl text-[#2D3142]">Areas to Improve</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {improvementsToShow.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#FF6B35] mt-1">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFB84D]/10 to-white border-[#FFB84D]/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FFB84D]" />
                <CardTitle className="text-xl text-[#2D3142]">Quick Wins</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {quickWinsToShow.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#FFB84D] mt-1">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {!loading && !isTyping && (
          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-10 group"
              onClick={() => router.push(`/footage/${id}`)}
            >
              Watch Video Breakdown with Voice Coaching
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
