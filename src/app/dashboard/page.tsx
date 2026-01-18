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
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const sessions = [
    {
      id: "demo-123",
      date: "Jan 18, 2026",
      title: "Tournament Practice Session",
      duration: "12:34",
      thumbnail: "/thumbnails/session1.jpg",
      improvements: ["Footwork", "Serve placement"],
      score: 82,
    },
    {
      id: "demo-122",
      date: "Jan 15, 2026",
      title: "Doubles Match Analysis",
      duration: "18:22",
      thumbnail: "/thumbnails/session2.jpg",
      improvements: ["Court positioning", "Dinking"],
      score: 78,
    },
    {
      id: "demo-121",
      date: "Jan 12, 2026",
      title: "Solo Drill Practice",
      duration: "8:15",
      thumbnail: "/thumbnails/session3.jpg",
      improvements: ["Third shot drop", "Volleys"],
      score: 75,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF5] to-[#FFF5EB] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
              Your Coaching Sessions
            </h1>
            <p className="text-xl text-[#6B7280]">
              Review your progress and past analyses
            </p>
          </div>
          <Button
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E85A2A]"
            onClick={() => router.push("/upload")}
          >
            <Plus className="mr-2" />
            New Session
          </Button>
        </div>

        {/* Stats Overview */}
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

        {/* Progress Flow Map */}
        <Card className="p-8 border-2 border-[#FF6B35]/20 mb-12 bg-white">
          <h2 className="text-2xl font-bold mb-6 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            Your Progress Journey
          </h2>

          {/* Visual flow timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF6B35] via-[#4ECDC4] to-[#FFB84D]" />

            <div className="space-y-8">
              {sessions.map((session, i) => (
                <div key={session.id} className="relative pl-20">
                  <div className="absolute left-4 w-8 h-8 rounded-full bg-[#FF6B35] border-4 border-[#FFFAF5] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{i + 1}</span>
                  </div>

                  <Card
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-[#E5E7EB] hover:border-[#FF6B35]/50 bg-white"
                    onClick={() => router.push(`/footage/${session.id}`)}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[#2D3142]">{session.title}</h3>
                          <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20">
                            Score: {session.score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-3">
                          {session.date} • {session.duration}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {session.improvements.map((improvement, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-[#E5E7EB] text-[#6B7280]">
                              {improvement}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20 flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-[#FF6B35]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                      <Button variant="ghost" size="sm" className="group text-[#6B7280] hover:text-[#2D3142]">
                        Review Analysis
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Sessions Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            All Sessions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all border-2 border-[#E5E7EB] hover:border-[#FF6B35]/50 group bg-white"
                onClick={() => router.push(`/footage/${session.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20 flex items-center justify-center relative overflow-hidden">
                  <PlayCircle className="w-16 h-16 text-[#FF6B35]/50 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/50 text-white border-0">
                      {session.duration}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 text-[#2D3142]">
                      {session.title}
                    </h3>
                    <Badge className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20">
                      {session.score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-[#6B7280] mb-3">{session.date}</p>
                  <div className="flex flex-wrap gap-2">
                    {session.improvements.map((improvement, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-[#E5E7EB] text-[#6B7280]">
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
