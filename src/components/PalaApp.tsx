"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Play,
  Pause,
  MessageCircle,
  BarChart3,
  Clock,
  TrendingUp,
  Video,
  X,
  Send,
  Volume2,
  VolumeX,
  Gauge,
  ChevronRight,
  Home,
  Film,
} from "lucide-react";

type Page = "locker-room" | "film-room";

interface Session {
  id: string;
  date: string;
  thumbnail: string;
  topTip: string;
  duration: string;
}

interface TimelineItem {
  time: string;
  event: string;
  type: "highlight" | "improvement";
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "pala";
  timestamp: Date;
}

export default function PalaApp() {
  const [currentPage, setCurrentPage] = useState<Page>("locker-room");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "ask">("summary");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [coachVoiceEnabled, setCoachVoiceEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Mock data
  const recentSessions: Session[] = [
    {
      id: "1",
      date: "2 days ago",
      thumbnail: "🎾",
      topTip: "Fix your backhand positioning",
      duration: "12:34",
    },
    {
      id: "2",
      date: "5 days ago",
      thumbnail: "🏓",
      topTip: "Great serve consistency",
      duration: "15:22",
    },
    {
      id: "3",
      date: "1 week ago",
      thumbnail: "🎯",
      topTip: "Work on kitchen pressure",
      duration: "18:45",
    },
  ];

  const timelineItems: TimelineItem[] = [
    { time: "0:15", event: "Strong serve placement", type: "highlight" },
    { time: "0:45", event: "Great kitchen pressure", type: "highlight" },
    { time: "1:23", event: "Backhand needs work", type: "improvement" },
    { time: "2:10", event: "Excellent dink strategy", type: "highlight" },
    { time: "3:45", event: "Positioning could improve", type: "improvement" },
  ];

  const stats = {
    accuracy: 78,
    gamesAnalyzed: 12,
    weeklyProgress: "+15%",
  };

  const handleFileSelect = (file: File) => {
    setIsUploading(true);
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsUploading(false);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setCurrentPage("film-room");
        }, 2000);
      }, 3000);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPaused(true);
      } else {
        videoRef.current.play();
        setIsPaused(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate Pala response
    setTimeout(() => {
      const palaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's a great question! Your backhand positioning was slightly off because you were reaching too far. Try keeping your paddle closer to your body and step into the shot.",
        sender: "pala",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, palaResponse]);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-[#FFB800]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4FF00] to-[#FFB800] flex items-center justify-center font-bold text-[#0F0F0F] text-lg">
              P
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Pala
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage("locker-room")}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === "locker-room"
                  ? "bg-[#D4FF00]/20 text-[#D4FF00]"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage("film-room")}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === "film-room"
                  ? "bg-[#D4FF00]/20 text-[#D4FF00]"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <AnimatePresence mode="wait">
          {currentPage === "locker-room" && (
            <motion.div
              key="locker-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-6 py-8"
            >
              {/* Hero Section */}
              <div className="mb-12 text-center">
                <h2
                  className="text-5xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Meet Pala, the pickleball pal that builds your game.
                </h2>
                <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
                  Upload your match footage and get instant AI coaching. Pala breaks down your game,
                  walks you through key plays, and answers your questions—so you can improve faster.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Upload Card - Large Center Piece */}
                <motion.div
                  className="md:col-span-2 rounded-[20px] p-8 border-2 border-dashed border-[#D4FF00] bg-[#1A1A1A] relative overflow-hidden"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={`absolute inset-0 bg-[#FFB800]/5 transition-opacity ${
                      dragActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
                    {isUploading || isProcessing ? (
                      <div className="text-center">
                        <motion.div
                          className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#D4FF00] border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-[#D4FF00] font-semibold mb-2">
                          {isUploading ? "Uploading..." : "Pala's watching the tape..."}
                        </p>
                        <p className="text-[#A1A1AA] text-sm">
                          {isUploading
                            ? "Getting your match ready"
                            : "Grab some water, we'll be ready in a second."}
                        </p>
                        {isProcessing && (
                          <motion.div
                            className="mt-4 h-2 bg-[#1A1A1A] rounded-full overflow-hidden max-w-xs mx-auto"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#D4FF00] to-[#FFB800]"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 3 }}
                            />
                          </motion.div>
                        )}
                      </div>
                    ) : uploadSuccess ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#D4FF00] flex items-center justify-center">
                          <ChevronRight className="w-10 h-10 text-[#0F0F0F]" />
                        </div>
                        <p className="text-[#D4FF00] font-semibold text-lg">
                          Pala's ready to rally. Your breakdown is good to go.
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Upload className="w-16 h-16 text-[#D4FF00] mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2">Upload a Match</h3>
                        <p className="text-[#A1A1AA] mb-6 text-center">
                          Drop your video here or click to browse
                        </p>
                        <motion.button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-[#D4FF00] text-[#0F0F0F] font-bold rounded-xl"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Get Coached by Pala
                        </motion.button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Stats Widget */}
                <div className="space-y-4">
                  <motion.div
                    className="rounded-[20px] p-6 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#FFB800]/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Gauge className="w-5 h-5 text-[#FFB800]" />
                      <span className="text-[#A1A1AA] text-sm">Accuracy</span>
                    </div>
                    <p className="text-3xl font-bold text-[#D4FF00]">{stats.accuracy}%</p>
                  </motion.div>

                  <motion.div
                    className="rounded-[20px] p-6 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#FFB800]/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Video className="w-5 h-5 text-[#FFB800]" />
                      <span className="text-[#A1A1AA] text-sm">Games Analyzed</span>
                    </div>
                    <p className="text-3xl font-bold text-[#D4FF00]">{stats.gamesAnalyzed}</p>
                  </motion.div>

                  <motion.div
                    className="rounded-[20px] p-6 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#FFB800]/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#FFB800]" />
                      <span className="text-[#A1A1AA] text-sm">Weekly Progress</span>
                    </div>
                    <p className="text-3xl font-bold text-[#D4FF00]">{stats.weeklyProgress}</p>
                  </motion.div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Recent Sessions</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {recentSessions.length === 0 ? (
                    <div className="text-center py-12 w-full">
                      <p className="text-[#A1A1AA] text-lg">
                        The court is quiet. Upload your first session and let's get to work!
                      </p>
                    </div>
                  ) : (
                    recentSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className="flex-shrink-0 w-64 rounded-[20px] p-6 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#FFB800]/10 cursor-pointer"
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage("film-room")}
                      >
                        <div className="w-full h-32 bg-[#0F0F0F] rounded-xl mb-4 flex items-center justify-center text-4xl">
                          {session.thumbnail}
                        </div>
                        <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{session.duration}</span>
                          <span className="mx-2">•</span>
                          <span>{session.date}</span>
                        </div>
                        <p className="font-semibold text-[#D4FF00] mb-1">Top Tip</p>
                        <p className="text-sm text-[#A1A1AA]">{session.topTip}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === "film-room" && (
            <motion.div
              key="film-room"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-6 py-8"
            >
              {!videoUrl ? (
                <div className="text-center py-20">
                  <p className="text-[#A1A1AA] text-lg mb-6">
                    No video loaded. Upload a match to get started.
                  </p>
                  <motion.button
                    onClick={() => setCurrentPage("locker-room")}
                    className="px-6 py-3 bg-[#D4FF00] text-[#0F0F0F] font-bold rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Locker Room
                  </motion.button>
                </div>
              ) : (
                <div className="flex gap-6 h-[calc(100vh-8rem)]">
                  {/* Video Player - 70% */}
                  <div className="flex-1 flex flex-col">
                    <div className="relative flex-1 bg-[#0F0F0F] rounded-[20px] overflow-hidden border border-[#FFB800]/10">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onPlay={() => {
                          setIsPlaying(true);
                          setIsPaused(false);
                        }}
                        onPause={() => {
                          setIsPlaying(false);
                          setIsPaused(true);
                        }}
                      />
                      
                      {/* Custom Controls Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                          <div className="flex items-center gap-4 mb-4">
                            <motion.button
                              onClick={togglePlayPause}
                              className="w-12 h-12 rounded-full bg-[#D4FF00] text-[#0F0F0F] flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6" />
                              ) : (
                                <Play className="w-6 h-6 ml-1" />
                              )}
                            </motion.button>
                            <div
                              className="flex-1 h-2 bg-[#1A1A1A]/50 rounded-full overflow-hidden cursor-pointer relative"
                              onClick={(e) => {
                                if (videoRef.current && duration > 0) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = (e.clientX - rect.left) / rect.width;
                                  const newTime = percent * duration;
                                  videoRef.current.currentTime = newTime;
                                  setCurrentTime(newTime);
                                }
                              }}
                            >
                              <motion.div
                                className="h-full bg-[#D4FF00]"
                                initial={{ width: "0%" }}
                                animate={{
                                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                                }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <span className="text-sm text-white">
                              {formatTime(currentTime)} / {formatTime(duration || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pause & Ask Button - Only visible when paused */}
                      <AnimatePresence>
                        {isPaused && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          >
                            <motion.button
                              className="px-6 py-3 bg-[#D4FF00] text-[#0F0F0F] font-bold rounded-xl flex items-center gap-2 shadow-2xl"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setActiveTab("ask")}
                            >
                              <MessageCircle className="w-5 h-5" />
                              Ask Pala
                            </motion.button>
                            <p className="text-center mt-3 text-sm text-white/80">
                              Curious about that play? Pause here and ask Pala what happened!
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Voiceover Controller */}
                    <motion.div
                      className="mt-4 p-4 bg-[#1A1A1A]/50 backdrop-blur-sm rounded-xl border border-[#FFB800]/10 flex items-center justify-between"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={() => setCoachVoiceEnabled(!coachVoiceEnabled)}
                          className={`p-2 rounded-lg ${
                            coachVoiceEnabled
                              ? "bg-[#D4FF00]/20 text-[#D4FF00]"
                              : "bg-[#1A1A1A] text-[#A1A1AA]"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {coachVoiceEnabled ? (
                            <Volume2 className="w-5 h-5" />
                          ) : (
                            <VolumeX className="w-5 h-5" />
                          )}
                        </motion.button>
                        <span className="text-sm text-[#A1A1AA]">Coach Voice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#A1A1AA]">Speed:</span>
                        {[0.75, 1, 1.25, 1.5].map((speed) => (
                          <motion.button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              playbackSpeed === speed
                                ? "bg-[#D4FF00] text-[#0F0F0F]"
                                : "bg-[#1A1A1A] text-[#A1A1AA]"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {speed}x
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* AI Sidebar - 30% */}
                  <motion.div
                    className="w-[400px] flex flex-col bg-[#1A1A1A]/50 backdrop-blur-sm rounded-[20px] border border-[#FFB800]/10 overflow-hidden"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Sticky Header with Tabs */}
                    <div className="sticky top-0 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-[#FFB800]/10 z-10">
                      <div className="flex">
                        <button
                          onClick={() => setActiveTab("summary")}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                            activeTab === "summary"
                              ? "bg-[#D4FF00]/20 text-[#D4FF00] border-b-2 border-[#D4FF00]"
                              : "text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => setActiveTab("ask")}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                            activeTab === "ask"
                              ? "bg-[#D4FF00]/20 text-[#D4FF00] border-b-2 border-[#D4FF00]"
                              : "text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          Ask Pala
                        </button>
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {activeTab === "summary" && (
                        <div>
                          <h3 className="text-lg font-bold mb-4">
                            Here's what Pala noticed in your game today.
                          </h3>
                          <div className="space-y-3">
                            {timelineItems.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-[#0F0F0F]/50"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 ${
                                    item.type === "highlight"
                                      ? "bg-[#D4FF00]"
                                      : "bg-[#FFB800]"
                                  }`}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-[#FFB800]">
                                      {item.time}
                                    </span>
                                    {item.type === "highlight" && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4FF00]/20 text-[#D4FF00]">
                                        Highlight
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#A1A1AA]">{item.event}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "ask" && (
                        <div className="flex flex-col h-full">
                          <div className="flex-1 space-y-4 mb-4">
                            {messages.length === 0 ? (
                              <div className="text-center py-8">
                                <MessageCircle className="w-12 h-12 text-[#A1A1AA] mx-auto mb-3" />
                                <p className="text-[#A1A1AA] text-sm mb-2">
                                  Got questions? Pala's here to help.
                                </p>
                                <p className="text-[#A1A1AA] text-xs">
                                  Ask naturally, like you're talking to a coach.
                                </p>
                              </div>
                            ) : (
                              messages.map((message) => (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex ${
                                    message.sender === "user" ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-xl p-3 ${
                                      message.sender === "user"
                                        ? "bg-[#D4FF00] text-[#0F0F0F]"
                                        : "bg-[#0F0F0F] text-[#A1A1AA]"
                                    }`}
                                  >
                                    {message.sender === "pala" && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4FF00]/20 text-[#D4FF00] font-semibold">
                                          Coach
                                        </span>
                                      </div>
                                    )}
                                    <p className="text-sm">{message.text}</p>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                              placeholder="Ask Pala anything..."
                              className="flex-1 px-4 py-2 bg-[#0F0F0F] border border-[#FFB800]/20 rounded-xl text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#D4FF00]"
                            />
                            <motion.button
                              onClick={sendMessage}
                              className="p-2 bg-[#D4FF00] text-[#0F0F0F] rounded-xl"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Send className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
