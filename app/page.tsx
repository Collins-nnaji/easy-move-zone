"use client"

import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import { Shield, Search, MapPin, CheckCircle, Star, ArrowRight, Home as HomeIcon, Building2, Key, AlertTriangle, FileWarning, Frown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">

      {/* Hero Section - Premium Style */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center animate-fade-in"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-20 flex flex-col items-center text-center pt-20">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-sm">
              The New Standard <br /> for <span className="text-primary-foreground">Nigerian Real Estate.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
              Verify titles. Inspect remotely. Pay securely. <br />
              <span className="font-medium text-white">Buying and renting, reimagined for trust.</span>
            </p>
          </motion.div>

          {/* Floating Search Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-4xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6"
          >
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2 px-2">
              {['Buy', 'Rent', 'Shortlet', 'Commercial'].map((tab, i) => (
                <button key={tab} className={`px-2 py-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-12 gap-4">
              <div className="md:col-span-5 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="City, neighborhood, or landmark"
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                />
              </div>

              <div className="md:col-span-3">
                <select className="w-full h-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-gray-600 dark:text-gray-300">
                  <option>Property Type</option>
                  <option>Duplex</option>
                  <option>Apartment</option>
                  <option>Land</option>
                  <option>Warehouse</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select className="w-full h-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-gray-600 dark:text-gray-300">
                  <option>Max Price</option>
                  <option>₦1M</option>
                  <option>₦5M</option>
                  <option>₦50M</option>
                  <option>₦100M+</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Button size="lg" className="w-full h-full text-base font-bold shadow-lg shadow-primary/25">
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Brand Strip - Social Proof */}
      <div className="bg-white dark:bg-zinc-950 py-10 border-b border-border">
        <div className="container px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest opacity-70">Trusted by Nigeria's leading innovative teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Mock Logos - Replace with SVGs/Images */}
            <div className="font-black text-2xl tracking-tighter">PAYSTACK</div>
            <div className="font-black text-2xl tracking-tighter">FLUTTERWAVE</div>
            <div className="font-black text-2xl tracking-tighter">PIGGYVEST</div>
            <div className="font-black text-2xl tracking-tighter">ANDELA</div>
            <div className="font-black text-2xl tracking-tighter">Cowrywise</div>
          </div>
        </div>
      </div>

      {/* Comparison Section - The "Why" */}
      <Section className="py-28 bg-zinc-50 dark:bg-zinc-900/30 relative">
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        <div className="container px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold mb-4">
              <AlertTriangle className="w-3 h-3" /> THE PROBLEM
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-zinc-50 tracking-tight">Real estate is broken.</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Fake listings, faceless agents, and hidden fees have become the norm.
              <span className="text-foreground font-medium"> It shouldn't be this hard to find a place to belong.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: The Struggle */}
            <div>
              <div className="space-y-6">
                {[
                  { title: "Verification Fraud", desc: "Agents asking for 'registration fees' before viewing.", icon: FileWarning },
                  { title: "The 'Catfish' Effect", desc: "Properties that look nothing like the photos.", icon: Frown },
                  { title: "Title Issues", desc: "Paying for land that is already under litigation.", icon: AlertTriangle },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-card border border-border/50 hover:border-red-200 dark:hover:border-red-900/30 transition-colors shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Solution */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur-3xl opacity-30"></div>
              <div className="relative bg-zinc-900 dark:bg-black text-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                <Shield className="w-16 h-16 text-primary mb-8" />
                <h3 className="text-3xl font-bold mb-6">The EasyMove Guarantee</h3>
                <ul className="space-y-6 mb-10">
                  <li className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-secondary mt-1 min-w-[24px]" />
                    <div>
                      <h4 className="font-bold text-lg">100% Verified Inventory</h4>
                      <p className="text-zinc-400 text-sm">We don't just scrape listings. We visit, we verify, we validate.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-secondary mt-1 min-w-[24px]" />
                    <div>
                      <h4 className="font-bold text-lg">Escrow Protection</h4>
                      <p className="text-zinc-400 text-sm">Funds stay safe until you have keys in hand and contracts signed.</p>
                    </div>
                  </li>
                </ul>
                <Button size="lg" className="w-full bg-white text-black hover:bg-gray-200 border-none">
                  Start Your Search
                </Button>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* Featured Properties - Carousel Style */}
      <Section className="py-24 overflow-hidden">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Curated Collections</h2>
              <p className="text-muted-foreground">Handpicked properties for the discerning Nigerian.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">&larr;</Button>
              <Button variant="outline" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">&rarr;</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Premium Property Card 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-zinc-900 border border-white/20">
                  FOR SALE
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Banana Island Villa</h3>
                <div className="text-right">
                  <div className="font-bold text-lg">₦850M</div>
                </div>
              </div>
              <div className="text-muted-foreground text-sm flex gap-4">
                <span>5 Beds</span> • <span>6 Baths</span> • <span>Pool</span>
              </div>
            </div>

            {/* Premium Property Card 2 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-zinc-900 border border-white/20">
                  FOR RENT
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Eko Atlantic Apt</h3>
                <div className="text-right">
                  <div className="font-bold text-lg">₦15M<span className="text-sm font-medium text-muted-foreground">/yr</span></div>
                </div>
              </div>
              <div className="text-muted-foreground text-sm flex gap-4">
                <span>2 Beds</span> • <span>Modern</span> • <span>Sea View</span>
              </div>
            </div>

            {/* Premium Property Card 3 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-zinc-900 border border-white/20">
                  SHORTLET
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Victoria Island Loft</h3>
                <div className="text-right">
                  <div className="font-bold text-lg">₦120k<span className="text-sm font-medium text-muted-foreground">/night</span></div>
                </div>
              </div>
              <div className="text-muted-foreground text-sm flex gap-4">
                <span>1 Bed</span> • <span>Gym</span> • <span>24/7 Power</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials - Modern Grid */}
      <Section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="container px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Don't just take our word for it.</h2>
            <p className="text-xl text-zinc-400">Join thousands of Nigerians who have found their home with EasyMove.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex gap-1 text-primary mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-primary" />)}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"The level of transparency is unmatched. I saw the title documents before I even booked a viewing. incredible."</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-sm">OA</div>
                  <div>
                    <div className="font-bold">Oluwaseun A.</div>
                    <div className="text-xs text-zinc-500">Bought in Lekki</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

    </div>
  )
}
