"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import { Card } from "@/components/ui/Card"
import { CountryCard } from "@/components/ui/CountryCard"
import { CTABlock } from "@/components/ui/CTABlock"
import { Globe, ShieldCheck, Zap, ArrowRight, MapPin, BarChart3, Lock, Users, CheckCircle2, FileCheck, Plane } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Discover",
      desc: "Explore verified visa pathways and compliance requirements for 50+ countries.",
      icon: Globe,
      color: "bg-blue-500"
    },
    {
      title: "Verify",
      desc: "Use our AI-driven eligibility check to assess your chances before applying.",
      icon: FileCheck,
      color: "bg-purple-500"
    },
    {
      title: "Relocate",
      desc: "Connect with vetted movers, real estate agents, and legal experts.",
      icon: Plane,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Split Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-background"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 hidden lg:block -skew-x-12 translate-x-32"></div>

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col items-start text-left max-w-2xl"
            >
              <div className="absolute top-10 left-10 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg animate-bounce duration-[3000ms]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-muted-foreground">New: UK Policy Update</span>
              </div>

              <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Global Mobility Operating System
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.1] mb-6 font-mono">
                Move Across Borders <br />
                <span className="text-primary">Without Friction</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg font-light">
                The definitive platform for international relocation. Verified intelligence, expert connections, and compliant workflows.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/countries">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-lg hover:translate-y-[-2px] transition-transform shadow-[0_0_20px_var(--primary)] hover:shadow-[0_0_30px_var(--primary)]">
                    Start Your Journey
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-lg border-primary/20 hover:bg-primary/5">
                    View Services
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Ticker */}
              <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-border/40 w-full">
                <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-wider">Trusted by professionals from</p>
                <div className="flex gap-8 grayscale opacity-50 hover:opacity-100 transition-opacity">
                  <span className="text-lg font-bold">Google</span>
                  <span className="text-lg font-bold">Spotify</span>
                  <span className="text-lg font-bold">Shopify</span>
                  <span className="text-lg font-bold">Remote</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual (Abstract Interface) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block h-[600px] w-full"
            >
              <div className="relative w-full h-full border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden p-1 shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 grid-bg opacity-20"></div>
                {/* Mock UI Elements */}
                <div className="h-full w-full bg-background/80 rounded-lg p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-2 w-20 bg-muted rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="col-span-1 h-full bg-muted/10 rounded-lg border border-border/20 p-4 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/50"></div>
                      <div className="h-4 w-1/2 bg-primary/20 rounded"></div>
                      <div className="h-20 w-full bg-muted/20 rounded"></div>
                      <div className="h-20 w-full bg-muted/20 rounded"></div>
                      <div className="h-20 w-full bg-muted/20 rounded"></div>
                    </div>
                    <div className="col-span-2 h-full bg-muted/5 rounded-lg border border-border/20 p-4 relative overflow-hidden flex flex-col items-center justify-center">
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-primary">SYSTEM ACTIVE</span>
                      </div>
                      <Globe className="w-64 h-64 text-primary/10 stroke-1 animate-[spin_20s_linear_infinite]" />
                      <div className="absolute bottom-8 left-8 right-8 p-4 bg-card/80 backdrop-blur-md rounded-lg border border-border/50 shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono text-muted-foreground">VISA PROBABILITY</span>
                          <span className="text-sm font-bold text-primary">98.4%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[98%] bg-primary"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Process Section */}
      <Section className="bg-background border-b border-border/40 py-24 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">The Migration Workflow</h2>
            <p className="text-muted-foreground text-lg">Systematic execution for your global move. From discovery to touchdown.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Tabs */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${activeStep === index ? "bg-card border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] shadow-primary/5" : "bg-transparent border-transparent hover:bg-muted/10 hover:border-border/50"}`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${activeStep === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${activeStep === index ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Visual */}
            <div className="relative h-[500px] w-full rounded-2xl border border-border/50 bg-muted/10 overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  {/* Content based on step */}
                  {activeStep === 0 && (
                    <div className="text-center space-y-4">
                      <Globe className="w-32 h-32 text-blue-500 mx-auto opacity-80" />
                      <div className="bg-card p-4 rounded-lg border border-border shadow-lg max-w-sm mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">UK</div>
                          <div className="text-sm font-bold text-left">Skilled Worker Visa</div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[70%] bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="text-center space-y-4 w-full max-w-md">
                      <div className="bg-card w-full p-6 rounded-xl border border-primary/20 shadow-xl shadow-primary/5">
                        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                          <span className="font-mono text-sm">ELIGIBILITY_CHECK.exe</span>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Criterion 0{i}</span>
                              <span className="text-green-500 font-mono">PASS</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay"></div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-card/90 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                              <Plane className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">Departure Confirmed</div>
                              <div className="text-sm text-muted-foreground">Relocation agents active</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Section>

      {/* Complex Bento Grid Features */}
      <Section className="bg-[#0B0F19] py-24 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-xl mb-16">
            <h2 className="text-3xl font-bold font-mono mb-4 text-white">Core Infrastructure</h2>
            <p className="text-lg text-white/70">Three pillars of support for a seamless international transition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">

            {/* Large Feature 1: Immigration */}
            <div className="md:col-span-2 md:row-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute inset-0 grid-bg opacity-20"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-6 border border-primary/20">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-mono text-white">Immigration & Compliance</h3>
                <p className="text-white/70 leading-relaxed max-w-sm">
                  End-to-end management of visas, permits, and government relations. Real-time probability tracking and document auditing.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-[100px] border-t border-l border-white/5 transition-transform group-hover:scale-105 duration-500"></div>
            </div>

            {/* Wide Feature 2: Financial */}
            <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 flex items-center justify-between relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="relative z-10 max-w-xs">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono text-white">Relocation Ecosystem</h3>
                <p className="text-sm text-white/70">Access our network of vetted movers, real estate agents, and schools.</p>
              </div>
              <Globe className="w-32 h-32 text-white/5 absolute -right-4 -bottom-4 group-hover:rotate-12 transition-transform duration-500" />
            </div>

            {/* Small Feature 3: Speed */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-center items-center text-center hover:border-primary/50 transition-colors group">
              <h4 className="text-4xl font-bold font-mono text-white mb-2 group-hover:text-primary transition-colors">48h</h4>
              <p className="text-sm text-white/50 uppercase tracking-wider">Strategy Turnaround</p>
            </div>

            {/* Small Feature 4: Financial */}
            <div className="rounded-2xl bg-primary/20 border border-primary/20 p-6 flex flex-col justify-center items-center text-center">
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <p className="text-sm font-bold text-white">Financial & Business</p>
              <p className="text-xs text-white/70 mt-1">Tax & Incorporation</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Countries (Clean) */}
      <Section className="bg-transparent py-24 border-t border-border/40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-mono">
            Destination Index
          </h2>
          <Link href="/countries">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/5">View Full Index</Button>
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <CountryCard index={0} name="United Kingdom" slug="uk" image="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600&auto=format&fit=crop" description="Tier 1 Skilled Worker routes." />
          <CountryCard index={1} name="United States" slug="usa" image="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop" description="EB-1, EB-2 and Green Card pathways." />
          <CountryCard index={2} name="Germany" slug="germany" image="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=600&auto=format&fit=crop" description="EU Blue Card opportunities." />
          <CountryCard index={3} name="Canada" slug="canada" image="https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=600&auto=format&fit=crop" description="Express Entry system." />
        </div>
      </Section>

      {/* CTA Section (Minimal) */}
      <CTABlock />
    </div>
  );
}
