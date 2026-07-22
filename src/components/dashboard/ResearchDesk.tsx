"use client"

import { useState, useEffect } from "react"
import { 
    Home, FileText, Layers, Calendar, 
    User, LogOut, Star, Sparkles, BookOpen
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { mockReports, mockEvents } from "./mockData"
import { HomeView } from "./HomeView"
import { MembersOnlyView } from "./MembersOnlyView"
import { FreeResearchView } from "./FreeResearchView"
import { ReaderView } from "./ReaderView"
import { EventsView } from "./EventsView"
import { IndustryResearchView } from "./IndustryResearchView"
import { ProfileView } from "./ProfileView"

interface ResearchDeskProps {
    userName: string
    userEmail: string
    subscriptionStatus: string
    subscriptionEnd?: string
    onSignOut: () => void
    initialPosts?: any[]
    initialUpcomingEvents?: any[]
    initialPastEvents?: any[]
    initialRecordings?: any[]
    initialNotes?: any[]
    hasSubscriptionAccess?: boolean
}

export function ResearchDesk({ 
    userName, 
    userEmail, 
    subscriptionStatus, 
    subscriptionEnd, 
    onSignOut,
    initialPosts = [],
    initialUpcomingEvents = [],
    initialPastEvents = [],
    initialRecordings = [],
    initialNotes = [],
    hasSubscriptionAccess = false
}: ResearchDeskProps) {
    const [activeTab, setActiveTab] = useState("home")
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [savedSlugs, setSavedSlugs] = useState<string[]>([])

    // Use actual sanity events first. Only fall back to mock data if Sanity is completely empty.
    const hasSanityEvents = initialUpcomingEvents.length > 0 || initialPastEvents.length > 0
    const posts = initialPosts.length > 0 ? initialPosts : mockReports
    const upcomingEvents = hasSanityEvents ? initialUpcomingEvents : mockEvents.filter(e => !e.recordingUrl)
    const pastEvents = hasSanityEvents ? initialPastEvents : mockEvents.filter(e => e.recordingUrl)


    // Load bookmarks from local storage
    useEffect(() => {
        const saved = localStorage.getItem("fpi-bookmarks")
        if (saved) {
            try {
                setSavedSlugs(JSON.parse(saved))
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    const toggleBookmark = (slug: string) => {
        let updated: string[] = []
        if (savedSlugs.includes(slug)) {
            updated = savedSlugs.filter(item => item !== slug)
        } else {
            updated = [...savedSlugs, slug]
        }
        setSavedSlugs(updated)
        localStorage.setItem("fpi-bookmarks", JSON.stringify(updated))
    }

    const handleNavigate = (tabId: string, argId?: string) => {
        setActiveTab(tabId)
        if (argId !== undefined) {
            setSelectedId(argId)
        } else {
            setSelectedId(null)
        }
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "members-only", label: "Members Only", icon: Star },
        { id: "free-research", label: "Free Research", icon: BookOpen },
        { id: "events", label: "Events", icon: Calendar },
        { id: "industry-research", label: "Industry Research", icon: Layers, isComingSoon: true }
    ]

    return (
        <div className="flex bg-bg-deep min-h-screen relative text-text-primary text-sm antialiased font-sans">
            
            {/* 1. Desktop Persistent Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-bg-deep fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col justify-between py-8 px-6 text-left select-none">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-white/5 pb-6">
                        <Sparkles className="w-5 h-5 text-gold fill-gold/20 shrink-0" />
                        <span className="font-bold tracking-tight text-base text-text-primary font-mono uppercase">
                            Research Desk
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-1 text-xs font-mono">
                        {navItems.map(item => {
                            const NavIcon = item.icon
                            const isActive = activeTab === item.id

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                                        isActive 
                                            ? "bg-[#2E2E2E] text-gold font-bold border border-gold/10" 
                                            : "text-neutral-400 hover:text-text-primary hover:bg-[#1E1E1E]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <NavIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold" : "text-neutral-500"}`} />
                                        <span className="tracking-tight uppercase">{item.label}</span>
                                    </div>
                                    {item.isComingSoon && (
                                        <span className="text-[8px] bg-white/5 border border-white/10 text-neutral-500 px-1.5 py-0.5 rounded uppercase">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer Section */}
                <div className="space-y-4 font-mono text-[10px] text-neutral-500 border-t border-white/5 pt-6">
                    <button
                        onClick={() => handleNavigate("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                            activeTab === "profile" 
                                ? "bg-[#2E2E2E] text-gold border border-gold/10" 
                                : "text-neutral-400 hover:text-text-primary hover:bg-[#1E1E1E]"
                        }`}
                    >
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="uppercase">Profile</span>
                    </button>
                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-[#1E1E1E] transition-colors cursor-pointer text-left"
                    >
                        <LogOut className="w-4 h-4 text-neutral-500 hover:text-rose-400" />
                        <span className="uppercase">Logout</span>
                    </button>
                </div>
            </aside>

            {/* 2. Main Content Frame (padded on left for desktop sidebar, bottom for mobile nav) */}
            <div className="flex-1 lg:pl-64 pb-20 lg:pb-0 min-h-screen flex flex-col">
                {/* Desktop top header banner / navbar */}
                <header className="sticky top-[10px] z-20 flex flex-col items-center transition-all duration-500 px-6 py-2 select-none w-full max-w-5xl mx-auto">
                    <div className="w-full h-14 md:h-16 rounded-full border border-white/10 bg-bg-deep/90 backdrop-blur-xl shadow-lg flex items-center justify-between px-6 font-mono text-[10px]">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/logo.png"
                                        alt="First Principles Investing Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <span className="text-text-primary hidden xl:inline text-xs font-bold uppercase tracking-wider">First Principles <span className="text-gold">Investing</span></span>
                                <span className="text-text-primary xl:hidden text-xs font-bold uppercase tracking-wider">FP <span className="text-gold">Investing</span></span>
                            </Link>
                            <span className="text-neutral-700">|</span>
                            <nav className="flex items-center gap-5 text-neutral-400">
                                <Link href="/insights" className="hover:text-gold transition-colors">INSIGHTS</Link>
                                <Link href="/events" className="hover:text-gold transition-colors">PUBLIC EVENTS</Link>
                                <Link href="/super30" className="hover:text-gold transition-colors">SUPER 30</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4 text-neutral-400">
                            <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full text-[8px] border border-emerald-500/20">
                                {subscriptionStatus} Member
                            </span>
                            <span className="text-neutral-700">|</span>
                            <span className="uppercase tracking-widest text-neutral-400 font-bold bg-[#2E2E2E] px-3.5 py-1.5 rounded-full border border-white/5">
                                MEMBERS AREA
                            </span>
                        </div>
                    </div>
                </header>

                {/* Mobile top header banner / navbar */}
                <header className="sticky top-[10px] z-20 flex flex-col items-center transition-all duration-500 px-4 py-2 select-none lg:hidden w-full">
                    <div className="w-full h-12 rounded-full border border-white/10 bg-bg-deep/90 backdrop-blur-xl shadow-lg flex items-center justify-between px-4 font-mono text-[9px]">
                        <Link href="/" className="font-bold tracking-tight text-neutral-300 hover:text-white flex items-center gap-1.5">
                            <div className="relative w-5 h-5">
                                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span>FP <span className="text-gold">INVESTING</span></span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/insights" className="text-neutral-400 hover:text-gold font-bold">INSIGHTS</Link>
                            <span className="text-neutral-700">|</span>
                            <span className="text-emerald-400 font-bold text-[8px] bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                                MEMBER
                            </span>
                        </div>
                    </div>
                </header>



                {/* Tab Render Area */}
                <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">
                    {activeTab === "home" && (
                        <HomeView userName={userName} onNavigate={handleNavigate} posts={posts} upcomingEvents={upcomingEvents} />
                    )}

                    {(activeTab === "members-only" || activeTab === "free-research") && (
                        selectedId ? (
                            <ReaderView 
                                slug={selectedId} 
                                onBack={() => setSelectedId(null)} 
                                isBookmarked={savedSlugs.includes(selectedId)}
                                onToggleBookmark={toggleBookmark}
                                posts={posts}
                                hasSubscriptionAccess={hasSubscriptionAccess}
                                onNavigate={handleNavigate}
                            />
                        ) : activeTab === "members-only" ? (
                            <MembersOnlyView 
                                onSelectReport={(slug) => handleNavigate("members-only", slug)}
                                posts={posts}
                                hasSubscriptionAccess={hasSubscriptionAccess}
                                recordings={initialRecordings}
                                notes={initialNotes}
                            />
                        ) : (
                            <FreeResearchView 
                                onSelectReport={(slug) => handleNavigate("free-research", slug)}
                                posts={posts}
                            />
                        )
                    )}

                    {activeTab === "events" && (
                        <EventsView upcomingEvents={upcomingEvents} pastEvents={pastEvents} hasSubscriptionAccess={hasSubscriptionAccess} onNavigate={handleNavigate} />
                    )}


                    {activeTab === "industry-research" && (
                        <IndustryResearchView />
                    )}

                    {activeTab === "profile" && (
                        <ProfileView 
                            userName={userName}
                            userEmail={userEmail}
                            subscriptionStatus={subscriptionStatus}
                            subscriptionEnd={subscriptionEnd}
                            onSignOut={onSignOut}
                        />
                    )}
                </main>
            </div>

            {/* 3. Mobile Bottom Navigation Bar (Visible only on < lg screen sizes) */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-bg-deep/95 backdrop-blur-xl py-3 px-4 lg:hidden flex justify-around select-none">
                {navItems.slice(0, 4).map(item => {
                    const NavIcon = item.icon
                    const isActive = activeTab === item.id

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                                isActive ? "text-gold" : "text-neutral-500 hover:text-text-primary"
                            }`}
                        >
                            <NavIcon className="w-5 h-5" />
                            <span className="text-[9px] font-mono uppercase tracking-wider">{item.label.split(" ")[0]}</span>
                        </button>
                    )
                })}
                {/* Mobile settings trigger */}
                <button
                    onClick={() => handleNavigate("profile")}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                        activeTab === "profile" ? "text-gold" : "text-neutral-500 hover:text-text-primary"
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Profile</span>
                </button>
            </nav>

        </div>
    )
}

