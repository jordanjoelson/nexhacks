"use client";

import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onFrameChange?: (frameNumber: number) => void;
  className?: string;
  showControls?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export default function VideoPlayer({
  videoUrl,
  onTimeUpdate,
  onFrameChange,
  className = "",
  showControls = true,
  videoRef: externalVideoRef,
}: VideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent abort errors by handling loadstart
    const handleLoadStart = () => {
      // Video is starting to load
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time, video.duration);
      
      // Calculate frame number (assuming 30fps, adjust if needed)
      const fps = 30;
      const frameNumber = Math.floor(time * fps);
      onFrameChange?.(frameNumber);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleError = (e: Event) => {
      // Ignore abort errors - they're usually harmless
      const error = video.error;
      if (error && error.code !== MediaError.MEDIA_ERR_ABORTED) {
        console.error("Video error:", error);
      }
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate, onFrameChange]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Prevent video from reloading if URL hasn't changed
  const prevVideoUrlRef = useRef<string>("");
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    
    // Only change src if URL actually changed
    if (prevVideoUrlRef.current !== videoUrl) {
      prevVideoUrlRef.current = videoUrl;
      video.src = videoUrl;
      video.load(); // Explicitly load the new source
    }
  }, [videoUrl]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain border border-gray-200 rounded-lg"
        controls={showControls}
        preload="metadata"
      />
      
      {!showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 border border-gray-200 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg flex items-center justify-center text-white transition-all"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {!showControls && duration > 0 && (
        <div className="mt-2 space-y-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #16a34a ${(currentTime / duration) * 100}%, #ffffff ${(currentTime / duration) * 100}%, #ffffff 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-black">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
