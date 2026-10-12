"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Video,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react"
import { Event } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface ActiveWebinarSectionProps {
  event?: Event
}

function formatEventDate(dateString?: string, startTime?: string) {
  if (!dateString) return { fullDate: "Upcoming", time: "Live Online" }
  try {
    const d = new Date(dateString)
    const weekday = d.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })
    const day = d.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" })
    const month = d.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })
    const year = d.toLocaleDateString("en-IN", { year: "numeric", timeZone: "Asia/Kolkata" })
    
    let timeStr = startTime || ""
    if (!timeStr) {
      const time = d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })
      timeStr = `${time} IST`
    }

    return {
      fullDate: `${weekday}, ${month} ${day}, ${year}`,
      time: timeStr,
    }
  } catch {
    return { fullDate: dateString, time: startTime || "Live Online" }
  }
}

export function ActiveWebinarSection({ event }: ActiveWebinarSectionProps) {
  if (!event) return null

  const { fullDate, time } = formatEventDate(event.date, event.startTime)
  const eventSlug = typeof event.slug === "string" ? event.slug : event.slug?.current || ""
  const eventUrl = eventSlug ? `/events/${eventSlug}` : "/events"
  const registerUrl = eventSlug ? `/events/${eventSlug}#register` : "/events"

  const highlights = (event.learningPoints || []).slice(0, 3)
  const speakerName = typeof event.speaker === "string" ? event.speaker : event.speaker?.name || "Rahul Rao"
  const speakerCredentials =
    typeof event.speaker === "object" && Array.isArray(event.speaker?.credentials)
      ? event.speaker.credentials.join(" • ")
      : "CFA Charterholder • Lead Analyst"

  return (
    <section className="py-20 md:py-28 bg-[#0B0B0E] border-t border-white/5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] bg-gold/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="container max-w-6xl px-4 sm:px-6 mx-auto relative z-10">
        {/* Double-bezel high-end container */}
        <div className="p-2 sm:p-3 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-sm">
          <div className="rounded-[2.2rem] bg-[#121216] border border-[#26262B] p-6 sm:p-10 md:p-14 relative overflow-hidden">
            
            {/* Luminous top gold sheen */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[100px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Details & Key Takeaways */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gold tracking-wider uppercase">
                      Featured Live Masterclass
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Registrations Open
                  </span>
                </div>

                {/* Title & Subheading */}
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                    {event.title}
                  </h2>
                  {event.subHeading && (
                    <p className="text-base sm:text-lg md:text-xl text-gold font-medium tracking-tight mt-2.5">
                      {event.subHeading}
                    </p>
                  )}
                </div>

                {/* Description */}
                {event.shortDescription && (
                  <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-xl line-clamp-3">
                    {event.shortDescription}
                  </p>
                )}

                {/* Date, Time & Mode Meta Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Date</div>
                      <div className="text-xs sm:text-sm font-semibold text-white">{fullDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Format & Time</div>
                      <div className="text-xs sm:text-sm font-semibold text-white">Live Online • {time}</div>
                    </div>
                  </div>
                </div>

                {/* Key Learning Highlights if available */}
                {highlights.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-gold font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>What You Will Discover:</span>
                    </div>
                    <div className="space-y-2">
                      {highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-white capitalize">{item.title}:</strong>{" "}
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speaker Strip & Price */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Led by {speakerName}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">{speakerCredentials}</div>
                    </div>
                  </div>

                  {event.price ? (
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-extrabold text-gold font-mono">
                        ₹{event.price.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Live + Q&A + Full Recording
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={registerUrl}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold hover:bg-gold-muted text-[#0B0B0E] font-bold text-sm tracking-wide transition-all duration-300 shadow-xl shadow-gold/15 hover:shadow-gold/25 hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    <span>Reserve Your Seat</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={eventUrl}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 hover:border-gold/30 text-sm font-semibold transition-all duration-300 text-center cursor-pointer"
                  >
                    <span>View Event Details</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Poster Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md group">
                  
                  {/* Subtle poster glow */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-gold/20 via-blue-500/10 to-gold/20 blur-xl opacity-50 group-hover:opacity-80 transition duration-700" />

                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#18181D] shadow-2xl">
                    {event.image ? (
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                        <Image
                          src={urlForImage(event.image).width(900).height(560).url()}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 font-mono text-[11px] font-semibold text-gold">
                            {fullDate}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Zoom Session
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[16/10] w-full bg-gradient-to-br from-bg-primary via-[#16161A] to-gold/10 p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-mono text-gold uppercase tracking-wider font-bold">
                            Live Briefing
                          </span>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{event.title}</div>
                          {event.subHeading && (
                            <div className="text-xs text-gold mt-1">{event.subHeading}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{fullDate}</div>
                      </div>
                    )}

                    {/* Bottom Quick-Proof Bar */}
                    <div className="p-4 bg-[#141418] border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-gold" />
                          <span>Strictly Fundamental &amp; Institutional Research</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Includes live Q&amp;A session, recording replay access, and comprehensive research slides.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
