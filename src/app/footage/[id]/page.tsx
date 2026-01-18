"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FootagePage() {
  const router = useRouter();
  const params = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const keyMoments = [
    {
      timestamp: 5.2,
      type: "strength",
      title: "Great Third Shot Drop",
      description: "Perfect soft landing just over the net. Excellent touch!",
    },
    {
      timestamp: 12.8,
      type: "improvement",
      title: "Footwork Position",
      description: "Try staying on your toes here. Notice the flat-footed stance?",
    },
    {
      timestamp: 23.5,
      type: "tip",
      title: "Court Positioning",
      description: "Moving to kitchen line earlier would give better control",
    },
    {
      timestamp: 34.2,
      type: "strength",
      title: "Excellent Serve Placement",
      description: "Deep serve to backhand corner. Puts opponent on defense.",
    },
    {
      timestamp: 45.7,
      type: "improvement",
      title: "Weight Distribution",
      description: "Shift weight forward on serve for more power and spin",
    },
  ];

  const annotations = [
    { x: "45%", y: "30%", startTime: 5, endTime: 7, text: "Perfect drop!" },
    { x: "60%", y: "50%", startTime: 12, endTime: 14, text: "Stay on toes" },
    { x: "40%", y: "40%", startTime: 23, endTime: 25, text: "Move up" },
  ];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress(
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF5] to-[#FFF5EB] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-[#FF6B35]/10 text-[#6B7280] hover:text-[#2D3142]"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Analysis
          </Button>
          <h1 className="text-4xl font-bold mb-2 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            Video Breakdown
          </h1>
          <p className="text-[#6B7280]">
            Watch your footage with PALA's voice coaching
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="relative overflow-visible border-2 border-[#FF6B35]/20 shadow-xl bg-white">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  onTimeUpdate={handleTimeUpdate}
                />

                <div className="absolute inset-0 pointer-events-none">
                  {annotations.map((annotation, i) => (
                    <div
                      key={i}
                      className="absolute bg-[#FF6B35]/90 text-white px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        top: annotation.y,
                        left: annotation.x,
                        display:
                          currentTime >= annotation.startTime &&
                          currentTime <= annotation.endTime
                            ? "block"
                            : "none",
                      }}
                    >
                      {annotation.text}
                    </div>
                  ))}
                </div>

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Button
                      size="lg"
                      className="rounded-full w-20 h-20 bg-[#FF6B35] hover:bg-[#E85A2A]"
                      onClick={togglePlay}
                    >
                      <Play className="w-10 h-10 ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#FFF5EB]/50 border-t border-[#FF6B35]/10">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={togglePlay}>
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <div className="flex-1 relative h-2 bg-[#E5E7EB] rounded-full cursor-pointer group">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B35] to-[#4ECDC4] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FF6B35] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: `${progress}%`,
                        marginLeft: "-8px",
                      }}
                    />
                  </div>

                  <span className="text-sm font-medium tabular-nums min-w-[80px] text-[#2D3142]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <Button variant="ghost" size="sm" onClick={toggleMute}>
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={restartVideo}>
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="mt-4 p-4 border-l-4 border-l-[#4ECDC4] bg-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4ECDC4] animate-pulse" />
                <div>
                  <p className="font-semibold text-sm text-[#2D3142]">
                    Voice Coaching Active
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    PALA is narrating your analysis with ElevenLabs
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 border-2 border-[#FF6B35]/20 bg-white sticky top-8">
              <h3 className="text-xl font-bold mb-4 text-[#2D3142]">Key Moments</h3>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {keyMoments.map((moment, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                      currentTime >= moment.timestamp - 1 &&
                        currentTime <= moment.timestamp + 1
                        ? "border-[#FF6B35] bg-[#FF6B35]/5"
                        : "border-[#E5E7EB] hover:border-[#FF6B35]/50"
                    )}
                    onClick={() => seekToTime(moment.timestamp)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#6B7280]">
                        {formatTime(moment.timestamp)}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs",
                          moment.type === "strength"
                            ? "bg-[#4ECDC4]/20 text-[#2D3142] border-[#4ECDC4]/30"
                            : moment.type === "improvement"
                            ? "bg-[#FFB84D]/20 text-[#2D3142] border-[#FFB84D]/30"
                            : "bg-[#FF6B35]/20 text-[#E85A2A] border-[#FF6B35]/30"
                        )}
                      >
                        {moment.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1 text-[#2D3142]">
                      {moment.title}
                    </p>
                    <p className="text-xs text-[#6B7280]">{moment.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
            onClick={() => router.push("/dashboard")}
          >
            View All Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}
