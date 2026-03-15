"use client"

import { X, CheckCircle2, Shield, Clock, DollarSign, ArrowRight } from "lucide-react"
import type { PropertyListing } from "@/lib/property/types"
import Link from "next/link"

interface ServiceDetailModalProps {
  service: PropertyListing | null
  isOpen: boolean
  onClose: () => void
}

export function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  if (!isOpen || !service) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-[#0A0F1E] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left: Image/Hero area */}
        <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
          <img 
            src={service.images[0]} 
            alt={service.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent md:bg-gradient-to-r" />
          
          <div className="absolute bottom-6 left-6 right-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-[#00D4FF] text-[10px] font-bold uppercase tracking-widest mb-3">
               Verified Service
             </div>
             <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-white leading-tight">
               {service.title}
             </h2>
          </div>
        </div>

        {/* Right: Details area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="flex flex-wrap gap-8 mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <DollarSign size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Cost</span>
              </div>
              <p className="text-2xl font-bold text-white">${service.priceUsd.toLocaleString()}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Timeline</span>
              </div>
              <p className="text-2xl font-bold text-white">4-12 Days</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Security</span>
              </div>
              <p className="text-2xl font-bold text-white">99% Safe</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00D4FF] mb-3">Service Description</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {service.description || "Our team of experts will handle your relocation needs from start to finish. This service includes end-to-end documentation support, local advocacy, and verified partner coordination in your target city."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00D4FF] mb-3">What's Included</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Dedicated Case Manager",
                  "Document Legalization Support",
                  "Verified Local Partner Access",
                  "Arrival Strategy Report",
                  "Post-Move Settling-In Guide",
                  "24/7 Digital Dashboard Tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-[#00D4FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/contact?service=${encodeURIComponent(service.title)}`}
              onClick={onClose}
              className="px-8 py-4 rounded-xl bg-[#00D4FF] text-slate-900 font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 flex-1"
            >
              Request This Service <ArrowRight size={18} />
            </Link>
            <button 
              onClick={onClose}
              className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-semibold text-white flex-1"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
