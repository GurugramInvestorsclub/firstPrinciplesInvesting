'use client';

import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { questionTopics } from '@/modules/questions/validation/questionSchema';
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const HeroCanvas = lazy(() => import("@/components/homepage/HeroCanvas"))

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
    const [isFormFocused, setIsFormFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleTopicSelect = (topic: string) => {
        setFormData(prev => ({
            ...prev,
            topic
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
        <div className="flex flex-col min-h-screen text-[#F3F0EA]">
            <Navbar />

            <main
                className="flex-1 relative overflow-hidden flex flex-col justify-center items-center py-32 px-4 sm:px-6 lg:px-8 font-sans bg-[#080808]"
            >
                {/* Background Network Graphic with radial fade */}
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: 0.08,
                        maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)'
                    }}
                >
                    <Suspense fallback={null}>
                        <HeroCanvas />
                    </Suspense>
                </div>

                <div className="w-full max-w-[680px] mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        {/* Header Label */}
                        <span className="text-gold text-xs font-heading font-medium uppercase tracking-[0.3em] mb-6 block">
                            INVESTOR DESK
                        </span>

                        {/* Headline */}
                        <h1 className="text-6xl md:text-7xl font-serif font-bold text-text-primary mb-6 tracking-tight leading-[1.05]">
                            Ask a Question.
                        </h1>

                        {/* Description */}
                        <p className="text-text-secondary text-xl max-w-[540px] mx-auto font-light leading-relaxed">
                            Have a question about markets, investing, or strategy?
                            Submit it below and we may address it in an upcoming insight.
                        </p>
                    </motion.div>

                    <div
                        className="backdrop-blur-2xl relative group/card transition-all duration-700 hover:shadow-[0_0_80px_rgba(245,184,0,0.12)] border-white/5 hover:border-gold/20"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '32px',
                            padding: '48px',
                        }}
                    >
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgba(255,199,44,0.12)] text-[#FFC72C] mb-6 border border-[rgba(255,199,44,0.2)] shadow-[0_0_30px_rgba(255,199,44,0.1)]">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-[32px] font-serif font-light text-[#F3F0EA] mb-4">Message Received</h3>
                                <p className="text-[#B8B3AA] text-[18px] mb-10 font-light max-w-md mx-auto leading-relaxed">
                                    Your question has been sent to our research desk. We will review it shortly.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="px-8 py-4 rounded-xl bg-gold text-bg-deep font-bold hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-gold/30 hover:scale-[1.02] flex items-center justify-center gap-2 group"
                                >
                                    Submit Another Inquiry
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                onSubmit={handleSubmit}
                                animate={{ scale: isFormFocused ? 1.01 : 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="bg-transparent"
                            >

                                {/* Topic Selection */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                                    className="mb-[48px]"
                                >
                                    <label className="block text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-text-secondary mb-5 pl-1 opacity-60">
                                        Select Topic Area
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {[...questionTopics, 'Other'].map((topic) => {
                                            const isActive = formData.topic === topic;
                                            return (
                                                <button
                                                    key={topic}
                                                    type="button"
                                                    onClick={() => handleTopicSelect(topic)}
                                                    className={`px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${isActive
                                                            ? 'text-gold'
                                                            : 'bg-white/5 border border-white/10 text-text-secondary hover:border-gold/30 hover:text-text-primary hover:-translate-y-0.5'
                                                        }`}
                                                    style={isActive ? {
                                                        background: 'rgba(245,184,0,0.1)',
                                                        border: '1px solid rgba(245,184,0,0.3)'
                                                    } : {}}
                                                >
                                                    {topic}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Question Input */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                                    className="mb-[32px]"
                                >
                                    <div className="flex justify-between items-center mb-4 pl-1 pr-2">
                                        <label htmlFor="question" className="block text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-text-secondary opacity-60">
                                            Your Question
                                        </label>
                                        <span className="text-[10px] font-heading text-text-secondary/40">{formData.question.length} / 500</span>
                                    </div>
                                    <textarea
                                        name="question"
                                        id="question"
                                        value={formData.question}
                                        onChange={handleChange}
                                        onFocus={() => setIsFormFocused(true)}
                                        onBlur={() => setIsFormFocused(false)}
                                        required
                                        maxLength={500}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-serif text-text-primary placeholder-text-secondary/40 transition-all duration-300 min-h-[160px] outline-none resize-none focus:border-gold/30 focus:bg-white/[0.07] text-xl leading-relaxed"
                                        placeholder="What investing question would you like answered?"
                                    />
                                </motion.div>

                                {/* Name & Email Inputs */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                                    className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-[48px]"
                                >
                                    <div>
                                        <label htmlFor="name" className="block text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-text-secondary mb-3 pl-1 opacity-60">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onFocus={() => setIsFormFocused(true)}
                                            onBlur={() => setIsFormFocused(false)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-text-primary placeholder-text-secondary/30 transition-all duration-300 outline-none focus:border-gold/30 focus:bg-white/[0.07] font-light text-base"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-[11px] font-heading font-semibold uppercase tracking-[0.2em] text-text-secondary mb-3 pl-1 opacity-60">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => setIsFormFocused(true)}
                                            onBlur={() => setIsFormFocused(false)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-text-primary placeholder-text-secondary/30 transition-all duration-300 outline-none focus:border-gold/30 focus:bg-white/[0.07] font-light text-base"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                </motion.div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="p-4 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] text-[#F3F0EA] rounded-[12px] text-sm font-light text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                                >
                                    <button
                                        type="submit"
                                        disabled={loading || formData.question.length < 10 || !formData.name || !formData.email}
                                        className="w-full py-5 rounded-xl bg-[#FFD700] text-black font-bold text-base hover:bg-[#FFC72C] transition-all duration-500 shadow-[0_10px_30px_rgba(255,215,0,0.15)] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Inquiry'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <p className="text-center text-text-secondary/60 text-xs mt-6 leading-relaxed font-heading uppercase tracking-widest">
                                        All submissions remain strictly confidential.
                                    </p>
                                </motion.div>
                            </motion.form>
                        )}
                    </div>

                    {/* Popular Questions Appendix */}
                    {/* User didn't request removing it, but they didn't explicitly mention it this time. Given the high-end refactor, we can leave it to provide depth as it was popular previously. We'll update the colors briefly to adhere to the spec. */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="mt-16 mx-auto max-w-[500px]"
                    >
                        <h4 className="text-text-secondary font-heading font-semibold uppercase tracking-[0.2em] text-[10px] mb-6 text-center opacity-60">
                            Recently Discussed Topics
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Is the defence sector overheated?",
                                "How should investors approach nuclear energy stocks?",
                                "Are chemical companies entering a new cycle?"
                            ].map((q, i) => (
                                <li key={i} className="flex gap-4 items-start text-text-secondary font-light text-base">
                                    <span className="text-gold font-serif text-xl leading-none mt-0.5">•</span>
                                    <span className="leading-snug">{q}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
