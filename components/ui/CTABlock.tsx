import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"

export function CTABlock() {
    return (
        <Section className="py-0">
            <div className="relative isolate overflow-hidden bg-zinc-900 px-6 py-24 sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to start your journey?
                        <br />
                        Get your personalized roadmap today.
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
                        We guide you through every step of the process, from visa eligibility to finding your new home.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                        <Button variant="secondary" size="lg" className="bg-white text-black hover:bg-white/90">
                            Get Started
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" size="lg">
                            Learn more <span aria-hidden="true">→</span>
                        </Button>
                    </div>
                </div>
                {/* Decorative gradients */}
                <svg
                    viewBox="0 0 1024 1024"
                    className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
                    aria-hidden="true"
                >
                    <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
                    <defs>
                        <radialGradient id="gradient">
                            <stop stopColor="#ffffff" />
                            <stop offset="1" stopColor="#ffffff" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        </Section>
    )
}
