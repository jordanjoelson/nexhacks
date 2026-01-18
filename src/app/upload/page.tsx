"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Video, CheckCircle, Loader2, Camera, Move, Play } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
          setTimeout(() => router.push("/analysis/${id}"), 500);
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
    <div className="min-h-screen bg-[#FFFAF5] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[#2D3142]" style={{ fontFamily: "var(--font-display)" }}>
            Upload Your Game
          </h1>
          <p className="text-xl text-[#6B7280]">
            Let PALA analyze your pickleball footage
          </p>
        </div>

        <Card className="border-2 border-dashed border-[#FF6B35] bg-white shadow-xl">
          <CardContent className="p-12">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
            >
              {isUploading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 text-[#FF6B35] animate-spin mx-auto" />
                  <div>
                    <p className="text-2xl font-bold text-[#2D3142] mb-2">
                      Processing...
                    </p>
                    <p className="text-[#6B7280]">Uploading your video to PALA</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-[#FF6B35]" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-[#2D3142]">
                      Drag & Drop Video
                    </h3>
                    <p className="text-[#6B7280]">
                      or click to browse • MP4, MOV, AVI (max 500MB)
                    </p>
                  </div>
                </>
              )}

              {!isUploading && (
                <Button
                  size="lg"
                  className="bg-[#FF6B35] hover:bg-[#E85A2A] text-lg px-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="mr-2 w-5 h-5" />
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

        <div className="grid md:grid-cols-3 gap-6 mt-12">
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
