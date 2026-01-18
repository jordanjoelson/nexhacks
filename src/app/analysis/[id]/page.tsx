"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Target, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const fullAnalysisText = `Based on my analysis of your pickleball game, I've identified several key areas for improvement and some notable strengths.

Your serve mechanics show good fundamentals, with consistent ball toss placement and follow-through. However, I noticed your weight distribution could be more forward, which would generate additional power and reduce strain on your shoulder.

Your third shot drops are executed well with soft hands and good net clearance. This is a significant strength in your game. I observed approximately 75% accuracy on these shots, which is above average for intermediate players.

Footwork patterns reveal an opportunity for growth. You're occasionally caught flat-footed during transition from baseline to kitchen line. Working on split-step timing and staying on your toes will dramatically improve your court coverage and reaction time.

Your dinking consistency is solid, maintaining good control at the net. However, varying your dink placement—targeting your opponent's backhand and utilizing cross-court angles more frequently—would create additional offensive opportunities.

Overall, your game demonstrates strong fundamentals with clear pathways for advancement. Focus on the footwork drills I'll show you in the video breakdown, and you'll see immediate improvements in your court positioning and shot preparation.`;

  // Typing effect
  useEffect(() => {
    if (currentIndex < fullAnalysisText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullAnalysisText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, fullAnalysisText]);

  const strengths = [
    "Consistent serve placement",
    "Strong third shot drop (75% accuracy)",
    "Good dinking control at net",
    "Solid court awareness",
  ];

  const improvements = [
    "Weight distribution on serve",
    "Footwork during transitions",
    "Split-step timing",
    "Dink placement variety",
  ];

  const quickWins = [
    "Stay on toes, not flat-footed",
    "Forward weight shift on serve",
    "More cross-court dinks",
    "Practice split-step drills",
  ];

  return (
    <div className="min-h-screen bg-[#FFFAF5] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Status Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#FF6B35] animate-spin" />
            <h1 className="text-4xl font-bold text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              AI Analyzing Your Game
            </h1>
          </div>
          <p className="text-xl text-[#6B7280]">PALA is Watching...</p>
        </div>

        {/* Live Typing Analysis Card */}
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
            {/* Typing Effect */}
            <div className="min-h-[300px]">
              <p className="text-[#2D3142] leading-relaxed whitespace-pre-wrap">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-5 bg-[#FF6B35] ml-1 animate-pulse" />
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights Grid */}
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
                {strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#4ECDC4] mt-1">•</span>
                    <span>{strength}</span>
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
                {improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#FF6B35] mt-1">•</span>
                    <span>{item}</span>
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
                {quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#6B7280]">
                    <span className="text-[#FFB84D] mt-1">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        {!isTyping && (
          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-10 group"
              onClick={() => router.push(`/footage/${params.id}`)}
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
