'use client';

import { Question } from '../types';
import { Button } from '@/components/ui/button';
import { X, Trash2, Archive, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface QuestionDrawerProps {
    question: Question | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function QuestionDrawer({ question, isOpen, onClose, onUpdate, onDelete }: QuestionDrawerProps) {
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize answer when question changes
    if (question && answer === '' && question.answer) {
        setAnswer(question.answer);
    }

    if (!isOpen || !question) return null;

    const handleAnswer = async () => {
        setLoading(true);
        await onUpdate(question.id, { answer, status: 'ANSWERED' });
        setLoading(false);
    };

    const handleArchive = async () => {
        setLoading(true);
        await onUpdate(question.id, { status: 'ARCHIVED' });
        setLoading(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to permanently delete this question?')) {
            setLoading(true);
            await onDelete(question.id);
            setLoading(false);
            onClose();
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-bg-deep border-l border-border-dim z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } overflow-y-auto`}
            >
                <div className="flex items-center justify-between p-6 border-b border-border-dim sticky top-0 bg-bg-deep z-10">
                    <h2 className="text-lg font-semibold text-text-primary">Question Details</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete Question"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-text-muted mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                {question.status === 'PENDING' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                                {question.status === 'ANSWERED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {question.status === 'ARCHIVED' && <Archive className="w-4 h-4 text-text-muted" />}
                                <span className="text-text-primary font-medium capitalize">{question.status.toLowerCase()}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-text-muted mb-1">Source</div>
                            <div className="text-text-primary capitalize">{question.source || 'Website'}</div>
                        </div>
                        <div>
                            <div className="text-text-muted mb-1">Submitted By</div>
                            <div className="text-text-primary">{question.name || 'Anonymous'}</div>
                            <div className="text-text-muted text-xs">{question.email || 'No email provided'}</div>
                        </div>
                        <div>
                            <div className="text-text-muted mb-1">Date</div>
                            <div className="text-text-primary">
                                {new Date(question.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-text-muted mb-1">Topic</div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-[#2a2a2a] text-text-primary border border-border-dim">
                                {question.topic}
                            </span>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div>
                        <div className="text-text-muted text-sm mb-2">The Question</div>
                        <div className="p-4 bg-bg-card border border-border-dim rounded-lg text-text-primary text-base leading-relaxed whitespace-pre-wrap">
                            {question.question}
                        </div>
                    </div>

                    {/* Answer Editor */}
                    <div>
                        <div className="text-text-muted text-sm mb-2">Your Answer</div>
                        <textarea
                            className="w-full h-40 bg-bg-card border border-border-dim rounded-lg p-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-gold resize-none mb-4"
                            placeholder="Draft your answer here..."
                            value={answer || ''}
                            onChange={(e) => setAnswer(e.target.value)}
                        />

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleAnswer}
                                disabled={loading || !answer.trim() || (question.status === 'ANSWERED' && answer === question.answer)}
                                className="flex-1"
                            >
                                {question.status === 'ANSWERED' ? 'Update Answer' : 'Submit Answer'}
                            </Button>

                            {question.status !== 'ARCHIVED' && (
                                <Button
                                    onClick={handleArchive}
                                    disabled={loading}
                                    variant="outline"
                                    className="flex-none"
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
