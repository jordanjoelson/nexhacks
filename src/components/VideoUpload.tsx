"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Loader from "./Loader";

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  maxSize?: number; // in bytes, default 500MB
  isUploading?: boolean;
}

export default function VideoUpload({ onVideoSelect, maxSize = 500 * 1024 * 1024, isUploading = false }: VideoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`File is too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Please upload a valid video file (MP4, MOV, AVI, etc.)");
        } else {
          setError("Failed to upload video. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onVideoSelect(file);
      }
    },
    [onVideoSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"],
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200 bg-gradient-to-br from-white to-gray-50
          ${
            isDragActive || isDragging
              ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100"
              : "border-gray-300 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-white"
          }
          ${error ? "border-gray-300 bg-white" : ""}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader />
          ) : (
            <div className="w-16 h-16 border border-gray-200 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          )}
          <div>
            <p className={`text-lg font-bold ${isDragActive || isDragging ? "text-white" : "text-black"}`}>
              {isUploading ? "Uploading video..." : isDragActive ? "Drop your video here" : "Drag & drop your pickleball video"}
            </p>
            <p className={`text-sm mt-2 ${isDragActive || isDragging ? "text-white" : "text-black"}`}>
              {isUploading ? "Please wait..." : "or click to browse"}
            </p>
          </div>
          {!isUploading && (
            <p className={`text-xs ${isDragActive || isDragging ? "text-white" : "text-black"}`}>
              Supported formats: MP4, MOV, AVI, WebM, MKV
              <br />
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-white border-2 border-gray-300 rounded-lg text-black text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
