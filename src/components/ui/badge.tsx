import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF6B35] text-white hover:bg-[#E85A2A] hover:text-white",
        secondary:
          "border-transparent bg-[#FFB84D] text-[#2D3142] hover:bg-[#FFB84D]/80 hover:text-[#2D3142]",
        destructive:
          "border-transparent bg-[#EF4444] text-white hover:bg-[#EF4444]/80 hover:text-white",
        outline: "text-[#2D3142] border-[#E5E7EB]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
