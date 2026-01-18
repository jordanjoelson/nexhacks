"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import Loader from "@/components/Loader";

export default function AnalyzePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoSelect = useCallback((file: File) => {
    setIsUploading(true);
    setSelectedFile(file);
    // Simulate upload delay
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsUploading(false);
    }, 500);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile || !videoUrl) return;

    setIsProcessing(true);
    // Navigate to summary with video URL
    // The summary page will use the video element's captureStream() method
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/analyze/summary?video=${encodeURIComponent(videoUrl)}`);
    }, 500);
  };

  const handleClear = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setSelectedFile(null);
    setVideoUrl(null);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            Pickleball Video Analysis
          </h1>
          <p className="mt-2 text-lg text-black">
            Upload your pickleball video for AI-powered analysis
          </p>
        </div>

        {!videoUrl ? (
          <div className="bg-white p-8">
            <VideoUpload onVideoSelect={handleVideoSelect} isUploading={isUploading} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-black">
                    Video Preview
                  </h2>
                  <p className="text-sm text-black mt-1">
                    {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / (1024 * 1024) : 0).toFixed(2)} MB)
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm text-black font-medium rounded-lg border border-gray-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:border-green-500 transition-all"
                >
                  Change Video
                </button>
              </div>
              <VideoPlayer videoUrl={videoUrl} />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold text-lg rounded-lg border border-gray-200 hover:from-green-500 hover:to-green-600 hover:border-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? "Processing..." : "Analyze Video"}
              </button>
            </div>

            {isProcessing && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center gap-3">
                  <Loader />
                  <div>
                    <p className="font-bold text-black">
                      Processing your video...
                    </p>
                    <p className="text-sm text-black mt-1">
                      This may take a few minutes. Please don't close this page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
