"use client"

import { Section } from "@/components/ui/Section"
import { CountryCard } from "@/components/ui/CountryCard"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function CountriesPage() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            <Section className="bg-transparent flex-1 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg -z-10 bg-background"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 font-mono">
                            Explore <span className="text-primary glow-text">Destinations</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-light">
                            Discover requirements, opportunities, and guides for developed and developing nations.
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            {/* Search Bar */}
                            <div className="w-full max-w-lg relative group">
                                <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex items-center">
                                    <Search className="absolute left-4 text-muted-foreground h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        className="w-full h-14 pl-12 pr-4 rounded-full border border-primary/20 bg-background/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-lg placeholder:text-muted-foreground/50 shadow-lg"
                                    />
                                    <Button size="sm" className="absolute right-2 rounded-full h-10 px-6 font-semibold">Search</Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {["All Regions", "Europe", "Africa", "North America", "Oceania"].map((region, i) => (
                                    <button
                                        key={region}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${i === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_var(--primary)]" : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
                        <CountryCard
                            index={0}
                            name="United Kingdom"
                            slug="uk"
                            image="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600&auto=format&fit=crop"
                            description="Explore opportunities in London and beyond with the Skilled Worker Visa."
                        />
                        <CountryCard
                            index={1}
                            name="United States"
                            slug="usa"
                            image="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop"
                            description="The land of opportunity. Navigate the complex Green Card and visa systems."
                        />
                        <CountryCard
                            index={2}
                            name="Germany"
                            slug="germany"
                            image="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=600&auto=format&fit=crop"
                            description="Europe's economic powerhouse with new streamlined worker laws."
                        />
                        <CountryCard
                            index={3}
                            name="Canada"
                            slug="canada"
                            image="https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=600&auto=format&fit=crop"
                            description="High quality of life and welcoming immigration policies for skilled workers."
                        />
                        <CountryCard
                            index={4}
                            name="Australia"
                            slug="australia"
                            image="https://images.unsplash.com/photo-1523482580672-01e6f2eb60b3?q=80&w=600&auto=format&fit=crop"
                            description="Sun, surf, and high wages. Check your points eligibility today."
                        />
                        <CountryCard
                            index={5}
                            name="Netherlands"
                            slug="netherlands"
                            image="https://images.unsplash.com/photo-1555627766-888998059871?q=80&w=600&auto=format&fit=crop"
                            description="Work in tech or creative industries in one of Europe's most English-friendly countries."
                        />
                        <CountryCard
                            index={6}
                            name="Ghana"
                            slug="ghana"
                            image="https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=600&auto=format&fit=crop"
                            description="Experience the Year of Return with a thriving expat community."
                        />
                        <CountryCard
                            index={7}
                            name="South Africa"
                            slug="south-africa"
                            image="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600&auto=format&fit=crop"
                            description="A diverse nation with opportunities in tech, finance, and tourism."
                        />
                        {/* Placeholders for layout */}
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center p-8 min-h-[300px] text-muted-foreground/50 font-medium">
                                More Coming Soon
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    )
}
