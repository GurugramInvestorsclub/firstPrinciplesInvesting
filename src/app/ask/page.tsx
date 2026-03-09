'use client';

import { useState } from 'react';
import { questionTopics } from '@/modules/questions/validation/questionSchema';
import { Button } from '@/components/ui/button'; // Assuming this exists based on Radix UI usage

export default function AskPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'General Investing',
        question: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, source: 'website' })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit question');
            }

            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                topic: 'General Investing',
                question: '',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-deep py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Ask Us Anything</h1>
                    <p className="text-text-secondary text-lg">
                        Have a question about investing, markets, or strategy? Drop it below and we might cover it in our next update.
                    </p>
                </div>

                <div className="bg-bg-card rounded-2xl p-8 border border-border-dim shadow-xl">
                    {success ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-text-primary mb-2">Question Submitted!</h3>
                            <p className="text-text-secondary mb-8">Thank you for your question. We'll review it shortly.</p>
                            <Button onClick={() => setSuccess(false)} variant="outline">Ask Another Question</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                                        Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-bg-deep border border-border-dim rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-gold focus:border-transparent transition-all outline-none"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-bg-deep border border-border-dim rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-gold focus:border-transparent transition-all outline-none"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-text-secondary mb-2">
                                    Topic *
                                </label>
                                <select
                                    name="topic"
                                    id="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-bg-deep border border-border-dim rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-gold focus:border-transparent transition-all outline-none"
                                >
                                    {questionTopics.map((topic) => (
                                        <option key={topic} value={topic}>
                                            {topic}
                                        </option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="question" className="block text-sm font-medium text-text-secondary">
                                        Your Question *
                                    </label>
                                    <span className="text-xs text-text-muted">{formData.question.length}/500</span>
                                </div>
                                <textarea
                                    name="question"
                                    id="question"
                                    rows={5}
                                    value={formData.question}
                                    onChange={handleChange}
                                    required
                                    maxLength={500}
                                    className="w-full bg-bg-deep border border-border-dim rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-gold focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="What's on your mind?"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || formData.question.length < 10}
                                className="w-full py-6 text-lg"
                            >
                                {loading ? 'Submitting...' : 'Submit Question'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
