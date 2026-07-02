"use client"

import { useState, useEffect } from "react"
import { 
    Home, FileText, Layers, Calendar, 
    User, LogOut, Star, Sparkles, BookOpen
} from "lucide-react"
import { mockReports } from "./mockData"
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
}

export function ResearchDesk({ userName, userEmail, subscriptionStatus, subscriptionEnd, onSignOut }: ResearchDeskProps) {
    const [activeTab, setActiveTab] = useState("home")
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [savedSlugs, setSavedSlugs] = useState<string[]>([])

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
                {/* Desktop top header banner */}
                <header className="h-16 border-b border-white/5 bg-bg-deep/80 backdrop-blur-md sticky top-0 z-20 px-8 hidden lg:flex items-center justify-between select-none font-mono text-[10px] text-neutral-500">
                    <span className="uppercase tracking-widest">
                        First Principles Investing
                    </span>
                    <span className="uppercase">
                        MEMBERS AREA
                    </span>
                </header>

                {/* Tab Render Area */}
                <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">
                    {activeTab === "home" && (
                        <HomeView userName={userName} onNavigate={handleNavigate} />
                    )}

                    {(activeTab === "members-only" || activeTab === "free-research") && (
                        selectedId ? (
                            <ReaderView 
                                slug={selectedId} 
                                onBack={() => setSelectedId(null)} 
                                isBookmarked={savedSlugs.includes(selectedId)}
                                onToggleBookmark={toggleBookmark}
                            />
                        ) : activeTab === "members-only" ? (
                            <MembersOnlyView 
                                onSelectReport={(slug) => handleNavigate("members-only", slug)}
                            />
                        ) : (
                            <FreeResearchView 
                                onSelectReport={(slug) => handleNavigate("free-research", slug)}
                            />
                        )
                    )}

                    {activeTab === "events" && (
                        <EventsView />
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
