"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import Loader from "@/components/Loader";
import { RealtimeVision, type StreamInferenceResult } from "@overshoot/sdk";

// Simple inline typing component that always works
function SimpleTypingAnimation({ text, speed = 15, onComplete }: { text: string; speed?: number; onComplete: () => void }) {
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayText("");
    
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.substring(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div className="text-black whitespace-pre-wrap">
      {displayText}
      {indexRef.current < text.length && (
        <span className="inline-block w-0.5 h-5 bg-black ml-1 animate-pulse" />
      )}
    </div>
  );
}

interface AnalysisPoint {
  title: string;
  type: "strength" | "weakness";
  improvement?: string;
}

// Parse structured analysis from Overshoot
function parseStructuredAnalysis(text: string): { summary: string; points: AnalysisPoint[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const summary: string[] = [];
  const points: AnalysisPoint[] = [];
  
  let inStrengths = false;
  let inWeaknesses = false;
  let strengthCount = 0;
  let weaknessCount = 0;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Section headers
    if (lower.includes('strength') && lower.includes(':')) {
      inStrengths = true;
      inWeaknesses = false;
      continue;
    }
    if (lower.includes('weakness') || lower.includes('improvement') && lower.includes(':')) {
      inWeaknesses = true;
      inStrengths = false;
      continue;
    }
    
    // Parse bullet points with STRICT limits
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      const content = line.substring(1).trim();
      
      if (inStrengths && strengthCount < 3) {
        // Keep strengths concise - LIMIT TO 3
        const shortTitle = content.split('.')[0].substring(0, 80);
        points.push({ title: shortTitle, type: "strength" });
        strengthCount++;
      } else if (inWeaknesses && weaknessCount < 3) {
        // Split weakness and improvement tip by colon - LIMIT TO 3
        const parts = content.split(':');
        const title = parts[0].trim().substring(0, 80);
        const improvement = parts.length > 1 ? parts[1].trim().substring(0, 100) : "Focus on this during practice";
        points.push({ 
          title, 
          type: "weakness",
          improvement
        });
        weaknessCount++;
      }
    } else if (!inStrengths && !inWeaknesses) {
      // Regular summary content
      summary.push(line);
    }
  }
  
  // ENFORCE: Maximum 3 of each type
  const limitedPoints = [
    ...points.filter(p => p.type === "strength").slice(0, 3),
    ...points.filter(p => p.type === "weakness").slice(0, 3)
  ];
  
  return {
    summary: summary.join(' '),
    points: limitedPoints
  };
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("video");
  
  const [phase, setPhase] = useState<'analyzing' | 'typing' | 'points'>('analyzing');
  const [summaryText, setSummaryText] = useState<string>("");
  const [analysisPoints, setAnalysisPoints] = useState<AnalysisPoint[]>([]);
  const [typingKey, setTypingKey] = useState(0); // Force re-mount
  
  const visionRef = useRef<RealtimeVision | null>(null);
  const resultsRef = useRef<StreamInferenceResult[]>([]);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing animation completion
  const handleTypingComplete = () => {
    console.log("Typing complete! Transitioning to points...");
    // Small delay before transitioning to points
    setTimeout(() => {
      setPhase('points');
    }, 500);
  };

  // Handle skip animation
  const handleSkipAnimation = () => {
    console.log("Animation skipped! Transitioning to points...");
    setTimeout(() => {
      setPhase('points');
    }, 300);
  };

  // Initialize Overshoot SDK
  useEffect(() => {
    if (!videoUrl) return;

    const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || "https://api.overshoot.ai";

    if (!apiKey) {
      console.error("Missing Overshoot API key");
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

        // Collect results for 15 seconds then process
        analysisTimeoutRef.current = setTimeout(() => {
          vision.stop();
          
          const fullText = resultsRef.current
            .map(r => r.result)
            .filter(r => r && r.trim())
            .join(' ');
          
          console.log("Analysis complete. Full text:", fullText.substring(0, 200));
          
          const parsed = parseStructuredAnalysis(fullText);
          
          console.log("Parsed summary:", parsed.summary.substring(0, 100));
          console.log("Parsed points:", parsed.points);
          
          // Set summary for typing
          const finalSummary = parsed.summary || "Analysis complete. Here are the key findings from your pickleball video.";
          setSummaryText(finalSummary);
          setAnalysisPoints(parsed.points);
          setTypingKey(prev => prev + 1); // Force new key
          
          // Move to typing phase with delay to ensure state is set
          setTimeout(() => {
            console.log("Moving to typing phase...");
            setPhase('typing');
          }, 100);
        }, 15000);
        
      } catch (error) {
        console.error("Error starting analysis:", error);
      }
    };

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

  const strengthPoints = analysisPoints.filter(p => p.type === "strength");
  const weaknessPoints = analysisPoints.filter(p => p.type === "weakness");

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            Analysis Summary
          </h1>
          <p className="mt-2 text-lg text-black">
            {phase === 'analyzing' ? "Pala is analyzing your pickleball video..." : "Pala has analyzed your pickleball video"}
          </p>
        </div>

        {videoUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-black mb-4">Video Preview</h2>
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

          <div className="space-y-6">
            {/* Phase 1: Analyzing */}
            {phase === 'analyzing' && (
              <div className="flex items-center gap-3">
                <Loader />
                <div className="text-black">Analyzing your pickleball video...</div>
              </div>
            )}

            {/* Phase 2: Typing Summary */}
            {phase === 'typing' && summaryText && (
              <div key={`typing-${typingKey}`}>
                <SimpleTypingAnimation
                  text={summaryText}
                  speed={15}
                  onComplete={handleTypingComplete}
                />
              </div>
            )}

            {/* Phase 3: Strengths and Weaknesses */}
            {phase === 'points' && (
              <div className="space-y-8">
                {/* Strengths */}
                {strengthPoints.length > 0 && (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
                      <span className="text-3xl">💪</span>
                      Strengths
                    </h3>
                    <div className="space-y-4">
                      {strengthPoints.map((point, index) => (
                        <div 
                          key={`strength-${index}`}
                          className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-slideIn"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-base font-bold">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-black text-lg">{point.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {weaknessPoints.length > 0 && (
                  <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                      <span className="text-3xl">📈</span>
                      Areas for Improvement
                    </h3>
                    <div className="space-y-4">
                      {weaknessPoints.map((point, index) => (
                        <div 
                          key={`weakness-${index}`}
                          className="p-4 bg-orange-50 rounded-lg border border-orange-200 animate-slideIn"
                          style={{ animationDelay: `${(strengthPoints.length + index) * 150 + 300}ms` }}
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-base font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-black text-lg font-medium">{point.title}</p>
                              {point.improvement && (
                                <div className="mt-3 pl-4 border-l-4 border-green-500 bg-white p-3 rounded">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold text-green-600">💡 How to improve:</span> {point.improvement}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dive Deeper Button */}
                <div className="pt-6 border-t border-gray-200 animate-fadeIn" style={{ animationDelay: '1000ms' }}>
                  <Link
                    href={`/analyze/detailed?video=${encodeURIComponent(videoUrl || "")}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-lg border border-gray-200 hover:from-green-500 hover:to-green-600 hover:border-green-500 transition-all shadow-lg"
                  >
                    <span>Dive Deeper</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}