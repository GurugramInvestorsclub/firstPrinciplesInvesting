'use client';

import { Question } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, CheckCircle2, Archive } from 'lucide-react';

interface QuestionTableProps {
    questions: Question[];
    loading: boolean;
    onRowClick: (question: Question) => void;
}

export function QuestionTable({ questions, loading, onRowClick }: QuestionTableProps) {
    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center border border-border-dim rounded-lg bg-bg-card">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="w-full text-center py-16 border border-border-dim rounded-lg bg-bg-card">
                <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                <h3 className="text-text-primary font-medium">No questions found</h3>
                <p className="text-text-secondary text-sm mt-1">Try adjusting your filters or search term.</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
            case 'ANSWERED':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'ARCHIVED':
                return <Archive className="w-4 h-4 text-text-muted" />;
            default:
                return null;
        }
    };

    return (
        <div className="border border-border-dim rounded-lg overflow-hidden bg-bg-card text-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a1a1a]">
                    <tr>
                        <th className="px-4 py-3 font-medium text-text-secondary border-b border-border-dim">Status</th>
                        <th className="px-4 py-3 font-medium text-text-secondary border-b border-border-dim">Question</th>
                        <th className="px-4 py-3 font-medium text-text-secondary border-b border-border-dim">Topic</th>
                        <th className="px-4 py-3 font-medium text-text-secondary border-b border-border-dim">From</th>
                        <th className="px-4 py-3 font-medium text-text-secondary border-b border-border-dim">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-dim">
                    {questions.map((q) => (
                        <tr
                            key={q.id}
                            onClick={() => onRowClick(q)}
                            className="cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)] group"
                        >
                            <td className="px-4 py-3.5 align-top">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(q.status)}
                                    <span className="text-xs font-medium text-text-secondary capitalize">
                                        {q.status.toLowerCase()}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3.5 align-top max-w-[300px]">
                                <div className="text-text-primary truncate font-medium group-hover:text-gold transition-colors">
                                    {q.question}
                                </div>
                            </td>
                            <td className="px-4 py-3.5 align-top">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2a2a2a] text-text-secondary border border-border-dim">
                                    {q.topic}
                                </span>
                            </td>
                            <td className="px-4 py-3.5 align-top">
                                <div className="text-text-primary truncate max-w-[150px]">{q.name || 'Anonymous'}</div>
                                {q.email && <div className="text-text-muted text-xs truncate max-w-[150px]">{q.email}</div>}
                            </td>
                            <td className="px-4 py-3.5 align-top text-text-secondary whitespace-nowrap">
                                {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
