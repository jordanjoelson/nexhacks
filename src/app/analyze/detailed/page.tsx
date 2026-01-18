"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import PoseCanvas from "@/components/PoseCanvas";
import Loader from "@/components/Loader";
import { PoseDetector } from "@/lib/pose-detection";
import { FramePoseData, PlayerPose } from "@/lib/types/pose";

export default function DetailedAnalysisPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("video");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPose, setCurrentPose] = useState<PlayerPose | null>(null);
  const [poseData, setPoseData] = useState<FramePoseData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const detectionInProgressRef = useRef(false);

  // Initialize pose detector
  useEffect(() => {
    const initDetector = async () => {
      if (!detectorRef.current) {
        detectorRef.current = new PoseDetector();
        try {
          await detectorRef.current.initialize();
          console.log("Pose detector initialized successfully");
        } catch (error) {
          console.error("Failed to initialize pose detector:", error);
        }
      }
    };

    initDetector();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  // Process video frames for pose detection
  const handleProcessVideo = async () => {
    if (!videoRef.current || !detectorRef.current) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setPoseData([]);

    try {
      const fps = 30;
      const frameSkip = 5; // Process every 5th frame for performance
      let processedFrames = 0;
      const totalFrames = Math.floor((videoRef.current.duration || 0) * fps / frameSkip);

      const data = await detectorRef.current.processVideoFrames(
        videoRef.current,
        (frameData) => {
          processedFrames++;
          setProcessingProgress((processedFrames / totalFrames) * 100);
          setPoseData((prev) => [...prev, frameData]);
        },
        frameSkip
      );

      setPoseData(data);
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update current pose based on frame
  useEffect(() => {
    if (poseData.length === 0) return;

    const fps = 30;
    const frameIndex = Math.floor(currentFrame / 5); // Match frameSkip
    const frameData = poseData[frameIndex];

    if (frameData && frameData.players.length > 0) {
      setCurrentPose(frameData.players[0]);
    } else {
      setCurrentPose(null);
    }
  }, [currentFrame, poseData]);

  // Real-time pose detection on video play - detect more frequently for smoother tracking
  const handleVideoTimeUpdate = async (currentTime: number, duration: number) => {
    if (!videoRef.current || !detectorRef.current || isProcessing) return;
    
    // Check if detector is initialized
    if (!detectorRef.current.initialized) {
      return;
    }

    // Prevent multiple simultaneous detections
    if (detectionInProgressRef.current) {
      return;
    }

    // Detect pose more frequently for real-time tracking (every 0.1 seconds = 10fps detection)
    const detectionInterval = 0.1; // seconds - much more frequent
    const currentInterval = Math.floor(currentTime / detectionInterval);
    
    if (currentInterval !== lastDetectionRef.current) {
      lastDetectionRef.current = currentInterval;
      detectionInProgressRef.current = true;
      
      try {
        const pose = await detectorRef.current.detectPose(videoRef.current);
        if (pose) {
          setCurrentPose(pose);
        }
      } catch (error) {
        console.error("Pose detection error:", error);
      } finally {
        detectionInProgressRef.current = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            Detailed Analysis
          </h1>
          <p className="mt-2 text-lg text-black">
            Frame-by-frame analysis with pose detection and technique insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player with Annotations */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
            <h2 className="text-2xl font-bold text-black mb-4">
              Video with Annotations
            </h2>
            {videoUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black border border-gray-200 rounded-lg overflow-hidden">
                  <VideoPlayer
                    videoUrl={videoUrl}
                    onFrameChange={setCurrentFrame}
                    onTimeUpdate={handleVideoTimeUpdate}
                    showControls={true}
                    videoRef={videoRef}
                  />
                  {currentPose && videoRef.current && (
                    <PoseCanvas
                      videoElement={videoRef.current}
                      pose={currentPose}
                    />
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleProcessVideo}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-black to-gray-800 hover:from-green-500 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg border border-gray-200 hover:border-green-500 transition-all"
                  >
                    {isProcessing ? "Processing..." : "Process Full Video"}
                  </button>
                  {poseData.length > 0 && (
                    <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white border border-gray-200 rounded-lg text-sm font-bold">
                      {poseData.length} frames processed
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Loader />
                      <div className="flex-1">
                        <div className="w-full bg-white border border-gray-200 rounded-lg h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-black mt-2">
                          Processing video frames... {processingProgress.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                  <p className="text-sm text-black">
                    Frame: {currentFrame} | {currentPose ? "Pose detected" : "No pose detected"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white border border-gray-200 rounded-lg flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                <p className="text-black">No video available</p>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
              <h2 className="text-2xl font-bold text-black mb-4">
                Technique Analysis
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                  <p className="font-bold text-black">
                    Frame {currentFrame}
                  </p>
                  <p className="text-sm text-black mt-2">
                    Pose detection and technique analysis will appear here as you scrub through the video.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
              <h2 className="text-2xl font-bold text-black mb-4">
                Key Insights
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                  <p className="text-sm text-black">
                    <strong>Stance:</strong> Good balance detected
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 border border-gray-200 rounded-lg">
                  <p className="text-sm text-white">
                    <strong>Reach:</strong> Full extension on forehand
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                  <p className="text-sm text-black">
                    <strong>Footwork:</strong> Could improve lateral movement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
