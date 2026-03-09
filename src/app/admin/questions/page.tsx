'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuestionFilters } from '@/modules/questions/components/QuestionFilters';
import { QuestionTable } from '@/modules/questions/components/QuestionTable';
import { QuestionDrawer } from '@/modules/questions/components/QuestionDrawer';
import { Question, PaginatedQuestions } from '@/modules/questions/types';
import { Button } from '@/components/ui/button';

export default function AdminQuestionsPage() {
    const [data, setData] = useState<PaginatedQuestions | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [search, setSearch] = useState('');
    const [topic, setTopic] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Drawer state
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Debounced search helper (simple implementation)
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (debouncedSearch) query.append('search', debouncedSearch);
            if (topic) query.append('topic', topic);
            if (status) query.append('status', status);

            const res = await fetch(`/api/questions?${query.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                console.error('Failed to fetch questions');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, topic, status, page]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleRowClick = (question: Question) => {
        setSelectedQuestion(question);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        // Slight delay to allow animation to complete before clearing data
        setTimeout(() => setSelectedQuestion(null), 300);
    };

    const handleUpdate = async (id: string, updateData: any) => {
        try {
            const res = await fetch(`/api/questions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (res.ok) {
                const updatedQuestion = await res.json();
                // Update local state and drawer state
                if (selectedQuestion?.id === id) {
                    setSelectedQuestion(updatedQuestion);
                }
                await fetchQuestions();
            }
        } catch (error) {
            console.error('Error updating question:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/questions/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchQuestions();
                handleCloseDrawer();
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-text-primary">Questions Inbox</h1>
                <p className="text-text-secondary text-sm mt-1">Manage and respond to user questions.</p>
            </div>

            <QuestionFilters
                search={search}
                setSearch={(val) => { setSearch(val); setPage(1); }}
                topic={topic}
                setTopic={(val) => { setTopic(val); setPage(1); }}
                status={status}
                setStatus={(val) => { setStatus(val); setPage(1); }}
            />

            <QuestionTable
                questions={data?.questions || []}
                loading={loading}
                onRowClick={handleRowClick}
            />

            {data && data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-border-dim pt-4">
                    <div className="text-sm text-text-secondary">
                        Showing <span className="font-medium text-text-primary">{((page - 1) * limit) + 1}</span> to{' '}
                        <span className="font-medium text-text-primary">{Math.min(page * limit, data.total)}</span> of{' '}
                        <span className="font-medium text-text-primary">{data.total}</span> entries
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={page === data.totalPages}
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <QuestionDrawer
                question={selectedQuestion}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </div>
    );
}
