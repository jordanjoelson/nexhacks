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
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      <div
        className={cn("flex shrink-0 [gap:var(--gap)] will-change-transform", {
          "flex-row": !vertical,
          "flex-col": vertical,
          "animate-marquee": !vertical && !reverse,
          "animate-marquee-reverse": !vertical && reverse,
          "animate-marquee-vertical": vertical,
          "group-hover:[animation-play-state:paused]": pauseOnHover,
        })}
        style={{
          animationDuration: "var(--duration)",
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
        }}
      >
        {/* First set of content */}
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div key={`first-${i}`} className="flex shrink-0 [gap:var(--gap)]">
              {children}
            </div>
          ))}
        {/* Duplicate set for seamless loop */}
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div key={`second-${i}`} className="flex shrink-0 [gap:var(--gap)]">
              {children}
            </div>
          ))}
      </div>
    </div>
  )
}
