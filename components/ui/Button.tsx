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
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20": variant === "primary",
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-md px-3": size === "sm",
                        "h-11 rounded-md px-8": size === "lg",
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
