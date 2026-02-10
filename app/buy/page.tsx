"use client"

import { PropertyCard } from "@/components/property/PropertyCard"
import { properties } from "@/lib/mockData"
import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import { Search, TrendingUp, MapPin, ArrowUpRight } from "lucide-react"

export default function BuyPage() {
    const buyProperties = properties.filter(p => p.type === 'buy');

    // Stats Data
    const marketStats = [
        { label: "Avg. Price in Lekki", value: "₦120M", change: "+5.2%", positive: true },
        { label: "New Listings Today", value: "24", change: "+12", positive: true },
        { label: "Properties Sold", value: "1,204", change: "This Month", positive: true },
    ];

    // Popular Locations
    const locations = [
        { name: "Ikoyi", image: "https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=300&auto=format&fit=crop", count: 45 },
        { name: "Victoria Island", image: "https://images.unsplash.com/photo-1549144511-30c51724f3f3?q=80&w=300&auto=format&fit=crop", count: 82 },
        { name: "Lekki Phase 1", image: "https://images.unsplash.com/photo-1542646399-6e3cd094396b?q=80&w=300&auto=format&fit=crop", count: 120 },
        { name: "Ikeja GRA", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=300&auto=format&fit=crop", count: 34 },
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans bg-zinc-50 dark:bg-black">

            {/* Hero / Filter Bar - Compact & Sticky-ish */}
            <section className="pt-32 pb-12 px-4 bg-white dark:bg-zinc-900 border-b border-border">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-foreground">
                                Buy Premium Property
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Browse 450+ verified homes for sale in Lagos.
                            </p>
                        </div>

                        {/* Market Pulse */}
                        <div className="flex gap-4 mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0">
                            {marketStats.map((stat, i) => (
                                <div key={i} className="min-w-[140px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border">
                                    <div className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</div>
                                    <div className="text-xl font-bold flex items-end gap-2">
                                        {stat.value}
                                        <span className={`text-[10px] mb-1 font-bold ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search Bar - Sleek */}
                    <div className="bg-white dark:bg-zinc-950 p-2 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-2 max-w-4xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by location..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-transparent focus:outline-none"
                            />
                        </div>
                        <div className="h-px w-full md:h-auto md:w-px bg-border mx-0 md:mx-2 my-2 md:my-0"></div>
                        <input
                            type="text"
                            placeholder="Max Price (₦)"
                            className="w-full md:w-48 px-4 py-3 rounded-lg bg-transparent focus:outline-none border-none"
                        />
                        <Button size="lg" className="w-full md:w-auto px-8">Search</Button>
                    </div>
                </div>
            </section>

            {/* Popular Locations */}
            <Section className="py-10 border-b border-border bg-white/50">
                <div className="container px-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Popular Areas</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {locations.map((loc, i) => (
                            <div key={i} className="group relative min-w-[200px] h-[100px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0">
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${loc.image})` }}></div>
                                <div className="absolute bottom-3 left-3 z-20 text-white">
                                    <div className="font-bold text-lg leading-none">{loc.name}</div>
                                    <div className="text-xs opacity-90">{loc.count} Properties</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Listings Grid */}
            <Section className="py-12">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buyProperties.length > 0 ? (
                            buyProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="inline-block p-4 rounded-full bg-muted mb-4">
                                    <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold">No properties found</h3>
                                <p className="text-muted-foreground">Try removing some filters.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Button variant="outline" size="lg" className="min-w-[200px]">Load More Listings</Button>
                    </div>
                </div>
            </Section>

        </div>
    )
}
