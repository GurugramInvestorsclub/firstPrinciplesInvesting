'use client';

import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                className="flex-1 relative overflow-hidden flex flex-col justify-center items-center py-32 px-4 sm:px-6 lg:px-8 font-sans"
                style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #0f1114 50%, #0b0b0c 100%)' }}
            >
                {/* Background Network Graphic with radial fade */}
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: 0.10,
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
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        {/* Header Label */}
                        <span className="text-gold text-xs font-mono uppercase tracking-[0.25em] mb-6 block" style={{ color: '#FFC72C' }}>
                            INVESTOR DESK
                        </span>

                        {/* Headline */}
                        <h1 className="text-[52px] md:text-[64px] font-serif font-light text-[#F3F0EA] mb-[24px] tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
                            Ask a Question.<br />
                            Think in <span style={{ background: 'linear-gradient(90deg, #FFC72C, #E6B422, #C89B3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>First Principles.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-[#B8B3AA] text-[18px] max-w-[520px] mx-auto font-light leading-relaxed">
                            Have a question about markets, investing, or strategy?
                            <br />
                            Submit it below and we may address it in an upcoming insight.
                        </p>
                    </motion.div>

                    <div
                        className="backdrop-blur-md relative"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '48px',
                            boxShadow: '0 0 80px rgba(255,199,44,0.06)'
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
                                    className="font-mono uppercase tracking-[0.14em] text-[13px] px-8 py-4 rounded-md border border-[rgba(255,255,255,0.1)] text-[#F3F0EA] hover:border-[#FFC72C] hover:text-[#FFC72C] transition-all duration-300 bg-transparent"
                                >
                                    Submit Another Inquiry
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
                                    <label className="block text-xs font-mono uppercase tracking-[0.14em] text-[#8E8A82] mb-5 pl-1">
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
                                                    className={`px-[20px] py-[10px] rounded-full text-[14px] transition-all duration-[180ms] ${isActive
                                                            ? 'border text-[#FFC72C]'
                                                            : 'bg-transparent border-[1px] border-[rgba(255,255,255,0.12)] text-[#B8B3AA] hover:border-[rgba(255,199,44,0.5)] hover:text-[#F3F0EA] hover:-translate-y-[2px]'
                                                        }`}
                                                    style={isActive ? {
                                                        background: 'linear-gradient(135deg, rgba(255,199,44,0.18), rgba(255,199,44,0.08))',
                                                        border: '1px solid rgba(255,199,44,0.45)'
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
                                        <label htmlFor="question" className="block text-xs font-mono uppercase tracking-[0.14em] text-[#8E8A82]">
                                            Your Question
                                        </label>
                                        <span className="text-[11px] font-mono text-[#8E8A82]/60">{formData.question.length} / 500</span>
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
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                                        }}
                                        className="w-full border border-[rgba(255,255,255,0.10)] rounded-[16px] p-[24px] font-serif text-[#F3F0EA] placeholder-[#8E8A82] transition-all duration-300 min-h-[160px] outline-none resize-none focus:border-[rgba(255,199,44,0.6)] focus:shadow-[0_0_0_2px_rgba(255,199,44,0.15)] text-[18px] leading-[1.6]"
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
                                        <label htmlFor="name" className="block text-xs font-mono uppercase tracking-[0.14em] text-[#8E8A82] mb-3 pl-1">
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
                                            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] rounded-[12px] p-[16px] text-[#F3F0EA] placeholder-[#8E8A82]/60 transition-all duration-300 outline-none focus:border-[rgba(255,199,44,0.5)] font-light text-[15px]"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-mono uppercase tracking-[0.14em] text-[#8E8A82] mb-3 pl-1">
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
                                            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] rounded-[12px] p-[16px] text-[#F3F0EA] placeholder-[#8E8A82]/60 transition-all duration-300 outline-none focus:border-[rgba(255,199,44,0.5)] font-light text-[15px]"
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
                                        style={{
                                            background: 'linear-gradient(135deg, #FFC72C, #E6B422, #C89B3C)'
                                        }}
                                        className="w-full block text-[#0b0b0c] font-mono uppercase tracking-[0.14em] text-[13px] rounded-md py-[18px] px-[32px] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_14px_35px_rgba(255,199,44,0.35)] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Inquiry'}
                                    </button>

                                    <p className="text-center text-[#8e8a82] text-[13px] mt-6 leading-relaxed">
                                        All submissions are reviewed personally and remain strictly confidential.
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
                        <h4 className="text-[#8E8A82] text-xs font-mono uppercase tracking-[0.14em] mb-6 text-center">
                            Recently Discussed Topics
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Is the defence sector overheated?",
                                "How should investors approach nuclear energy stocks?",
                                "Are chemical companies entering a new cycle?"
                            ].map((q, i) => (
                                <li key={i} className="flex gap-4 items-start text-[#B8B3AA] font-light text-[15px]">
                                    <span className="text-[#FFC72C] font-serif text-lg leading-none mt-0.5">•</span>
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
