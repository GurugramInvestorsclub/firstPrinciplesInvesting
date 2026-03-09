'use client';

import { Search } from 'lucide-react';
import { questionTopics } from '../validation/questionSchema';
import { QuestionStatus } from '@prisma/client';
import { useEffect, useRef } from 'react';

interface QuestionFiltersProps {
    search: string;
    setSearch: (v: string) => void;
    topic: string;
    setTopic: (v: string) => void;
    status: string;
    setStatus: (v: string) => void;
}

export function QuestionFilters({ search, setSearch, topic, setTopic, status, setStatus }: QuestionFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search questions, names, or emails... (Press '/')"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-bg-card border border-border-dim rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted transition-all"
                />
            </div>
            <div className="flex gap-4 sm:w-auto w-full">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-bg-card border border-border-dim rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold flex-1 sm:w-[150px]"
                >
                    <option value="">All Statuses</option>
                    <option value={QuestionStatus.PENDING}>Pending</option>
                    <option value={QuestionStatus.ANSWERED}>Answered</option>
                    <option value={QuestionStatus.ARCHIVED}>Archived</option>
                </select>

                <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-bg-card border border-border-dim rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-gold flex-1 sm:w-[180px]"
                >
                    <option value="">All Topics</option>
                    {questionTopics.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    );
}
