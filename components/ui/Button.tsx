"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// We will add Framer Motion in a wrapper or just use CSS transitions for simple buttons for performance,
// but let's add a motion button option if we really want "Perfect" feel.
// For now, pure CSS with better transitions is safer and standard for base definition.
import { motion, HTMLMotionProps } from "framer-motion"

// Combining React Button props with Framer Motion props
type ButtonProps = HTMLMotionProps<"button"> & {
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "xl"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl",
                    {
                        "bg-[#e0511f] text-white hover:bg-[#c8451a] shadow-sm hover:shadow-md hover:shadow-[#e0511f]/25": variant === "primary",
                        "bg-zinc-100 text-black border border-black/10 hover:bg-zinc-200 shadow-sm hover:shadow-md": variant === "secondary",
                        "border-2 border-[#e0511f]/30 bg-white text-[#e0511f] hover:border-[#e0511f] hover:bg-[#e0511f]/5": variant === "outline",
                        "text-foreground hover:bg-muted/60": variant === "ghost",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-lg px-3": size === "sm",
                        "h-12 rounded-xl px-8": size === "lg",
                        "h-14 rounded-xl px-8 text-base": size === "xl",
                    },
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button }
