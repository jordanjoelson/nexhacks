"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSVGUnderlineProps {
  className?: string;
  color?: string;
}

export function AnimatedSVGUnderline({
  className,
  color = "#FF6B35",
}: AnimatedSVGUnderlineProps) {
  return (
    <svg
      width="100%"
      height="8"
      viewBox="0 0 100 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute -bottom-1 left-0", className)}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M2 6C15 2 25 6 38 4C51 2 61 6 74 4C87 2 97 6 98 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          pathLength: {
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.2,
          },
        }}
      />
    </svg>
  );
}
