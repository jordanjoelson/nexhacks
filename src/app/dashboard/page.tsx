"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
  Trophy,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const sessions = [
    {
      id: "demo-123",
      date: "Jan 18, 2026",
      title: "Tournament Practice Session",
      duration: "12:34",
      improvements: ["Footwork", "Serve placement"],
      score: 82,
      emoji: "🏆",
    },
    {
      id: "demo-122",
      date: "Jan 15, 2026",
      title: "Doubles Match Analysis",
      duration: "18:22",
      improvements: ["Court positioning", "Dinking"],
      score: 78,
      emoji: "🎯",
    },
    {
      id: "demo-121",
      date: "Jan 12, 2026",
      title: "Solo Drill Practice",
      duration: "8:15",
      improvements: ["Third shot drop", "Volleys"],
      score: 75,
      emoji: "⚡",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF5] to-[#FFF5EB] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-bold text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
                Your Coaching Sessions
              </h1>
              <Sparkles className="w-8 h-8 text-[#FF6B35] animate-pulse" />
            </div>
            <p className="text-xl text-[#6B7280]">
              Review your progress and past analyses 🏓
            </p>
          </div>
          <Button
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E85A2A] shadow-lg hover:shadow-xl transition-all"
            onClick={() => router.push("/upload")}
          >
            <Plus className="mr-2" />
            New Session
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-2 border-[#FF6B35]/20 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#6B7280]">Total Sessions</h3>
              <PlayCircle className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <p className="text-4xl font-bold text-[#FF6B35]">12</p>
            <p className="text-sm text-[#6B7280] mt-2">+3 this week</p>
          </Card>

          <Card className="p-6 border-2 border-[#4ECDC4]/20 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#6B7280]">Avg Performance</h3>
              <TrendingUp className="w-5 h-5 text-[#4ECDC4]" />
            </div>
            <p className="text-4xl font-bold text-[#4ECDC4]">79%</p>
            <p className="text-sm text-[#6B7280] mt-2">+5% improvement</p>
          </Card>

          <Card className="p-6 border-2 border-[#FFB84D]/20 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#6B7280]">Practice Time</h3>
              <Calendar className="w-5 h-5 text-[#FFB84D]" />
            </div>
            <p className="text-4xl font-bold text-[#FFB84D]">24h</p>
            <p className="text-sm text-[#6B7280] mt-2">This month</p>
          </Card>
        </div>

        <Card className="p-8 border-2 border-[#FF6B35]/20 mb-12 bg-white shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-[#FF6B35]" />
            <h2 className="text-2xl font-bold text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              Your Progress Journey
            </h2>
          </div>

          <div className="relative">
            {/* Animated flow line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF6B35] via-[#4ECDC4] to-[#FFB84D] animate-pulse" />
            
            {/* Flow line dots */}
            {sessions.map((_, i) => (
              <div
                key={`dot-${i}`}
                className="absolute left-6 w-4 h-4 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#4ECDC4] border-2 border-[#FFFAF5] shadow-lg"
                style={{
                  top: `${(i / (sessions.length - 1)) * 100}%`,
                  transform: "translateY(-50%)",
                }}
              />
            ))}

            <div className="space-y-8">
              {sessions.map((session, i) => (
                <div
                  key={session.id}
                  className="relative pl-20 group"
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  {/* Animated number badge */}
                  <div
                    className={`absolute left-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] border-4 border-[#FFFAF5] flex items-center justify-center shadow-lg transition-all ${
                      hoveredSession === session.id ? "scale-110 rotate-12" : ""
                    }`}
                  >
                    <span className="text-sm font-bold text-white">{i + 1}</span>
                  </div>

                  {/* Connection line animation */}
                  {i < sessions.length - 1 && (
                    <div
                      className={`absolute left-8 w-0.5 bg-gradient-to-b from-[#FF6B35] to-[#4ECDC4] transition-all ${
                        hoveredSession === session.id ? "w-1" : ""
                      }`}
                      style={{
                        top: "100%",
                        height: "2rem",
                      }}
                    />
                  )}

                  <Card
                    className={`p-6 transition-all cursor-pointer border-2 bg-white ${
                      hoveredSession === session.id
                        ? "border-[#FF6B35] shadow-2xl scale-[1.02] bg-gradient-to-br from-white to-[#FFF5EB]"
                        : "border-[#E5E7EB] hover:border-[#FF6B35]/50 hover:shadow-lg"
                    }`}
                    onClick={() => router.push(`/footage/${session.id}`)}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{session.emoji}</span>
                          <h3 className="text-xl font-bold text-[#2D3142]">{session.title}</h3>
                          <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 shadow-sm">
                            Score: {session.score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-3">
                          {session.date} • {session.duration}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {session.improvements.map((improvement, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-xs border-[#E5E7EB] text-[#6B7280] transition-all ${
                                hoveredSession === session.id
                                  ? "border-[#FF6B35]/50 bg-[#FF6B35]/5"
                                  : ""
                              }`}
                            >
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div
                          className={`w-32 h-24 rounded-lg bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20 flex items-center justify-center transition-all ${
                            hoveredSession === session.id
                              ? "scale-110 rotate-3 shadow-lg"
                              : ""
                          }`}
                        >
                          <PlayCircle
                            className={`w-12 h-12 text-[#FF6B35] transition-all ${
                              hoveredSession === session.id ? "scale-125" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group text-[#6B7280] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10"
                      >
                        Review Analysis
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-[#4ECDC4]" />
            <h2 className="text-2xl font-bold text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              All Sessions
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-[#E5E7EB] hover:border-[#FF6B35]/50 group bg-white hover:scale-[1.02]"
                onClick={() => router.push(`/footage/${session.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 to-[#4ECDC4]/10 group-hover:from-[#FF6B35]/20 group-hover:to-[#4ECDC4]/20 transition-all" />
                  <span className="text-4xl z-10 group-hover:scale-125 transition-transform">
                    {session.emoji}
                  </span>
                  <PlayCircle className="w-16 h-16 text-[#FF6B35]/50 group-hover:scale-125 group-hover:text-[#FF6B35]/70 transition-all absolute" />
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                      {session.duration}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 text-[#2D3142] group-hover:text-[#FF6B35] transition-colors">
                      {session.title}
                    </h3>
                    <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 group-hover:bg-[#FF6B35]/20 transition-colors">
                      {session.score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-[#6B7280] mb-3">{session.date}</p>
                  <div className="flex flex-wrap gap-2">
                    {session.improvements.map((improvement, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs border-[#E5E7EB] text-[#6B7280] group-hover:border-[#FF6B35]/30 transition-colors"
                      >
                        {improvement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
