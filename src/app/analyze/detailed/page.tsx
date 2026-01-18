"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";
import { useVideoStore } from "@/store/videoStore";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageCircle,
  Send,
  User,
  TrendingUp,
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

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  // ElevenLabs TTS state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Chat with PALA state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    if (isPlaying) {
      // Pause both video and audio
      video.pause();
      if (audio && !audio.paused) {
        audio.pause();
      }
      setIsPlaying(false);
    } else {
      // Play both video and audio
      if (audio && audioUrl) {
        // Sync audio to video time before playing
        if (video.duration > 0 && audio.duration > 0) {
          const audioTime = (video.currentTime / video.duration) * audio.duration;
          audio.currentTime = audioTime;
        }
        // Play both together
        Promise.all([
          video.play(),
          audio.play().catch((err) => {
            console.error("Error playing audio:", err);
          }),
        ]).then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Error playing video:", err);
        });
      } else {
        // Just play video if no audio
        video.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Error playing video:", err);
        });
      }
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
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    // Sync audio to video time
    if (audioRef.current && audioUrl) {
      const audioDuration = audioRef.current.duration;
      const videoDuration = videoRef.current.duration;
      if (audioDuration > 0 && videoDuration > 0) {
        const audioTime = (time / videoDuration) * audioDuration;
        audioRef.current.currentTime = audioTime;
      }
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

  // Chat with PALA function
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          analysisText: fullText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from PALA");
      }

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "I'm here to help! What would you like to know?" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, I'm having trouble right now. Please try again!";
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate TTS audio from text
  const generateTTSAudio = async (text: string) => {
    try {
      setIsGeneratingAudio(true);
      setAudioError(null);

      console.log("Generating TTS audio for text length:", text.length);

      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("TTS API error:", errorData);
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const audioBlob = await response.blob();
      console.log("Audio blob received, size:", audioBlob.size);
      
      if (audioBlob.size === 0) {
        throw new Error("Received empty audio file");
      }

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      console.log("Audio URL set:", url);

      // Clean up old URL if it exists
      if (audioRef.current?.src && audioRef.current.src.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    } catch (err) {
      console.error("TTS generation error:", err);
      setAudioError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Auto-play video and audio when audio is ready
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !audioUrl || isGeneratingAudio) return;

    console.log("Setting up auto-play, audio URL:", audioUrl);

    const handleCanPlay = async () => {
      try {
        console.log("Audio can play, readyState:", audio.readyState, "duration:", audio.duration);
        
        // Sync audio to video start
        if (video.duration > 0 && audio.duration > 0) {
          audio.currentTime = 0;
        }

        // Start both video and audio
        console.log("Attempting to play video and audio...");
        const audioPromise = audio.play().catch((err) => {
          console.error("Audio play error:", err);
          throw err;
        });
        const videoPromise = video.play().catch((err) => {
          console.error("Video play error:", err);
          throw err;
        });

        await Promise.all([audioPromise, videoPromise]);
        console.log("Both video and audio started playing");
        setIsPlaying(true);
      } catch (err: any) {
        console.error("Error auto-playing:", err);
        if (err.name === "NotAllowedError") {
          console.log("Auto-play blocked by browser. User interaction required.");
          setAudioError("Click play to hear PALA's narration");
        }
      }
    };

    // Wait for audio to be ready
    if (audio.readyState >= 2) {
      // Audio is already loaded
      handleCanPlay();
    } else {
      // Wait for audio to load
      audio.addEventListener("canplay", handleCanPlay, { once: true });
      audio.addEventListener("loadeddata", handleCanPlay, { once: true });
      audio.load(); // Ensure audio starts loading
    }

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadeddata", handleCanPlay);
    };
  }, [audioUrl, isGeneratingAudio]);

  // Sync audio with video playback and handle play/pause states
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !audioUrl) return;

    const syncAudioToVideo = () => {
      if (video.duration > 0 && audio.duration > 0) {
        const audioTime = (video.currentTime / video.duration) * audio.duration;
        audio.currentTime = audioTime;
      }
    };

    const handleVideoPlay = () => {
      setIsPlaying(true);
      syncAudioToVideo();
      if (audio.paused) {
        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
        });
      }
    };

    const handleVideoPause = () => {
      setIsPlaying(false);
      if (!audio.paused) {
        audio.pause();
      }
    };

    const handleVideoSeeking = () => {
      syncAudioToVideo();
    };

    const handleVideoSeeked = () => {
      syncAudioToVideo();
    };

    // Update playing state based on video state
    const handleVideoPlaying = () => setIsPlaying(true);

    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoPause);
    video.addEventListener("playing", handleVideoPlaying);
    video.addEventListener("seeking", handleVideoSeeking);
    video.addEventListener("seeked", handleVideoSeeked);

    return () => {
      video.removeEventListener("play", handleVideoPlay);
      video.removeEventListener("pause", handleVideoPause);
      video.removeEventListener("playing", handleVideoPlaying);
      video.removeEventListener("seeking", handleVideoSeeking);
      video.removeEventListener("seeked", handleVideoSeeked);
    };
  }, [audioUrl]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Overshoot analysis
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

          // Generate TTS audio from the analysis text
          if (text && text.trim()) {
            console.log("Analysis complete, generating TTS for text length:", text.length);
            // Use first 5000 characters to avoid API limits
            const textForTTS = text.trim().substring(0, 5000);
            generateTTSAudio(textForTTS);
          } else {
            console.warn("No text available for TTS generation");
          }
        }, 20000);
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

  // Create preview URL from file
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Set video duration when metadata loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
        }
      });
    }
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF5] to-[#FFF5EB] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 hover:bg-[#FF6B35]/10 text-[#6B7280] hover:text-[#2D3142] text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Analysis
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            Detailed Breakdown
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280]">
            {phase === "analyzing"
              ? "PALA is preparing your detailed breakdown"
              : "Watch your footage with PALA's voice coaching"}
          </p>
        </div>

        {/* Processing state - only show if no video URL */}
        {phase === "analyzing" && !previewUrl && (
          <Card className="border-2 border-[#FF6B35]/20 bg-white shadow-xl">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 text-[#FF6B35] animate-spin mx-auto" />
                  <div>
                    <p className="text-2xl font-bold text-[#2D3142] mb-2">Processing...</p>
                    <p className="text-[#6B7280]">PALA is analyzing your video</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
              )}

        {/* Error state */}
              {error && (
          <Card className="border-2 border-[#FF6B35]/20 bg-white shadow-xl">
            <CardContent className="p-12">
                <div className="w-full p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-[#FF6B35] mt-0.5" />
                    <div>
                      <p className="font-bold text-[#2D3142]">Something went wrong</p>
                      <p className="text-sm text-[#6B7280]">{error}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video player - always show when previewUrl exists */}
        {previewUrl ? (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Video Player (2/3 width) */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-2 border-[#FF6B35]/20 shadow-xl bg-white">
                {/* Video Container */}
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    src={previewUrl}
                    onTimeUpdate={handleTimeUpdate}
                  />

                  {/* Overlay Annotations */}
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

                  {/* Play Button Overlay */}
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

                {/* Video Controls */}
                <div className="p-4 bg-[#FFF5EB]/50 border-t border-[#FF6B35]/10">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>

                    {/* Progress Bar */}
                    <div className="flex-1 relative h-2 bg-[#E5E7EB] rounded-full cursor-pointer group">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B35] to-[#4ECDC4] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FF6B35] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${progress}%`, marginLeft: "-8px" }}
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

              {/* ElevenLabs Voice Status */}
              <Card className="mt-4 p-4 border-l-4 border-l-[#4ECDC4] bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="w-4 h-4 text-[#4ECDC4] animate-spin" />
                        <div>
                          <p className="font-semibold text-sm text-[#2D3142]">
                            Generating Voice Coaching...
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            PALA is preparing your narration
                          </p>
                        </div>
                      </>
                    ) : audioError ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#FF6B35]" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#2D3142]">
                            Voice Coaching Unavailable
                          </p>
                          <p className="text-xs text-[#6B7280]">{audioError}</p>
                        </div>
                      </>
                    ) : audioUrl ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-[#4ECDC4] animate-pulse" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#2D3142]">
                            Voice Coaching Active
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {isPlaying ? "PALA is narrating..." : "Click play to hear PALA's narration"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <div>
                          <p className="font-semibold text-sm text-[#2D3142]">
                            Voice Coaching Ready
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Audio will play with video
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {audioUrl && !isPlaying && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const audio = audioRef.current;
                        const video = videoRef.current;
                        if (audio && video) {
                          if (video.duration > 0 && audio.duration > 0) {
                            audio.currentTime = (video.currentTime / video.duration) * audio.duration;
                          }
                          audio.play().catch((err) => {
                            console.error("Manual play error:", err);
                            setAudioError("Could not play audio. Check browser permissions.");
                          });
                          video.play().catch(() => {});
                        }
                      }}
                      className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/80"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play Audio
                    </Button>
                  )}
                </div>
              </Card>

              {/* Hidden audio element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  preload="auto"
                  onLoadedData={() => {
                    console.log("Audio loaded, duration:", audioRef.current?.duration);
                  }}
                  onCanPlay={() => {
                    console.log("Audio can play");
                  }}
                  onPlay={() => {
                    console.log("Audio started playing");
                  }}
                  onError={(e) => {
                    console.error("Audio playback error:", e);
                    console.error("Audio error details:", audioRef.current?.error);
                    setAudioError("Failed to play audio. Try clicking play manually.");
                  }}
                  onEnded={() => {
                    console.log("Audio playback ended");
                  }}
                />
              )}

              {/* Detailed Notes - only show when analysis is ready */}
              {phase === "ready" && fullText && (
                <Card className="mt-4 p-6 border-2 border-[#FF6B35]/20 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                    <p className="font-bold text-[#2D3142]">Detailed Analysis Notes</p>
                  </div>
                  <div className="p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20 prose prose-sm max-w-none text-[#2D3142] leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold text-[#2D3142] mb-4 mt-6 first:mt-0" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-bold text-[#2D3142] mb-3 mt-5 first:mt-0" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-bold text-[#2D3142] mb-2 mt-4 first:mt-0" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="text-[#2D3142] mb-3 leading-relaxed" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-[#FF6B35]" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-[#2D3142]" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside mb-3 space-y-1 text-[#2D3142]" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside mb-3 space-y-1 text-[#2D3142]" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4 text-[#2D3142]" {...props} />
                        ),
                        code: ({ node, ...props }) => (
                          <code className="bg-[#FFF5EB] px-1.5 py-0.5 rounded text-sm font-mono text-[#FF6B35]" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-[#FF6B35] pl-4 italic text-[#6B7280] my-3" {...props} />
                        ),
                      }}
                    >
                      {fullText}
                    </ReactMarkdown>
                  </div>
                </Card>
              )}

              {/* Show analyzing message when video is shown but analysis is still processing */}
              {phase === "analyzing" && previewUrl && (
                <Card className="mt-4 p-6 border-2 border-[#FF6B35]/20 bg-white">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#FF6B35] animate-spin" />
                    <div>
                      <p className="font-semibold text-sm text-[#2D3142]">
                        Analysis in Progress
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        PALA is analyzing your video. Detailed breakdown will appear here when ready.
                      </p>
                    </div>
                </div>
                </Card>
              )}
            </div>

            {/* Timestamp Notes Sidebar (1/3 width) */}
            <div className="lg:col-span-1 space-y-4 mt-6 lg:mt-0">
              {/* Chat with PALA */}
              <Card className="border-2 border-[#4ECDC4]/20 bg-white flex flex-col sticky top-4 z-10">
                <div
                  className="p-3 sm:p-4 cursor-pointer hover:bg-[#FFF5EB]/50 transition-colors"
                  onClick={() => setShowChat(!showChat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#4ECDC4]" />
                      <h3 className="text-base sm:text-lg font-bold text-[#2D3142]">Chat with PALA</h3>
                    </div>
                    <Badge className="bg-[#4ECDC4]/10 text-[#4ECDC4] border-[#4ECDC4]/20 text-xs hidden sm:inline-flex">
                      Ask anything!
                    </Badge>
                  </div>
                </div>

                {showChat && (
                  <div className="border-t border-[#E5E7EB] flex-1 flex flex-col min-h-0">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFAF5] min-h-[200px] max-h-[300px] lg:max-h-[400px]">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-sm text-[#6B7280] py-4">
                          <img 
                            src="/pala.png" 
                            alt="PALA" 
                            className="w-12 h-12 mx-auto mb-2 object-contain"
                            onError={(e) => {
                              // Fallback to icon if image doesn't exist
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <p>Ask me anything about your performance!</p>
                          <p className="text-xs mt-1">Try: "How can I improve my serve?"</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex gap-2",
                              msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            {msg.role === "assistant" && (
                              <div className="w-6 h-6 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                <img 
                                  src="/pala.png" 
                                  alt="PALA" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // Fallback to icon if image doesn't exist
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<svg class="w-4 h-4 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>';
                                    }
                                  }}
                                />
                              </div>
                            )}
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                                msg.role === "user"
                                  ? "bg-[#FF6B35] text-white"
                                  : "bg-white border border-[#E5E7EB] text-[#2D3142]"
                              )}
                            >
                              {msg.content}
                            </div>
                            {msg.role === "user" && (
                              <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-[#FF6B35]" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center overflow-hidden">
                            <img 
                              src="/pala.png" 
                              alt="PALA" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback to icon if image doesn't exist
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<svg class="w-4 h-4 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>';
                                }
                              }}
                            />
                          </div>
                          <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
                            <Loader2 className="w-4 h-4 text-[#4ECDC4] animate-spin" />
                </div>
              </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleChatSubmit} className="p-3 border-t border-[#E5E7EB]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about your performance..."
                          className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                          disabled={isChatLoading || !fullText}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/80"
                          disabled={isChatLoading || !fullText || !chatInput.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      {!fullText && (
                        <p className="text-xs text-[#6B7280] mt-2 text-center">
                          Analysis needed to chat with PALA
                        </p>
                      )}
                    </form>
                  </div>
                )}
          </Card>

              {/* Key Moments */}
              <Card className="p-4 sm:p-6 border-2 border-[#FF6B35]/20 bg-white lg:sticky lg:top-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#2D3142]">Key Moments</h3>

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
                        <Badge
                          variant="outline"
                          className="text-xs border-[#E5E7EB] text-[#6B7280]"
                        >
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
        ) : (
          /* Video URL not found - show helpful message */
          <Card className="border-2 border-[#FF6B35]/20 bg-white shadow-xl">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-[#FF6B35] mx-auto" />
                <div>
                  <p className="text-[#2D3142] font-bold text-lg">Video Not Found</p>
                  <p className="text-[#6B7280] text-sm mt-2">
                    Please upload a video to get started.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/upload")}
                  className="mt-4"
                >
                  Go Back to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shot Consistency Graph */}
        {phase === "ready" && (
          <Card className="mt-8 sm:mt-12 border-2 border-[#FF6B35]/20 bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Shot Consistency
                </h3>
                <p className="text-sm sm:text-base text-[#6B7280]">
                  Your performance consistency across different shot types
                </p>
              </div>

              <div className="space-y-6">
                {/* Serve Consistency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D3142]">Serve</span>
                    <span className="text-sm text-[#6B7280]">82%</span>
                  </div>
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "82%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB84D] rounded-full"
                    />
                  </div>
                </div>

                {/* Return Consistency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D3142]">Return</span>
                    <span className="text-sm text-[#6B7280]">75%</span>
                  </div>
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#2D9A94] rounded-full"
                    />
                  </div>
                </div>

                {/* Dink Consistency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D3142]">Dink</span>
                    <span className="text-sm text-[#6B7280]">88%</span>
                  </div>
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "88%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-[#FFB84D] to-[#FFA726] rounded-full"
                    />
                  </div>
                </div>

                {/* Volley Consistency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D3142]">Volley</span>
                    <span className="text-sm text-[#6B7280]">70%</span>
                  </div>
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] rounded-full"
                    />
                  </div>
                </div>

                {/* Drive Consistency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D3142]">Drive</span>
                    <span className="text-sm text-[#6B7280]">79%</span>
                  </div>
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "79%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#FF6B35] rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <TrendingUp className="w-4 h-4 text-[#4ECDC4]" />
                  <span>Overall Consistency: <span className="font-semibold text-[#2D3142]">79%</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        {phase === "ready" && (
          <div className="mt-8 sm:mt-12 text-center pb-20 lg:pb-0">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
              onClick={() => router.push("/dashboard")}
            >
              View All Sessions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
        )}
      </div>
    </div>
  );
}
