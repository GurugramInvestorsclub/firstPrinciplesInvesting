"use client"

import { useState, useEffect } from "react"
import { 
    Home, FileText, Layers, Calendar, 
    User, LogOut, Star, Sparkles, BookOpen, GitFork
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
    cancelAtCycleEnd?: boolean
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
    cancelAtCycleEnd = false,
    onSignOut,
    initialPosts = [],
    initialUpcomingEvents = [],
    initialPastEvents = [],
    initialRecordings = [],
    initialNotes = [],
    hasSubscriptionAccess = false
}: ResearchDeskProps) {
    const router = useRouter()
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
        if (argId) {
            router.push(`/insights/${argId}`)
            return
        }
        if (tabId === "demergers" || tabId === "demerger-tracker") {
            router.push("/demerger-tracker")
            return
        }
        setActiveTab(tabId)
        setSelectedId(null)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "members-only", label: "Members Only", icon: Star },
        { id: "free-research", label: "Free Research", icon: BookOpen },
        { id: "demergers", label: "Demerger Tracker", icon: GitFork },
        { id: "events", label: "Events", icon: Calendar },
        { id: "industry-research", label: "Industry Research", icon: Layers, isComingSoon: true }
    ]

    return (
        <div className="flex bg-bg-deep min-h-screen relative text-text-primary text-sm antialiased font-sans">
            
            {/* 1. Desktop Persistent Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-bg-deep fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col justify-between py-6 px-5 text-left select-none">
                <div className="space-y-6">
                    {/* Brand Logo & Title Header (Links to Home /) */}
                    <div className="border-b border-white/5 pb-5">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
                        >
                            <div className="relative w-7 h-7 shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="First Principles Investing Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-text-primary text-[11px] font-bold font-mono uppercase tracking-wider group-hover:text-gold transition-colors whitespace-nowrap">
                                First Principles <span className="text-gold">Investing</span>
                            </span>
                        </Link>
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
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                                        isActive 
                                            ? "bg-[#2E2E2E] text-gold font-bold border border-gold/10" 
                                            : "text-white hover:text-gold hover:bg-[#1E1E1E]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <NavIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold" : "text-white/80"}`} />
                                        <span className="tracking-tight uppercase text-[11px] whitespace-nowrap">{item.label}</span>
                                    </div>
                                    {item.isComingSoon && (
                                        <span className="text-[8px] bg-white/5 border border-white/10 text-neutral-400 px-1.5 py-0.5 rounded uppercase shrink-0 ml-1">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer Section */}
                <div className="space-y-2 font-mono text-[10px] text-neutral-500 border-t border-white/5 pt-4">
                    <button
                        onClick={() => handleNavigate("profile")}
                        className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer text-left ${
                            activeTab === "profile" 
                                ? "bg-[#2E2E2E] text-gold font-bold border border-gold/10" 
                                : "text-white hover:text-gold hover:bg-[#1E1E1E]"
                        }`}
                    >
                        <User className={`w-4 h-4 ${activeTab === "profile" ? "text-gold" : "text-white/80"}`} />
                        <span className="uppercase text-[11px]">Profile</span>
                    </button>
                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-white hover:text-rose-400 hover:bg-[#1E1E1E] transition-colors cursor-pointer text-left"
                    >
                        <LogOut className="w-4 h-4 text-white/80" />
                        <span className="uppercase text-[11px]">Logout</span>
                    </button>
                </div>
            </aside>

            {/* 2. Main Content Frame (padded on left for desktop sidebar, bottom for mobile nav) */}
            <div className="flex-1 lg:pl-64 pb-20 lg:pb-0 min-h-screen flex flex-col">
                {/* Mobile Header Bar */}
                <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-bg-deep/95 backdrop-blur-xl border-b border-white/5 select-none lg:hidden w-full">
                    <Link href="/" className="font-bold tracking-tight text-neutral-300 hover:text-white flex items-center gap-2">
                        <div className="relative w-6 h-6">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="text-xs font-mono uppercase font-bold">First Principles <span className="text-gold">Investing</span></span>
                    </Link>
                    <span className="text-emerald-400 font-bold text-[8px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
                        {subscriptionStatus}
                    </span>
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
                            cancelAtCycleEnd={cancelAtCycleEnd}
                            hasSubscriptionAccess={hasSubscriptionAccess}
                            onSignOut={onSignOut}
                        />
                    )}
                </main>
            </div>

            {/* 3. Mobile Bottom Navigation Bar (Visible only on < lg screen sizes) */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-bg-deep/95 backdrop-blur-xl py-3 px-4 lg:hidden flex justify-around select-none">
                {navItems.filter(item => !item.isComingSoon).map(item => {
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

