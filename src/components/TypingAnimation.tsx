"use client";

import { useState, useEffect, useRef } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  showSkip?: boolean;
  className?: string;
}

export default function TypingAnimation({
  text,
  speed = 40,
  onComplete,
  showSkip = true,
  className = "",
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef<string>("");
  const hasCompletedRef = useRef(false); // Track if animation has completed

  useEffect(() => {
    // Never replay once completed
    if (hasCompletedRef.current) return;
    
    // Only start animation if text exists and is different from last time
    if (!text || text === lastTextRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state and start new animation
    lastTextRef.current = text;
    setIsTyping(true);
    setIsComplete(false);
    setDisplayedText("");

    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        const char = text[currentIndex];
        setDisplayedText((prev) => prev + char);

        // Calculate delay based on character (faster speeds)
        let delay = speed;
        if (char === ",") {
          delay = speed + 50;
        } else if (char === "." || char === "!" || char === "?") {
          delay = speed + 100;
        } else if (char === "\n") {
          delay = speed + 150;
        }

        currentIndex++;
        timeoutRef.current = setTimeout(typeNextCharacter, delay);
      } else {
        setIsTyping(false);
        setIsComplete(true);
        hasCompletedRef.current = true; // Mark as completed
        onComplete?.();
      }
    };

    // Start typing after a short delay
    timeoutRef.current = setTimeout(typeNextCharacter, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  const skipAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(text);
    setIsTyping(false);
    setIsComplete(true);
    onComplete?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="text-black whitespace-pre-wrap">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-5 bg-black ml-1 animate-pulse" />
        )}
      </div>
      {showSkip && isTyping && (
        <button
          onClick={skipAnimation}
          className="mt-4 px-4 py-2 text-sm text-black rounded-lg border-2 border-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
        >
          Skip animation
        </button>
      )}
    </div>
  );
}
