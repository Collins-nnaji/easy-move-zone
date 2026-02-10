"use client"

import { PropertyCard } from "@/components/property/PropertyCard"
import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton"
import { properties } from "@/lib/mockData"
import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import { Search, TrendingUp, MapPin, ArrowUpRight, Calculator, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function BuyPage() {
    const buyProperties = properties.filter(p => p.type === 'buy');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCalculator, setShowCalculator] = useState(false);

    // Mortgage Calculator State
    const [calculatorPrice, setCalculatorPrice] = useState(45000000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(16);
    const [loanYears, setLoanYears] = useState(15);

    // Mortgage Calculations
    const downPaymentAmount = calculatorPrice * (downPaymentPercent / 100);
    const loanAmount = calculatorPrice - downPaymentAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanYears * 12;
    const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const totalInterest = monthlyPayment * 12 * loanYears - loanAmount;
    const totalCost = monthlyPayment * 12 * loanYears + downPaymentAmount;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // Stats Data
    const marketStats = [
        { label: "Avg. Price in Lekki", value: "₦120M", change: "+5.2%", positive: true },
        { label: "New Listings Today", value: "24", change: "+12", positive: true },
        { label: "Properties Sold", value: "1,204", change: "This Month", positive: true },
    ];

    // Popular Locations - Major Cities Across Nigeria
    const locations = [
        // Lagos State
        { name: "Ikoyi", state: "Lagos", image: "https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=300&auto=format&fit=crop", count: 45 },
        { name: "Victoria Island", state: "Lagos", image: "https://images.unsplash.com/photo-1549144511-30c51724f3f3?q=80&w=300&auto=format&fit=crop", count: 82 },
        { name: "Lekki Phase 1", state: "Lagos", image: "https://images.unsplash.com/photo-1542646399-6e3cd094396b?q=80&w=300&auto=format&fit=crop", count: 120 },
        { name: "Ikeja GRA", state: "Lagos", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=300&auto=format&fit=crop", count: 34 },
        { name: "Banana Island", state: "Lagos", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop", count: 18 },

        // FCT Abuja
        { name: "Maitama", state: "Abuja", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=300&auto=format&fit=crop", count: 56 },
        { name: "Asokoro", state: "Abuja", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop", count: 42 },
        { name: "Wuse 2", state: "Abuja", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=300&auto=format&fit=crop", count: 67 },
        { name: "Gwarinpa", state: "Abuja", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop", count: 89 },

        // Rivers State
        { name: "GRA Port Harcourt", state: "Rivers", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=300&auto=format&fit=crop", count: 38 },
        { name: "Old GRA", state: "Rivers", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=300&auto=format&fit=crop", count: 29 },

        // Oyo State
        { name: "Bodija", state: "Ibadan", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=300&auto=format&fit=crop", count: 31 },
        { name: "Jericho", state: "Ibadan", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=300&auto=format&fit=crop", count: 24 },

        // Enugu State
        { name: "GRA Enugu", state: "Enugu", image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?q=80&w=300&auto=format&fit=crop", count: 22 },
        { name: "Independence Layout", state: "Enugu", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=300&auto=format&fit=crop", count: 19 },

        // Kano State
        { name: "Nassarawa GRA", state: "Kano", image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?q=80&w=300&auto=format&fit=crop", count: 27 },
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans bg-zinc-50 dark:bg-black">

            {/* Hero / Header - Compact */}
            <section className="pt-28 pb-6 px-4 bg-white dark:bg-zinc-900 border-b border-border">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 text-foreground">
                                Buy Premium Property
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Browse 450+ verified homes for sale in Lagos.
                            </p>
                        </div>

                        {/* Market Pulse - Compact */}
                        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {marketStats.map((stat, i) => (
                                <div key={i} className="min-w-[120px] p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border flex-shrink-0">
                                    <div className="text-[10px] text-muted-foreground font-medium mb-0.5">{stat.label}</div>
                                    <div className="text-base font-bold flex items-end gap-1.5">
                                        {stat.value}
                                        <span className={`text-[9px] mb-0.5 font-bold ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Search & Filter Bar - Compact */}
            <div className="sticky top-20 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border py-3 px-4 transition-all">
                <div className="container mx-auto flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by location, type..."
                            className="w-full pl-9 pr-4 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm text-sm"
                        />
                    </div>

                    <div className="hidden md:flex gap-2">
                        <select className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-sm">
                            <option>Price Range</option>
                            <option>Under 50M</option>
                            <option>50M - 100M</option>
                            <option>100M+</option>
                        </select>
                        <select className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-sm">
                            <option>Property Type</option>
                            <option>House</option>
                            <option>Land</option>
                            <option>Commercial</option>
                        </select>
                        <Button size="sm" className="h-10 px-6">Search</Button>
                    </div>

                    {/* Calculator Toggle Button */}
                    <button
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={`h-10 px-4 flex items-center gap-2 rounded-lg border transition-all ${showCalculator
                            ? 'bg-primary text-white border-primary'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <Calculator className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">Calculator</span>
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-foreground"
                    >
                        <TrendingUp className="w-4 h-4 rotate-90" />
                    </button>
                </div>

                {showFilters && (
                    <div className="md:hidden pt-3 pb-2 container mx-auto animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="grid grid-cols-2 gap-2">
                            <select className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black outline-none text-sm">
                                <option>Price Range</option>
                                <option>Under 50M</option>
                                <option>50M - 100M</option>
                                <option>100M+</option>
                            </select>
                            <select className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black outline-none text-sm">
                                <option>Property Type</option>
                                <option>House</option>
                                <option>Land</option>
                                <option>Commercial</option>
                            </select>
                            <Button size="sm" className="col-span-2 h-10">Apply Filters</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mortgage Calculator Sidebar */}
            <AnimatePresence>
                {showCalculator && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCalculator(false)}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-900 z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-border p-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-bold">Mortgage Calculator</h2>
                                <button onClick={() => setShowCalculator(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6">
                                {/* Inputs */}
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-bold mb-2 block">Property Value</span>
                                        <input
                                            type="number"
                                            value={calculatorPrice}
                                            onChange={(e) => setCalculatorPrice(Number(e.target.value))}
                                            className="w-full p-2.5 rounded-lg border border-input bg-background font-mono text-base focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1 text-right">{formatCurrency(calculatorPrice)}</div>
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold mb-2 block">Down Payment ({downPaymentPercent}%)</span>
                                        <input
                                            type="range"
                                            min="10" max="80" step="5"
                                            value={downPaymentPercent}
                                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                                            className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1 text-right">{formatCurrency(downPaymentAmount)}</div>
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold mb-2 block">Interest Rate ({interestRate}%)</span>
                                        <input
                                            type="range"
                                            min="1" max="30" step="0.5"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(Number(e.target.value))}
                                            className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold mb-2 block">Loan Term ({loanYears} Years)</span>
                                        <input
                                            type="range"
                                            min="5" max="30" step="1"
                                            value={loanYears}
                                            onChange={(e) => setLoanYears(Number(e.target.value))}
                                            className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                        />
                                    </label>
                                </div>

                                {/* Results */}
                                <div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 p-4 rounded-xl">
                                    <div className="text-xs font-medium text-muted-foreground mb-1">Monthly Payment</div>
                                    <div className="text-3xl font-black text-primary tracking-tight">{formatCurrency(monthlyPayment)}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-card p-3 rounded-lg border border-border">
                                        <div className="text-[10px] text-muted-foreground mb-1">Loan Amount</div>
                                        <div className="text-sm font-bold">{formatCurrency(loanAmount)}</div>
                                    </div>
                                    <div className="bg-card p-3 rounded-lg border border-border">
                                        <div className="text-[10px] text-muted-foreground mb-1">Total Interest</div>
                                        <div className="text-sm font-bold">{formatCurrency(totalInterest)}</div>
                                    </div>
                                    <div className="bg-card p-3 rounded-lg border border-border col-span-2">
                                        <div className="text-[10px] text-muted-foreground mb-1">Total Cost</div>
                                        <div className="text-sm font-bold">{formatCurrency(totalCost)}</div>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full">Get Pre-Qualified</Button>

                                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                    <h3 className="font-bold mb-3 text-sm">Partner Banks</h3>
                                    <div className="flex flex-wrap gap-3 text-xs font-bold opacity-60">
                                        <span>GTBank</span>
                                        <span>Access</span>
                                        <span>Zenith</span>
                                        <span>FirstBank</span>
                                        <span>UBA</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Popular Locations - Compact */}
            <Section className="py-6 border-b border-border bg-white/50 dark:bg-zinc-900/50">
                <div className="container px-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Popular Areas Across Nigeria</h3>
                        <a href="#" className="text-primary text-xs font-bold flex items-center hover:underline">View All <ArrowUpRight className="w-3 h-3 ml-1" /></a>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {locations.map((loc, i) => (
                            <div key={i} className="group relative min-w-[140px] md:min-w-[180px] h-[80px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 shadow-sm hover:shadow-md transition-all">
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors z-10"></div>
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${loc.image})` }}></div>
                                <div className="absolute bottom-2 left-2 z-20 text-white">
                                    <div className="font-bold text-sm leading-none">{loc.name}</div>
                                    <div className="text-[9px] opacity-75 mb-0.5">{loc.state}</div>
                                    <div className="text-[10px] opacity-90">{loc.count} Listings</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Listings Grid - Compact */}
            <Section className="py-6 md:py-8">
                <div className="container px-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <PropertyCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {buyProperties.length > 0 ? (
                                buyProperties.map(property => (
                                    <motion.div key={property.id} variants={itemVariants}>
                                        <PropertyCard property={property} />
                                    </motion.div>
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
                        </motion.div>
                    )}

                    {!isLoading && (
                        <div className="mt-8 text-center">
                            <Button variant="outline" size="lg" className="w-full md:w-auto min-w-[200px]">Load More Listings</Button>
                        </div>
                    )}
                </div>
            </Section>

        </div>
    )
}
