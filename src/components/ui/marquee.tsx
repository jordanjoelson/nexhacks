"use client";

import { cn } from "@/lib/utils"

interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: React.ReactNode
  vertical?: boolean
  repeat?: number
  [key: string]: any
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 2,
  ...props
}: MarqueeProps) {
  const duration = "40s";
  
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-4 will-change-transform",
          {
            "flex-row": !vertical,
            "flex-col": vertical,
          }
        )}
        style={{
          animation: !vertical && !reverse
            ? `marquee ${duration} linear infinite`
            : !vertical && reverse
            ? `marquee-reverse ${duration} linear infinite`
            : "none",
          animationPlayState: pauseOnHover ? "paused" : "running",
        }}
      >
        {/* First set of content */}
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div key={`first-${i}`} className="flex shrink-0 gap-4">
              {children}
            </div>
          ))}
        {/* Duplicate set for seamless loop */}
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div key={`second-${i}`} className="flex shrink-0 gap-4">
              {children}
            </div>
          ))}
      </div>
    </div>
  )
}
