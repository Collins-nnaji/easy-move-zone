"use client"

import { use, useState } from "react"
import { properties } from "@/lib/mockData"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { MortgageCalculator } from "@/components/property/MortgageCalculator"
import { Shield, CheckCircle, MapPin, Bed, Bath, Move, Calendar, Star, User, School, Coffee, Siren } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const property = properties.find(p => p.id === id)
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!property) {
        return notFound()
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
    }

    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="container px-4 md:px-6 max-w-6xl mx-auto">

                {/* Back Link */}
                <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
                    &larr; Back to Properties
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {property.verified && (
                                <Badge variant="success" className="gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verified Listing
                                </Badge>
                            )}
                            {property.isNew && <Badge>New</Badge>}
                            <Badge variant="outline" className="capitalize">{property.type}</Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" /> {property.location}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{formatPrice(property.price)}</div>
                        <div className="text-muted-foreground">{property.period ? `per ${property.period}` : 'Sale Price'}</div>
                    </div>
                </div>

                {/* Image Grid (Placeholder) */}
                <div className="grid md:grid-cols-2 gap-4 mb-12 aspect-[21/9] md:aspect-[21/9] h-[400px]">
                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full h-full relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">Main Image</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 hidden md:grid">
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl relative overflow-hidden"></div>
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl relative overflow-hidden"></div>
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl relative overflow-hidden"></div>
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl relative overflow-hidden flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                            <span className="font-bold text-sm">+5 Photos</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-10">

                        {/* Key Specs */}
                        <div className="grid grid-cols-3 gap-4 border-y border-border py-6">
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl">
                                <Bed className="w-6 h-6 mb-2 text-primary" />
                                <span className="font-bold text-lg">{property.bedrooms}</span>
                                <span className="text-xs text-muted-foreground uppercase">Bedrooms</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl">
                                <Bath className="w-6 h-6 mb-2 text-primary" />
                                <span className="font-bold text-lg">{property.bathrooms}</span>
                                <span className="text-xs text-muted-foreground uppercase">Bathrooms</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-xl">
                                <Move className="w-6 h-6 mb-2 text-primary" />
                                <span className="font-bold text-lg">{property.sizeSqM}</span>
                                <span className="text-xs text-muted-foreground uppercase">Square Meters</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">About this home</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {property.description}
                                <br /><br />
                                Experience luxury living in this thoughtfully designed space.
                                Featuring premium finishes, ample natural light, and located in a secure, serene neighborhood.
                                The property comes fully verified with all documentation available for inspection upon request.
                            </p>
                        </div>

                        {/* Features */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Features & Amenities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {property.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Neighborhood Guide (New) */}
                        <div className="pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold mb-4">Neighborhood Vibe</h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                                    <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-400 font-bold">
                                        <Siren className="w-4 h-4" /> Safety Score
                                    </div>
                                    <div className="text-2xl font-black">9.2<span className="text-sm font-normal text-muted-foreground">/10</span></div>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                    <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-bold">
                                        <School className="w-4 h-4" /> Schools
                                    </div>
                                    <div className="text-sm">4 Top-rated schools within 5km radius.</div>
                                </div>
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                    <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400 font-bold">
                                        <Coffee className="w-4 h-4" /> Lifestyle
                                    </div>
                                    <div className="text-sm">Vibrant nightlife and 12+ cafes nearby.</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar / Trust & Contact */}
                    <div className="space-y-6">
                        {/* Trust Card */}
                        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-primary" />
                                <h3 className="font-bold text-lg">Trust Score</h3>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-black text-primary">{property.trustScore}</span>
                                <span className="text-sm text-muted-foreground mb-1.5">/ 100</span>
                            </div>
                            <div className="w-full bg-primary/20 h-2 rounded-full mb-4">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${property.trustScore}%` }}></div>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Physical Inspection Verified</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Ownership Verified</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> No Litigation Record</li>
                            </ul>
                        </div>

                        {/* Agent Card */}
                        <div className="p-6 rounded-2xl border border-border bg-card shadow-lg">
                            <h3 className="font-bold text-lg mb-6">Interested?</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-zinc-500" />
                                </div>
                                <div>
                                    <div className="font-bold">EasyMove Agent</div>
                                    <div className="text-xs text-muted-foreground">Licensed Partner</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    className="w-full text-base font-bold h-12"
                                    onClick={() => alert("Modal functionality coming soon!")}
                                >
                                    Book Inspection
                                </Button>
                                <Button variant="outline" className="w-full text-base font-bold h-12">Ask a Question</Button>
                            </div>
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Funds are held in escrow until you are satisfied.
                            </p>
                        </div>

                        {/* Calculator Component */}
                        <MortgageCalculator price={property.price} type={property.type} />
                    </div>

                </div>

            </div>
        </div>
    )
}
