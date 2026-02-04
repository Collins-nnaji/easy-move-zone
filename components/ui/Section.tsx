import * as React from "react"
import { cn } from "@/lib/utils"

const Section = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
    <section
        ref={ref}
        className={cn("w-full py-12 md:py-24 lg:py-32", className)}
        {...props}
    >
        <div className="container mx-auto px-4 md:px-6">
            {children}
        </div>
    </section>
))
Section.displayName = "Section"

export { Section }
