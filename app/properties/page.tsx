"use client"

import { useState } from "react"
import { PropertyCard } from "@/components/property/PropertyCard"
import { properties } from "@/lib/mockData"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Search, SlidersHorizontal, Map as MapIcon, List, Check } from "lucide-react"

export default function PropertiesPage() {
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [priceRange, setPriceRange] = useState<number>(5000000); // Mock state

    // Mock filtering logic
    const filteredProperties = properties.filter(p => {
        if (filterType !== 'all' && p.type !== filterType) return false;
        return true;
    });

    const amenities = ["Swimming Pool", "Gym", "24/7 Power", "Security", "WiFi", "Parking"];

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container px-4 md:px-6">

                {/* Header & Main Controls */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Find Your Place</h1>
                        <p className="text-muted-foreground">Trusted homes for rent, sale, and short stays.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-8 h-fit sticky top-24">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </h3>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <label className="text-sm font-medium mb-3 block">Property Type</label>
                                <div className="space-y-2">
                                    {['all', 'rent', 'buy', 'shortlet'].map((type) => (
                                        <div key={type} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                id={type}
                                                checked={filterType === type}
                                                onChange={() => setFilterType(type)}
                                                className="mr-2 accent-primary"
                                            />
                                            <label htmlFor={type} className="text-sm capitalize cursor-pointer text-muted-foreground hover:text-foreground">{type}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Mock */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium">Max Price</label>
                                    <span className="text-xs text-muted-foreground">₦{priceRange.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="100000"
                                    max="10000000"
                                    step="100000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">Amenities</label>
                                <div className="space-y-2">
                                    {amenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center">
                                            <div className="w-4 h-4 rounded border border-input flex items-center justify-center mr-2">
                                                {/* Mock checkbox state */}
                                            </div>
                                            <label className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">{amenity}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {/* View Toggle Bar */}
                        <div className="flex justify-between items-center mb-6 bg-muted/20 p-2 rounded-lg border border-border">
                            <span className="text-sm text-muted-foreground px-2">Showing <strong>{filteredProperties.length}</strong> verified properties</span>
                            <div className="flex bg-background rounded-md border border-border p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <List className="w-4 h-4" /> List
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <MapIcon className="w-4 h-4" /> Map
                                </button>
                            </div>
                        </div>

                        {viewMode === 'list' ? (
                            filteredProperties.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredProperties.map(property => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center border-2 border-dashed border-muted rounded-2xl">
                                    <h3 className="text-xl font-bold mb-2">No properties found</h3>
                                    <p className="text-muted-foreground">Try adjusting your filters.</p>
                                </div>
                            )
                        ) : (
                            <div className="h-[600px] w-full bg-muted/50 rounded-2xl border border-border flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/3.3792,6.5244,11,0/1000x800?access_token=pk.mock')] bg-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"></div>
                                <div className="bg-background/90 backdrop-blur px-6 py-4 rounded-xl shadow-xl z-10 text-center">
                                    <MapIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <h3 className="font-bold">Interactive Map View</h3>
                                    <p className="text-sm text-muted-foreground">Map integration coming in next update.</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

            </div>
        </div>
    )
}
