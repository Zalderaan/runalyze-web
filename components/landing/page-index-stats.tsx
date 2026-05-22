"use client"

import React, { useState, useEffect } from "react"
import { Eye } from "lucide-react"

export function PageIndexStats() {
  const [views, setViews] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate an API fetch with 1.2s latency
    const apiTimer = setTimeout(() => {
      setLoading(false)
      
      // Animate counting from 0 to 1100 (1.1k)
      let current = 0
      const target = 1100
      const duration = 800 // 800ms animation
      const stepTime = 16
      const totalSteps = duration / stepTime
      const increment = Math.ceil(target / totalSteps)

      const counterTimer = setInterval(() => {
        current += increment
        if (current >= target) {
          setViews(target)
          clearInterval(counterTimer)
        } else {
          setViews(current)
        }
      }, stepTime)
    }, 1200)

    return () => clearTimeout(apiTimer)
  }, [])

  // High-End Glassmorphic Stats Capsule Container
  return (
    <section className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="relative rounded-3xl bg-[#090D16] border border-slate-800/80 p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
        
        {/* High-end decorative blur glows */}
        <div className="absolute top-0 -left-10 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-10 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Modern Asymmetric Headline */}
        <div className="text-center md:text-left z-10 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mb-3 inline-block">
            Platform Status
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
            Intelligent running analysis for better performance.
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Empowering athletes with AI form feedback and automated training insights.
          </p>
        </div>

        {/* Right Side: High-Tech Floating Stats Pod */}
        <div className="z-10 bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-5 w-full md:w-auto min-w-[250px] text-center flex flex-col items-center justify-center min-h-[120px] transition-all hover:border-orange-500/25 duration-300 shadow-xl">
          {loading ? (
            // Shimmering skeleton container
            <div className="flex flex-col items-center gap-3.5 animate-pulse w-full">
              <div className="h-7 w-32 bg-orange-500/20 rounded-full"></div>
              <div className="h-3.5 w-24 bg-gray-800 rounded"></div>
            </div>
          ) : (
            // Fully loaded modern counters and wave sparkline
            <div className="flex flex-col items-center justify-center animate-fadeIn w-full">
              {/* Traffic pill container */}
              <div className="flex items-center gap-2 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 px-4 py-1.5 rounded-full transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Eye className="h-4 w-4 text-orange-500 stroke-[2.5]" />
                <span className="text-sm font-bold text-orange-500 tracking-wide font-mono">
                  {views === 1100 ? "1.1k+" : `${views?.toLocaleString()}`}
                </span>
              </div>
              
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-2.5">
                Live Page Visits
              </span>
              
              {/* Aesthetic decorative vector trend sparkline */}
              <svg className="w-24 h-5 mt-3 text-orange-500/35" viewBox="0 0 100 20" fill="none" aria-hidden="true">
                <path 
                  d="M0,15 Q15,4 30,12 T60,5 T90,14 L100,8" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
                <circle cx="100" cy="8" r="2.5" fill="#F97316" className="animate-pulse" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
