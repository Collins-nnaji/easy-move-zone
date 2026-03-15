"use client"

import { useState } from "react"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { 
  CheckCircle2, User, ArrowRight, Globe, Shield, Home, 
  Briefcase, Sparkles, MapPin, Search, Plane
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { seedListings } from "@/lib/property/seed"
import { ServiceDetailModal } from "@/components/platform/ServiceDetailModal"
import type { PropertyListing } from "@/lib/property/types"

export default function IndividualLandingPage() {
  const [selectedService, setSelectedService] = useState<PropertyListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (service: PropertyListing) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  // Use seedListings as our available services
  const relocationServices = seedListings.slice(0, 4)

  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-[#0A0F1E]">
        {/* Rich Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80" 
            alt="Cityscape" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] via-transparent to-[#0A0F1E]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1E] via-[#0A0F1E]/60 to-transparent" />
        </div>

        {/* Floating Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-1/4 right-[10%] hidden lg:block z-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
                  <Plane size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Upcoming Move</p>
                  <p className="text-xs font-bold text-white">London → Singapore</p>
                </div>
             </div>
             <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="h-full bg-[#00D4FF]"
                />
             </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Sparkles size={14} /> The Future of Relocation
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-[var(--font-playfair)] text-6xl md:text-8xl font-bold leading-[0.9] mb-8"
            >
              We execute your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D4FF]">Global Transition.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-2xl"
            >
              EasyMoveZone isn't just a search engine. We are your end-to-end relocation crew — handling the visas, housing, and logistics in your new territory.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <button 
                onClick={() => openModal(seedListings[0])}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#00D4FF] text-slate-900 font-black text-lg hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(0,212,255,0.4)] flex items-center justify-center gap-2"
              >
                Start Moving <ArrowRight size={20} />
              </button>
              <Link href="/signup?type=individual" className="w-full sm:w-auto px-10 py-5 rounded-2xl border border-white/20 hover:bg-white/5 transition-all font-bold text-lg text-white flex items-center justify-center gap-2">
                <Search size={20} className="text-[#00D4FF]" /> Get Move Score™
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-16 flex items-center gap-8 text-slate-500"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">80+</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Strategic Cities</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">1k+</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Verified Partners</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">100%</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Execution Focused</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-[#0A0F1E] border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale contrast-125">
           <span className="text-2xl font-black font-[var(--font-playfair)] tracking-tighter italic">FINTECH HUB</span>
           <span className="text-2xl font-black font-[var(--font-playfair)] tracking-tighter italic">GLOBAL NOMAD</span>
           <span className="text-2xl font-black font-[var(--font-playfair)] tracking-tighter italic">VENTURE BEAT</span>
           <span className="text-2xl font-black font-[var(--font-playfair)] tracking-tighter italic">TECH NATION</span>
           <span className="text-2xl font-black font-[var(--font-playfair)] tracking-tighter italic">CAPITAL ONE</span>
        </div>
      </div>

      {/* Services Showcase */}
      <section className="bg-[#0A0F1E] py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00D4FF]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-[#00D4FF] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Relocation Execution</span>
              <h2 className="text-4xl md:text-6xl font-[var(--font-playfair)] font-bold mb-6 text-white">Relocation, Handled.</h2>
              <p className="text-xl text-slate-400">Software provides the roadmap; our experts provide the key. Explore our move execution services.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relocationServices.map((service, i) => (
              <motion.div 
                key={service.id}
                whileHover={{ y: -8 }}
                onClick={() => openModal(service)}
                className="group relative h-[400px] rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 cursor-pointer shadow-xl transition-all"
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                  <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-6 group-hover:bg-[#00D4FF] group-hover:text-slate-900 transition-colors">
                     {i === 0 && <Shield size={24} />}
                     {i === 1 && <Home size={24} />}
                     {i === 2 && <Briefcase size={24} />}
                     {i >= 3 && <Globe size={24} />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{service.title}</h3>
                  <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-6">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-[#00D4FF] text-sm font-bold uppercase tracking-widest mt-auto">
                    View Details <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="bg-slate-950 py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-[var(--font-playfair)] font-bold mb-8 leading-tight text-white">
                The End-to-End <br/>
                <span className="text-[#00D4FF]">Relocation Platform</span>
              </h2>
              <div className="space-y-12">
                {[
                  {
                    step: "01",
                    title: "Discover Your Move Score™",
                    desc: "Complete our data-heavy intake. Our engine ranks 80+ global cities across safety, tax, and property verified inventory."
                  },
                  {
                    step: "02",
                    title: "Build Your Blueprint",
                    desc: "We generate a customized 90-Day Arrival Blueprint detailing every legal and logistical pivot required for your route."
                  },
                  {
                    step: "03",
                    title: "Execute The Move",
                    desc: "Tap into our verified experts. We handle your visas, source housing, and set up your local infrastructure."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-[var(--font-playfair)] text-[#00D4FF] group-hover:bg-[#00D4FF]/20 transition-colors">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{item.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[#00D4FF]/20 blur-[120px] rounded-full" />
              <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl">
                 <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                      <Shield size={40} />
                    </div>
                    <div>
                      <p className="text-xs text-[#00D4FF] uppercase tracking-[0.3em] font-black mb-1">Live Tracking</p>
                      <h3 className="text-3xl font-bold text-white">Relocation Active</h3>
                    </div>
                 </div>
                 
                 <div className="space-y-8 mb-12">
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-slate-400 font-bold text-sm uppercase">Verification Progress</p>
                       <p className="text-[#00D4FF] font-black text-xl">88%</p>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "88%" }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#00D4FF] to-white rounded-full" 
                       />
                    </div>
                 </div>

                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">AI</div>
                       <div>
                          <p className="text-sm font-bold text-white">Visa Bot Strategy</p>
                          <p className="text-xs text-slate-500">Processing your Tech Nation application...</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ServiceDetailModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PublicShell>
  )
}
