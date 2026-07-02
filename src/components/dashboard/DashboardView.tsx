"use client"

import { useState, useEffect } from "react"
import { Play, Clock, ArrowRight, Calendar, BarChart2, BookOpen, Layers, Award } from "lucide-react"
import { mockReports, mockCompanies, mockEvents } from "./mockData"

interface DashboardViewProps {
    userName: string
    onNavigate: (tab: string, arg?: string) => void
}

export function DashboardView({ userName, onNavigate }: DashboardViewProps) {
    const [lastRead, setLastRead] = useState({
        title: "Space Sector: Payload & Launch Systems",
        slug: "space-sector-launch-systems",
        progress: 35,
        readTime: "42 min read"
    })

    // Load actual reading progress if available in localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem("fpi-reader-progress")
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress)
                const report = mockReports.find(r => r.slug === parsed.slug)
                if (report) {
                    setLastRead({
                        title: report.title,
                        slug: report.slug,
                        progress: Math.round(parsed.percent),
                        readTime: report.readTime
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    return (
        <div className="space-y-12">
            
            {/* Top Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight font-sans">
                        Good Evening, {userName}
                    </h1>
                    <p className="text-sm text-neutral-400 font-light mt-1">
                        Continue building your investing knowledge. Your conviction compounds over time.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 font-mono text-[10px] text-gold font-bold">
                    <span>MEMBER TIER: PREMIER ACCESSPASS</span>
                </div>
            </div>

            {/* Main Dashboard Columns */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Readings & Library (8 columns) */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Continue Reading Card - Double Bezel */}
                    <div className="p-1 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl">
                        <div className="rounded-[1.8rem] bg-[#1E1E1E] border border-[#2E2E2E] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
                            
                            <div className="space-y-4 text-left max-w-lg">
                                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                                    <Clock className="w-3.5 h-3.5 text-gold" />
                                    <span>CONTINUE READING</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                    <span>{lastRead.readTime}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-snug">
                                    {lastRead.title}
                                </h2>
                                {/* Progress bar */}
                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                                        <span>READING PROGRESS</span>
                                        <span className="text-gold font-semibold">{lastRead.progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-[#2E2E2E] rounded-full overflow-hidden">
                                        <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${lastRead.progress}%` }} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate("research", lastRead.slug)}
                                className="group shrink-0 bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold px-6 py-3 rounded-full text-xs flex items-center gap-2 shadow-lg shadow-gold/5 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <span>Open Reader</span>
                                <ArrowRight className="w-4 h-4 text-bg-deep transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* Latest Research Grid */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gold" />
                                <span>Latest Capital Deep Dives</span>
                            </h3>
                            <button
                                onClick={() => onNavigate("research")}
                                className="text-xs text-gold hover:underline flex items-center gap-1 cursor-pointer font-mono"
                            >
                                <span>View Archive</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {mockReports.map((report) => (
                                <div 
                                    key={report.id}
                                    onClick={() => onNavigate("research", report.slug)}
                                    className="p-1 rounded-[1.8rem] bg-white/5 border border-white/5 shadow-md hover:border-gold/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="rounded-[1.6rem] bg-bg-deep border border-[#2E2E2E] p-6 flex flex-col justify-between h-full min-h-[180px]">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
                                                <span>{report.industry}</span>
                                                <span className="text-gold font-bold">{report.difficulty}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors leading-snug">
                                                {report.title}
                                            </h4>
                                            <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                                {report.excerpt}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[#2E2E2E]/60 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                            <span>{report.readTime}</span>
                                            <span>{report.publishedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recently Updated Companies */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gold" />
                                <span>Living Company Pages</span>
                            </h3>
                            <button
                                onClick={() => onNavigate("companies")}
                                className="text-xs text-gold hover:underline flex items-center gap-1 cursor-pointer font-mono"
                            >
                                <span>View Directory</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {mockCompanies.map((company) => (
                                <div 
                                    key={company.id}
                                    onClick={() => onNavigate("companies", company.id)}
                                    className="p-5 rounded-2xl border border-white/5 bg-[#1E1E1E] hover:border-gold/20 hover:bg-[#2E2E2E]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-xs text-gold font-bold">{company.ticker}</span>
                                            <span className="text-[10px] font-mono text-neutral-500 uppercase">{company.industry}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-text-primary">{company.name}</h4>
                                        <p className="text-xs text-neutral-400 font-light line-clamp-2">
                                            {company.summary}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-[#2E2E2E] flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                        <span>UPDATED: {company.updates[0].date}</span>
                                        <span className="text-gold">View Thesis ↗</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Side: Webinars, Activity, Pipelines (4 columns) */}
                <div className="lg:col-span-4 space-y-12">
                    
                    {/* Upcoming Webinar Banner */}
                    <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 shadow-md">
                        <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-6 relative overflow-hidden text-left space-y-4">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gold/10 rounded-full blur-2xl" />
                            
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gold/20 bg-gold/5 font-mono text-[9px] text-gold font-bold">
                                <Calendar className="w-3 h-3" />
                                <span>UPCOMING CALL</span>
                            </div>

                            <h3 className="text-base font-bold text-text-primary tracking-tight leading-snug">
                                {mockEvents[0].title}
                            </h3>

                            <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                {mockEvents[0].description}
                            </p>

                            <div className="text-[10px] font-mono text-neutral-500 border-t border-[#2E2E2E] pt-3 flex justify-between items-center">
                                <span>DATE: {mockEvents[0].date}</span>
                                <button
                                    onClick={() => onNavigate("events")}
                                    className="text-gold hover:underline cursor-pointer"
                                >
                                    Register ↗
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reading Activity Chart */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4 text-left">
                        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                            <BarChart2 className="w-4 h-4 text-gold" />
                            <span>Weekly Study Activity</span>
                        </h4>
                        
                        {/* Weekly stats summary */}
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold text-text-primary">4.8 Hrs</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">+18% vs Last Week</span>
                        </div>

                        {/* Interactive SVG Bar chart */}
                        <div className="h-24 w-full flex items-end justify-between pt-4 font-mono text-[9px] text-neutral-500">
                            {[1.2, 0.8, 1.5, 0.4, 2.1, 1.8, 0.6].map((hrs, idx) => {
                                const heightPercent = (hrs / 2.5) * 100
                                const day = ["M", "T", "W", "T", "F", "S", "S"][idx]
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-2.5 bg-neutral-800 rounded-t-sm h-16 relative flex items-end">
                                            <div 
                                                className="w-full bg-gold rounded-t-sm transition-all duration-1000"
                                                style={{ height: `${heightPercent}%` }}
                                            />
                                        </div>
                                        <span>{day}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Up-to-date Research Pipeline */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4 text-left">
                        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                            <Award className="w-4 h-4 text-gold" />
                            <span>Active Research Pipeline</span>
                        </h4>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-text-primary">
                                    <span>Railway Sub-systems</span>
                                    <span className="text-gold text-[10px] font-mono">75% Done</span>
                                </div>
                                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold" style={{ width: "75%" }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-text-primary">
                                    <span>Hydrogen fuel cells</span>
                                    <span className="text-neutral-500 text-[10px] font-mono">45% Done</span>
                                </div>
                                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-neutral-600" style={{ width: "45%" }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-text-primary">
                                    <span>Specialty APIs KSM</span>
                                    <span className="text-neutral-500 text-[10px] font-mono">20% Done</span>
                                </div>
                                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-neutral-600" style={{ width: "20%" }} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}
