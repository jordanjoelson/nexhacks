"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Video, CheckCircle, Loader2, Camera, Move, Play, ArrowLeft } from "lucide-react";
import { useVideoStore } from "@/store/videoStore";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const setFile = useVideoStore((s) => s.setFile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File | null) => {
    if (!file && !selectedFile) {
      fileInputRef.current?.click();
      return;
    }

    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setSelectedFile(fileToUpload);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFile(fileToUpload);          // ✅ always the real File
            setIsUploading(false);          // ✅ end upload state
            router.push("/analyze/summary");
          }, 500);

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 hover:bg-[#FF6B35]/10 text-[#6B7280] hover:text-[#2D3142] text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </div>
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[#2D3142] px-4" style={{ fontFamily: "var(--font-display)" }}>
            Upload Your Game
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] px-4">
            Let PALA analyze your pickleball footage
          </p>
        </div>

        <Card className="border-2 border-dashed border-[#FF6B35] bg-white shadow-xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6"
            >
              {isUploading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#FF6B35] animate-spin mx-auto" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-2">
                      Processing...
                    </p>
                    <p className="text-sm sm:text-base text-[#6B7280]">Uploading your video to PALA</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF6B35]" />
                  </div>
                  <div className="text-center space-y-2 px-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142]">
                      Drag & Drop Video
                    </h3>
                    <p className="text-sm sm:text-base text-[#6B7280]">
                      or click to browse • MP4, MOV, AVI (max 500MB)
                    </p>
                  </div>
                </>
              )}

              {!isUploading && (
                <Button
                  size="lg"
                  className="bg-[#FF6B35] hover:bg-[#E85A2A] text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Select Video File
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {isUploading && (
                <div className="w-full max-w-md space-y-2">
                  <div className="h-3 bg-[#FFF5EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB84D] transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-[#6B7280]">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {selectedFile && !isUploading && (
                <div className="mt-4 p-4 bg-[#FFF5EB] rounded-lg border border-[#FFB84D]/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4ECDC4]" />
                    <div>
                      <p className="font-medium text-[#2D3142]">{selectedFile.name}</p>
                      <p className="text-sm text-[#6B7280]">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#4ECDC4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Clear View</h3>
                  <p className="text-sm text-[#6B7280]">
                    Capture full court from sideline angle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFB84D]/10 flex items-center justify-center">
                  <Move className="w-6 h-6 text-[#FFB84D]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Stable Camera</h3>
                  <p className="text-sm text-[#6B7280]">
                    Use tripod or stable surface for best results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#FFB84D]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3142] mb-1">Full Rally</h3>
                  <p className="text-sm text-[#6B7280]">
                    Include complete points for best analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
