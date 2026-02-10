"use client"

import { Button } from "@/components/ui/Button"
import { Section } from "@/components/ui/Section"
import Marquee from "@/components/ui/Marquee"
import { Shield, Search, MapPin, CheckCircle, Star, ArrowRight, Home as HomeIcon, Building2, Key, AlertTriangle, FileWarning, Frown, TrendingUp, PlayCircle, Lock } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("buy");

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-70"></div>
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/50"></div>
          {/* Gradient to smooth edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>
        </div>

        <div ref={targetRef} className="container px-4 md:px-6 relative z-20 flex flex-col items-center text-center pt-32">

          <motion.div
            style={{ opacity, scale }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-10 max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm mb-8 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce"></span>
              Verified Land Titles • Safe Rental Agreements • Escrow Protection
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl leading-[1.1]">
              Find your perfect <br />
              home in Nigeria.
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed mb-10 drop-shadow-md">
              Buy, Rent, Shortlet, or get a Mortgage. <br />
              <span className="text-white font-semibold">Zero catfish listings. Zero hidden fees.</span>
            </p>
          </motion.div>

          {/* Tabbed Search Interface - RESTORED & HIGH CONTRAST */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="bg-white dark:bg-zinc-900/95 rounded-3xl p-2 shadow-2xl border border-white/10 dark:border-zinc-800 backdrop-blur-sm">

              {/* Search Tabs */}
              <div className="flex flex-wrap gap-2 px-2 pt-2 mb-4">
                {[
                  { id: 'buy', label: 'Buy' },
                  { id: 'rent', label: 'Rent' },
                  { id: 'shortlet', label: 'Shortlet' },
                  { id: 'mortgage', label: 'Mortgage' },
                  { id: 'land', label: 'Land' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="City, Area (e.g. Lekki Phase 1)"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                </div>

                <div className="w-full md:w-[200px]">
                  <select className="w-full h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer">
                    <option value="">Type ({activeTab})</option>
                    <option value="duplex">Duplex</option>
                    <option value="terrace">Terrace</option>
                    <option value="flat">Apartment / Flat</option>
                    <option value="bungalow">Bungalow</option>
                  </select>
                </div>

                <div className="w-full md:w-[180px]">
                  <select className="w-full h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer">
                    <option value="">Budget</option>
                    <option value="low">Under ₦2M</option>
                    <option value="mid">₦2M - ₦10M</option>
                    <option value="high">₦10M - ₦100M</option>
                    <option value="luxury">₦100M+</option>
                  </select>
                </div>

                <div className="w-full md:w-auto">
                  <Button size="xl" className="w-full h-14 md:w-auto rounded-xl px-8 text-base font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                    <Search className="w-5 h-5 mr-2" /> Search
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Brand Strip - Infinite Marquee */}
      <div className="bg-white dark:bg-black py-10 border-b border-zinc-100 dark:border-zinc-900 relative z-10">
        <div className="container px-4 text-center mb-6">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Verified Payment Partners</p>
        </div>
        <Marquee pauseOnHover className="[--duration:40s]">
          {["PAYSTACK", "FLUTTERWAVE", "PIGGYVEST", "REMSA", "INTERSWITCH", "KUDABANK", "GTBANK", "FirstBank"].map((brand) => (
            <div key={brand} className="mx-8 opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0">
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">{brand}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Stats & Trust Section */}
      <Section className="py-16 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "15,000+", label: "Verified Properties", icon: Building2, color: "text-blue-600" },
              { value: "50,000+", label: "Happy Customers", icon: Star, color: "text-yellow-600" },
              { value: "99.8%", label: "Verification Rate", icon: Shield, color: "text-green-600" },
              { value: "<2hrs", label: "Avg Response Time", icon: TrendingUp, color: "text-purple-600" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center hover:shadow-lg transition-shadow"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl md:text-4xl font-black mb-1 text-zinc-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* The Reality (Problem vs Solution) - Sticky Scroll with Polish */}
      <Section className="py-24 bg-zinc-50 dark:bg-zinc-950">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* Sticky Content */}
            <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-6">
                <AlertTriangle className="w-3 h-3" /> THE NIGERIAN REALITY
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-zinc-900 dark:text-white">
                Looking for a house shouldn't feel like <span className="text-orange-600">war.</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                We've all heard the stories. Fake agents, "inspection fees", paying for a flat that 10 other people paid for. <br /><br />
                <span className="text-primary font-bold">EasyMoveZone stops the madness.</span>
              </p>
            </div>

            {/* Scrollable Comparisons */}
            <div className="lg:w-2/3 space-y-6">
              {[
                {
                  title: "No More 'Catfish'",
                  problem: "Photos from 2015 vs Reality of 2026.",
                  solution: "We take fresh 3D scans.",
                  desc: "If we show it, it exists. We verify the property condition ourselves.",
                  icon: Frown,
                  statusIcon: Star,
                  color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                },
                {
                  title: "No 'Agent Wahala'",
                  problem: "Rude agents demanding inspection fees.",
                  solution: "Zero inspection fees.",
                  desc: "Schedule a viewing online. Go see the house. No paying just to look.",
                  icon: FileWarning,
                  statusIcon: CheckCircle,
                  color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                },
                {
                  title: "No Story Stories",
                  problem: "Paying rent and hearing 'come back tomorrow'.",
                  solution: "Escrow Protection.",
                  desc: "Your money stays safe with us until you sign the papers and get the keys.",
                  icon: Lock,
                  statusIcon: Shield,
                  color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl shrink-0 ${item.color}`}>
                      <item.statusIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm">
                        <span className="text-red-500 line-through decoration-red-500/50 decoration-2 font-medium">{item.problem}</span>
                        <ArrowRight className="hidden sm:block w-4 h-4 text-zinc-300" />
                        <div className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> {item.solution}
                        </div>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works Section */}
      <Section className="py-24 bg-white dark:bg-black">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Finding your perfect home is easier than you think. Just three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Search & Discover",
                desc: "Browse verified properties across Nigeria. Filter by location, price, and type. Every listing is real.",
                icon: Search,
                color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              },
              {
                step: "02",
                title: "Verify & Visit",
                desc: "Schedule a free viewing. No inspection fees. Our team verifies every property before listing.",
                icon: CheckCircle,
                color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              },
              {
                step: "03",
                title: "Secure & Move In",
                desc: "Pay securely with escrow protection. Get your keys. Move into your new home with peace of mind.",
                icon: Key,
                color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.color} mb-6`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl font-black text-zinc-100 dark:text-zinc-900 -z-10">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-zinc-200 dark:bg-zinc-800" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Properties Grid */}
      <Section className="py-24 border-t border-zinc-100 dark:border-zinc-900">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Fresh on the Market</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-lg font-medium">
                Verified properties added in the last 24 hours.
              </p>
            </div>
            <Link href="/buy">
              <Button variant="outline" size="lg" className="group rounded-full border-zinc-300 dark:border-zinc-700">
                See All Listings <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Property Card 1 - Rent */}
            <div className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide text-zinc-900 shadow-sm border border-zinc-100">
                  FOR RENT
                </div>
                <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-2 py-1.5 rounded-full text-white">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60"
                  alt="Property"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">₦3,500,000<span className="text-sm font-medium text-white/80">/year</span></p>
                  <p className="text-sm text-white/90 flex items-center gap-1"><MapPin className="w-3 h-3" /> Lekki Phase 1, Lagos</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white truncate">3 Bedroom Serviced Apartment</h3>
                <div className="flex gap-4 text-sm text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <span className="flex items-center gap-1"><HomeIcon className="w-4 h-4 text-zinc-400" /> 3 Beds</span>
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-zinc-400" /> 4 Baths</span>
                  <span className="flex items-center gap-1">24h Power</span>
                </div>
              </div>
            </div>

            {/* Property Card 2 - Shortlet */}
            <div className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-primary/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide text-white shadow-sm">
                  SHORTLET
                </div>
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60"
                  alt="Property"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">₦150,000<span className="text-sm font-medium text-white/80">/night</span></p>
                  <p className="text-sm text-white/90 flex items-center gap-1"><MapPin className="w-3 h-3" /> Victoria Island, Lagos</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white truncate">Luxury Penthouse with Pool</h3>
                <div className="flex gap-4 text-sm text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <span className="flex items-center gap-1"><HomeIcon className="w-4 h-4 text-zinc-400" /> 2 Beds</span>
                  <span className="flex items-center gap-1">Ocean View</span>
                  <span className="flex items-center gap-1">WiFi</span>
                </div>
              </div>
            </div>

            {/* Property Card 3 - Sale */}
            <div className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-zinc-900/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide text-white shadow-sm border border-white/20">
                  FOR SALE
                </div>
                <div className="absolute top-4 right-4 z-10 bg-green-500/90 backdrop-blur px-2 py-1 rounded-full text-white text-[10px] font-bold">
                  C of O
                </div>
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60"
                  alt="Property"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">₦120,000,000</p>
                  <p className="text-sm text-white/90 flex items-center gap-1"><MapPin className="w-3 h-3" /> Sangotedo, Ajah</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-white truncate">Newly Built 4 Bed Semi-Detached</h3>
                <div className="flex gap-4 text-sm text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <span className="flex items-center gap-1"><HomeIcon className="w-4 h-4 text-zinc-400" /> 4 Beds</span>
                  <span className="flex items-center gap-1">BQ</span>
                  <span className="flex items-center gap-1">Gated Estate</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section className="py-24 bg-zinc-50 dark:bg-zinc-950">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">What Our Customers Say</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Real stories from Nigerians who found their perfect home.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Chioma Okafor",
                location: "Lekki, Lagos",
                rating: 5,
                text: "I was tired of fake agents and inspection fees. EasyMoveZone showed me exactly what I was paying for. Moved into my 3-bedroom in Lekki within 2 weeks!",
                type: "Rent",
                image: "https://i.pravatar.cc/150?img=5"
              },
              {
                name: "Emeka Nwosu",
                location: "Maitama, Abuja",
                rating: 5,
                text: "Bought my first property through EasyMoveZone. The escrow protection gave me peace of mind. No stories, no stress. Just smooth transactions.",
                type: "Buy",
                image: "https://i.pravatar.cc/150?img=12"
              },
              {
                name: "Aisha Mohammed",
                location: "Victoria Island, Lagos",
                rating: 5,
                text: "Needed a shortlet for my business trip. Found a beautiful penthouse in 10 minutes. The photos were EXACTLY what I got. No catfish!",
                type: "Shortlet",
                image: "https://i.pravatar.cc/150?img=9"
              },
              {
                name: "Tunde Bakare",
                location: "Ikeja GRA, Lagos",
                rating: 5,
                text: "The mortgage calculator helped me plan my finances. Got pre-qualified in 24 hours. Now I own a 4-bedroom duplex!",
                type: "Mortgage",
                image: "https://i.pravatar.cc/150?img=15"
              },
              {
                name: "Ngozi Adeyemi",
                location: "Enugu",
                rating: 5,
                text: "As a landlord, listing my properties was so easy. Professional photos, verified tenants, and zero wahala. Best decision ever.",
                type: "List Property",
                image: "https://i.pravatar.cc/150?img=20"
              },
              {
                name: "Ibrahim Yusuf",
                location: "Port Harcourt",
                rating: 5,
                text: "Found my dream home in Port Harcourt. The team was professional, responsive, and transparent. No hidden fees, just honest service.",
                type: "Buy",
                image: "https://i.pravatar.cc/150?img=33"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{testimonial.location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">"{testimonial.text}"</p>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{testimonial.type}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Mid-Page CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of Nigerians who trust EasyMoveZone for their property needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buy">
              <Button size="xl" className="bg-white text-primary hover:bg-zinc-100 font-bold h-14 px-10 rounded-full w-full sm:w-auto">
                <Search className="w-5 h-5 mr-2" /> Start Searching
              </Button>
            </Link>
            <Link href="/list">
              <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-10 rounded-full w-full sm:w-auto">
                <Building2 className="w-5 h-5 mr-2" /> List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900 dark:bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-50 dark:from-zinc-950 to-transparent"></div>
        </div>
        <div className="container px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              50,000+ Happy Customers
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Stop looking. Start living.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium">
              Your perfect home is waiting. Join thousands of Nigerians who found theirs on EasyMoveZone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" className="rounded-full px-12 bg-primary hover:bg-primary/90 text-white font-bold h-16 w-full sm:w-auto shadow-xl shadow-primary/25">
                  <HomeIcon className="w-5 h-5 mr-2" /> Create Free Account
                </Button>
              </Link>
              <Link href="/buy">
                <Button size="xl" variant="outline" className="rounded-full px-12 border-white/20 text-white hover:bg-white/10 h-16 w-full sm:w-auto">
                  <Search className="w-5 h-5 mr-2" /> Browse Listings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
