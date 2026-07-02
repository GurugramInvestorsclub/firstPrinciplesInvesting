"use client"

import { useState, useEffect } from "react"
import { 
    LayoutDashboard, FileText, Layers, Landmark, 
    Calendar, Bookmark, User, Search, X, Star, Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { mockReports, mockCompanies, mockIndustries, mockEvents } from "./mockData"
import { DashboardView } from "./DashboardView"
import { ResearchLibraryView } from "./ResearchLibraryView"
import { ReaderView } from "./ReaderView"
import { IndustriesView } from "./IndustriesView"
import { CompaniesView } from "./CompaniesView"
import { EventsView } from "./EventsView"
import { BookmarksView } from "./BookmarksView"
import { ProfileView } from "./ProfileView"

interface ResearchDeskProps {
    userName: string
    userEmail: string
    subscriptionStatus: string
    subscriptionEnd?: string
    onSignOut: () => void
}

export function ResearchDesk({ userName, userEmail, subscriptionStatus, subscriptionEnd, onSignOut }: ResearchDeskProps) {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [savedSlugs, setSavedSlugs] = useState<string[]>([])
    
    // Spotlight Search state
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchCursor, setSearchCursor] = useState(0)

    // Load bookmarks from local storage on mount
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

    // Keyboard trigger listener for Cmd + K Spotlight Search
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setSearchOpen(prev => !prev)
            }
            if (e.key === "Escape") {
                setSearchOpen(false)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "research", label: "Research", icon: FileText },
        { id: "industries", label: "Industries", icon: Layers },
        { id: "companies", label: "Companies", icon: Landmark },
        { id: "events", label: "Events", icon: Calendar },
        { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
        { id: "profile", label: "Profile", icon: User }
    ]

    // Filtered results for Cmd+K search box
    const getSearchResults = () => {
        if (!searchQuery.trim()) return []
        const query = searchQuery.toLowerCase()
        const results: { category: string; label: string; action: () => void }[] = []

        // Memos
        mockReports.forEach(r => {
            if (r.title.toLowerCase().includes(query) || r.industry.toLowerCase().includes(query)) {
                results.push({
                    category: "Research Memos",
                    label: r.title,
                    action: () => {
                        setSelectedId(r.slug)
                        setActiveTab("research")
                        setSearchOpen(false)
                    }
                })
            }
        })

        // Companies
        mockCompanies.forEach(c => {
            if (c.name.toLowerCase().includes(query) || c.ticker.toLowerCase().includes(query)) {
                results.push({
                    category: "Company Directory",
                    label: `${c.name} (${c.ticker})`,
                    action: () => {
                        setSelectedId(c.id)
                        setActiveTab("companies")
                        setSearchOpen(false)
                    }
                })
            }
        })

        // Industries
        mockIndustries.forEach(ind => {
            if (ind.name.toLowerCase().includes(query)) {
                results.push({
                    category: "Industry Hubs",
                    label: ind.name,
                    action: () => {
                        setSelectedId(null) // Reset company subview to list hubs
                        setActiveTab("industries")
                        setSearchOpen(false)
                    }
                })
            }
        })

        return results
    }

    const searchResults = getSearchResults()

    // Spotlight cursor navigation controls
    useEffect(() => {
        if (!searchOpen) return
        setSearchCursor(0)
    }, [searchQuery, searchOpen])

    useEffect(() => {
        function handleSearchKeyControls(e: KeyboardEvent) {
            if (!searchOpen || searchResults.length === 0) return

            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSearchCursor(prev => (prev + 1) % searchResults.length)
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSearchCursor(prev => (prev - 1 + searchResults.length) % searchResults.length)
            } else if (e.key === "Enter") {
                e.preventDefault()
                searchResults[searchCursor].action()
            }
        }
        window.addEventListener("keydown", handleSearchKeyControls)
        return () => window.removeEventListener("keydown", handleSearchKeyControls)
    }, [searchOpen, searchResults, searchCursor])

    const handleNavigate = (tabId: string, argId?: string) => {
        setActiveTab(tabId)
        if (argId !== undefined) {
            setSelectedId(argId)
        } else {
            setSelectedId(null)
        }
    }

    return (
        <div className="flex bg-bg-deep min-h-screen relative text-text-primary text-sm">
            
            {/* 1. Desktop Persistent Sidebar */}
            <aside className="w-64 border-r border-[#2E2E2E] bg-bg-deep fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col justify-between py-8 px-6 text-left select-none">
                <div className="space-y-8">
                    {/* Brand header */}
                    <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-6">
                        <Star className="w-5 h-5 text-gold fill-gold/20 shrink-0" />
                        <span className="font-bold tracking-tight text-base text-text-primary">
                            Research <span className="text-gold">Desk</span>
                        </span>
                    </div>

                    {/* Member Greeting Summary */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest leading-none">MEMBER SESSION</div>
                        <div className="text-xs font-bold text-text-primary truncate">{userName}</div>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[8px] font-bold">ACTIVE</span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-1 text-xs font-mono">
                        {navigationItems.map(item => {
                            const NavIcon = item.icon
                            const isActive = activeTab === item.id

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                                        isActive 
                                            ? "bg-[#2E2E2E] text-gold font-bold border border-gold/10" 
                                            : "text-neutral-400 hover:text-text-primary hover:bg-[#1E1E1E]"
                                    }`}
                                >
                                    <NavIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold" : "text-neutral-500"}`} />
                                    <span className="tracking-tight uppercase">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer shortcut tags */}
                <div className="space-y-4 font-mono text-[10px] text-neutral-600 border-t border-[#2E2E2E] pt-6">
                    <button 
                        onClick={() => setSearchOpen(true)}
                        className="w-full flex items-center justify-between p-2 rounded bg-black/20 border border-white/5 text-left hover:border-gold/20 hover:text-gold transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5">
                            <Search className="w-3 h-3 text-neutral-500" />
                            <span>Quick Search</span>
                        </span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#2E2E2E] border border-[#2E2E2E] text-[8px]">⌘K</kbd>
                    </button>
                    <div>
                        <span>SUPPORT DIRECT LINE</span>
                        <div className="text-neutral-500 mt-1">support@firstprinciples.in</div>
                    </div>
                </div>
            </aside>

            {/* 2. Main Content Frame (padded on left for desktop sidebar, bottom for mobile nav) */}
            <div className="flex-1 lg:pl-64 pb-20 lg:pb-0 min-h-screen flex flex-col">
                {/* Desktop top header banner */}
                <header className="h-16 border-b border-[#2E2E2E] bg-bg-deep/80 backdrop-blur-md sticky top-0 z-20 px-8 hidden lg:flex items-center justify-between select-none">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                        Workspace · First Principles Investing
                    </span>
                    <button 
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-black/10 hover:border-gold/30 text-xs text-neutral-400 font-mono transition-colors cursor-pointer"
                    >
                        <Search className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Search (⌘K)</span>
                    </button>
                </header>

                {/* Tab Render Area */}
                <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
                    {activeTab === "dashboard" && (
                        <DashboardView userName={userName} onNavigate={handleNavigate} />
                    )}

                    {activeTab === "research" && (
                        selectedId ? (
                            <ReaderView 
                                slug={selectedId} 
                                onBack={() => setSelectedId(null)} 
                                isBookmarked={savedSlugs.includes(selectedId)}
                                onToggleBookmark={toggleBookmark}
                            />
                        ) : (
                            <ResearchLibraryView 
                                onSelectReport={(slug) => handleNavigate("research", slug)}
                                savedSlugs={savedSlugs}
                                onToggleBookmark={toggleBookmark}
                            />
                        )
                    )}

                    {activeTab === "industries" && (
                        <IndustriesView 
                            onSelectReport={(slug) => handleNavigate("research", slug)}
                            onSelectCompany={(id) => handleNavigate("companies", id)}
                        />
                    )}

                    {activeTab === "companies" && (
                        <CompaniesView 
                            selectedCompanyId={selectedId || undefined} 
                            onSelectReport={(slug) => handleNavigate("research", slug)}
                            onCloseCompany={() => setSelectedId(null)}
                        />
                    )}

                    {activeTab === "events" && (
                        <EventsView />
                    )}

                    {activeTab === "bookmarks" && (
                        <BookmarksView 
                            savedSlugs={savedSlugs}
                            onToggleBookmark={toggleBookmark}
                            onSelectReport={(slug) => handleNavigate("research", slug)}
                            onSelectCompany={(id) => handleNavigate("companies", id)}
                        />
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
            <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#2E2E2E] bg-bg-deep/95 backdrop-blur-xl py-3 px-4 lg:hidden flex justify-around select-none">
                {navigationItems.slice(0, 4).map(item => {
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
                            <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
                        </button>
                    )
                })}
                {/* Mobile 'More' dropdown menu trigger */}
                <button
                    onClick={() => handleNavigate("bookmarks")}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                        activeTab === "bookmarks" || activeTab === "events" || activeTab === "profile" 
                            ? "text-gold" 
                            : "text-neutral-500 hover:text-text-primary"
                    }`}
                >
                    <Bookmark className="w-5 h-5" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Saved</span>
                </button>
            </nav>

            {/* 4. Global Spotlight Command Search Overlay (⌘K Modal) */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: -10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-xl p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur shadow-2xl flex flex-col justify-stretch overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] overflow-hidden flex flex-col">
                                {/* Search Input */}
                                <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Search className="w-4 h-4 text-gold shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Type company, sector, memo title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent outline-none border-none text-text-primary text-sm font-sans placeholder-neutral-500"
                                            autoFocus
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setSearchOpen(false)}
                                        className="text-neutral-500 hover:text-text-primary"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Results display */}
                                <div className="max-h-72 overflow-y-auto p-2 no-scrollbar text-left font-mono text-xs">
                                    {searchQuery.trim() ? (
                                        searchResults.length > 0 ? (
                                            <div className="space-y-1">
                                                {searchResults.map((res, idx) => {
                                                    const isCursor = searchCursor === idx
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={res.action}
                                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer transition-colors ${
                                                                isCursor 
                                                                    ? "bg-gold text-bg-deep font-bold" 
                                                                    : "text-neutral-300 hover:bg-white/5"
                                                            }`}
                                                        >
                                                            <span>{res.label}</span>
                                                            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                                                                isCursor ? "bg-bg-deep/15 text-bg-deep" : "bg-[#2E2E2E] text-neutral-500"
                                                            }`}>{res.category}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-neutral-500 italic">No matching results found.</div>
                                        )
                                    ) : (
                                        <div className="p-6 space-y-4 font-sans font-light">
                                            <div>
                                                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold border-b border-[#2E2E2E] pb-1.5 mb-2">
                                                    Suggested Companies
                                                </span>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {mockCompanies.map(c => (
                                                        <button 
                                                            key={c.id} 
                                                            onClick={() => {
                                                                setSearchQuery(c.name)
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-neutral-400 hover:text-gold hover:border-gold/25 transition-colors cursor-pointer"
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold border-b border-[#2E2E2E] pb-1.5 mb-2">
                                                    Popular Industries
                                                </span>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {mockIndustries.map(i => (
                                                        <button 
                                                            key={i.id}
                                                            onClick={() => setSearchQuery(i.name)}
                                                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-neutral-400 hover:text-gold hover:border-gold/25 transition-colors cursor-pointer"
                                                        >
                                                            {i.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Keyboard navigation tips footer */}
                                <div className="p-3 border-t border-[#2E2E2E] bg-black/10 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex items-center justify-center w-4 h-4 bg-[#2E2E2E] border border-neutral-700 rounded text-[10px]">↑↓</span>
                                        <span>to navigate</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex items-center justify-center w-7 h-4 bg-[#2E2E2E] border border-neutral-700 rounded text-[9px]">ENTER</span>
                                        <span>to open</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex items-center justify-center w-5 h-4 bg-[#2E2E2E] border border-neutral-700 rounded text-[10px]">ESC</span>
                                        <span>to close</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
