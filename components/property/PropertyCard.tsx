"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { getImageOrFallback } from "@/lib/property/media"
import { Property } from "@/lib/mockData"
import { Bed, Bath, Move, MapPin, CheckCircle, Shield } from "lucide-react"

interface PropertyCardProps {
    property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
    }

    return (
        <div className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {/* Image Placeholder - In real app use Next/Image with valid src */}
                <div
                    className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
                    style={{ backgroundImage: `url(${getImageOrFallback(property.images)})` }}
                ></div>

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {property.verified && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur rounded-md text-xs font-bold text-green-700 shadow-sm">
                            <CheckCircle className="w-3 h-3" /> Verified
                        </div>
                    )}
                    {property.isNew && (
                        <Badge variant="default" className="w-fit">New</Badge>
                    )}
                </div>

                <div className="absolute bottom-4 right-4">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-xs font-bold text-black shadow-sm border border-black/10">
                        <Shield className="w-3 h-3 text-primary" /> {property.trustScore}% Trust Score
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4" /> {property.location}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-6">
                    <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded">
                        <Bed className="w-3.5 h-3.5" /> {property.bedrooms} Bed
                    </div>
                    <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded">
                        <Bath className="w-3.5 h-3.5" /> {property.bathrooms} Bath
                    </div>
                    <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded">
                        <Move className="w-3.5 h-3.5" /> {property.sizeSqM}m²
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                        <span className="font-bold text-xl text-primary">{formatPrice(property.price)}</span>
                        {property.period && <span className="text-xs text-muted-foreground font-normal">/{property.period}</span>}
                    </div>
                    <Link href={`/properties/${property.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-black border-primary/20">Details</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
