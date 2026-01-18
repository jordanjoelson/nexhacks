"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";

interface VideoMoment {
  timestamp: number;
  description: string;
  type: "strength" | "improvement" | "key_moment";
}

// Parse moments from Overshoot analysis with timestamps
function parseMomentsFromText(text: string, videoDuration: number): VideoMoment[] {
  const moments: VideoMoment[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for explicit timestamps in format like "at 0:15", "15 seconds", "1:30", etc.
  const timePattern = /(?:at\s+)?(\d+):(\d+)|(?:at\s+)?(\d+)\s*(?:second|sec|minute|min)/gi;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    // Try to extract timestamp
    let timestamp: number | null = null;
    const timeMatch = line.match(timePattern);
    
    if (timeMatch) {
      // Parse MM:SS or seconds
      const fullMatch = timeMatch[0];
      if (fullMatch.includes(':')) {
        const parts = fullMatch.match(/(\d+):(\d+)/);
        if (parts) {
          timestamp = parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
      } else {
        const secMatch = fullMatch.match(/(\d+)/);
        if (secMatch) {
          timestamp = parseInt(secMatch[1]);
        }
      }
    }
    
    // Determine type based on keywords
    let type: "strength" | "improvement" | "key_moment" = "key_moment";
    if (lineLower.includes('good') || lineLower.includes('excellent') || lineLower.includes('strong') || lineLower.includes('well')) {
      type = "strength";
    } else if (lineLower.includes('improve') || lineLower.includes('needs') || lineLower.includes('should') || lineLower.includes('weak')) {
      type = "improvement";
    }
    
    // If we found a relevant observation
    if (line.length > 20 && (timestamp !== null || type !== "key_moment")) {
      moments.push({
        timestamp: timestamp !== null ? timestamp : Math.min(videoDuration - 10, 15 + (moments.length * 20)),
        description: line.trim().substring(0, 150),
        type
      });
    }
  }
  
  // If we didn't find enough moments, create them from sentences
  if (moments.length < 5) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const step = Math.max(10, Math.floor((videoDuration - 20) / Math.min(8, sentences.length)));
    
    for (let i = 0; i < Math.min(8, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const type: "strength" | "improvement" | "key_moment" = 
        sentence.toLowerCase().includes('good') || sentence.toLowerCase().includes('excellent') ? "strength" :
        sentence.toLowerCase().includes('improve') || sentence.toLowerCase().includes('needs') ? "improvement" :
        "key_moment";
      
      moments.push({
        timestamp: 10 + (i * step),
        description: sentence,
        type
      });
    }
  }
  
  // Sort by timestamp and limit to 6-8 moments
  return moments.sort((a, b) => a.timestamp - b.timestamp).slice(0, 8);
}

export default function DetailedAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get("video");
  
  const [moments, setMoments] = useState<VideoMoment[]>([]);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(-1);
  const [isLoadingMoments, setIsLoadingMoments] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(120); // Default 2 min
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visionRef = useRef<RealtimeVision | null>(null);
  const resultsRef = useRef<StreamInferenceResult[]>([]);

  // Get video duration when loaded
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Get full analysis from Overshoot then generate moments
  useEffect(() => {
    if (!videoUrl) return;

    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";

    if (!apiKey) {
      setIsLoadingMoments(false);
      return;
    }

    const initAnalysis = async () => {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const videoFile = new File([blob], "video.mp4", { type: blob.type || "video/mp4" });

        const vision = new RealtimeVision({
          apiUrl: apiUrl,
          apiKey: apiKey,
          prompt: "Analyze this pickleball video chronologically. For each significant moment, note the approximate timestamp and describe: what happened, whether it's a strength or area for improvement, and specific observations. Mention timestamps when possible (e.g., 'at 0:15', 'around 45 seconds').",
          source: { type: 'video', file: videoFile },
          onResult: (result: StreamInferenceResult) => {
            if (result.result && result.ok) {
              resultsRef.current.push(result);
            }
          },
          onError: (err) => {
            console.error("Overshoot error:", err);
          },
        });

        visionRef.current = vision;
        await vision.start();

        // Collect results for 15 seconds then generate moments
        setTimeout(() => {
          vision.stop();
          
          const fullAnalysis = resultsRef.current
            .map((r) => r.result)
            .filter((r) => r && r.trim())
            .join(" ");

          const generatedMoments = parseMomentsFromText(fullAnalysis, videoDuration);
          setMoments(generatedMoments);
          setIsLoadingMoments(false);
        }, 15000);
      } catch (error) {
        console.error("Error in detailed analysis:", error);
        setIsLoadingMoments(false);
      }
    };

    initAnalysis();

    return () => {
      if (visionRef.current) {
        visionRef.current.stop();
      }
    };
  }, [videoUrl, videoDuration]);

  // Auto-play through moments
  const startWalkthrough = () => {
    if (moments.length === 0) return;
    setCurrentMomentIndex(0);
    setIsPlaying(true);
    playMomentClip(0);
  };

  const playMomentClip = (index: number) => {
    if (!videoRef.current || !moments[index]) return;
    
    const moment = moments[index];
    videoRef.current.currentTime = moment.timestamp;
    videoRef.current.play();
    
    // Play 10-second clip then pause
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 10000);
  };

  const replayCurrentClip = () => {
    if (currentMomentIndex >= 0) {
      playMomentClip(currentMomentIndex);
    }
  };

  const nextMoment = () => {
    if (currentMomentIndex < moments.length - 1) {
      const newIndex = currentMomentIndex + 1;
      setCurrentMomentIndex(newIndex);
      playMomentClip(newIndex);
    } else {
      setIsPlaying(false);
      setCurrentMomentIndex(-1);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  const prevMoment = () => {
    if (currentMomentIndex > 0) {
      const newIndex = currentMomentIndex - 1;
      setCurrentMomentIndex(newIndex);
      playMomentClip(newIndex);
    }
  };

  const seekToMoment = (index: number) => {
    setCurrentMomentIndex(index);
    setIsPlaying(true);
    playMomentClip(index);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMoment = currentMomentIndex >= 0 ? moments[currentMomentIndex] : null;

  const getMomentIcon = (type: string) => {
    switch (type) {
      case "strength":
        return "💪";
      case "improvement":
        return "📈";
      case "key_moment":
        return "⭐";
      default:
        return "📌";
    }
  };

  const getMomentColor = (type: string) => {
    switch (type) {
      case "strength":
        return "from-green-500 to-green-600";
      case "improvement":
        return "from-orange-500 to-orange-600";
      case "key_moment":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
              Detailed Analysis
            </h1>
            <p className="mt-2 text-lg text-black">
              {isPlaying ? "Walking through your video..." : "AI-guided video walkthrough"}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-black font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Video Player Section */}
        {videoUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                controls
                onLoadedMetadata={handleVideoLoaded}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingMoments && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3">
              <Loader />
              <div>
                <p className="font-bold text-black">Analyzing video moments...</p>
                <p className="text-sm text-black mt-1">
                  Pala is identifying key moments to highlight
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Moment Display */}
        {!isLoadingMoments && currentMoment && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 border border-gray-200 bg-gradient-to-br ${getMomentColor(currentMoment.type)} rounded-lg flex items-center justify-center text-2xl`}>
                {getMomentIcon(currentMoment.type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Moment {currentMomentIndex + 1} of {moments.length}
                </h2>
                <p className="text-sm text-black">
                  {currentMoment.type === "strength" ? "Strength" : 
                   currentMoment.type === "improvement" ? "Area for Improvement" : "Key Moment"} • {formatTime(currentMoment.timestamp)}
                </p>
              </div>
            </div>

            <p className="text-lg text-black mb-6">{currentMoment.description}</p>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-black">
                <span className="font-semibold">🎥 Clip:</span> Playing 10-second segment starting at {formatTime(currentMoment.timestamp)}
              </p>
            </div>

            {/* 
              VOICE COMMENTARY SECTION - TO BE IMPLEMENTED WITH ELEVENLABS
              
              When ready to add voice:
              1. Import ElevenLabs SDK
              2. Generate audio from currentMoment.description
              3. Play audio automatically when moment changes
              4. Add audio controls (play/pause/skip)
              
              Example placeholder:
              <div className="mb-6">
                <audio 
                  src={generatedAudioUrl} 
                  autoPlay 
                  onEnded={nextMoment}
                />
                <div className="flex items-center gap-2">
                  <button>🔊 Replay Audio</button>
                  <button>⏭️ Skip</button>
                </div>
              </div>
            */}

            <div className="flex gap-3">
              <button
                onClick={replayCurrentClip}
                className="px-6 py-3 border border-gray-200 text-black font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                🔄 Replay Clip
              </button>
              <button
                onClick={prevMoment}
                disabled={currentMomentIndex === 0}
                className="px-6 py-3 border border-gray-200 text-black font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={nextMoment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                {currentMomentIndex === moments.length - 1 ? "Finish ✓" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* Start Walkthrough Button */}
        {!isLoadingMoments && !isPlaying && moments.length > 0 && currentMomentIndex === -1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-black mb-4">
              Ready for Guided Walkthrough
            </h2>
            <p className="text-black mb-6">
              Pala has identified {moments.length} key moments in your video. Each moment will play as a 10-second clip. Click below to start.
            </p>
            <button
              onClick={startWalkthrough}
              className="px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-lg hover:from-green-500 hover:to-green-600 transition-all"
            >
              🎯 Start Walkthrough
            </button>
          </div>
        )}

        {/* Moments Overview */}
        {!isLoadingMoments && moments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-black mb-6">All Moments</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {moments.map((moment, index) => (
                <button
                  key={index}
                  onClick={() => seekToMoment(index)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    currentMomentIndex === index
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getMomentIcon(moment.type)}</span>
                    <div className="flex-1">
                      <p className="font-bold text-black">
                        Moment {index + 1} • {formatTime(moment.timestamp)}
                      </p>
                      <p className="text-sm text-black mt-1">{moment.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}