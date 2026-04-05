'use client'

import { useEffect, useRef } from "react";
import { Super30Program } from "@/lib/types";
import { Super30Pricing } from "./Super30Pricing";

interface Super30NewDesignProps {
  program: Super30Program;
}

const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function Super30NewDesign({ program }: Super30NewDesignProps) {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const addToRevealRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="super30-new-design">
      <style jsx>{`
        .super30-new-design {
          --s30-bg: #0a0a08;
          --s30-bg2: #111110;
          --s30-bg3: #181816;
          --s30-surface: #1e1e1b;
          --s30-gold: #F5B800;
          --s30-gold-light: #FFD700;
          --s30-gold-dim: #C89A00;
          --s30-cream: #f5f0e8;
          --s30-cream-dim: #d1cdc7;
          --s30-border: rgba(245, 184, 0, 0.18);
          --s30-border-dim: rgba(255, 255, 255, 0.07);
          
          background: var(--s30-bg);
          color: var(--s30-cream);
          font-weight: 400;
          line-height: 1.8;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .s30-hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          padding: 80px 60px 140px;
          overflow: hidden;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 60% 40%, rgba(245, 184, 0, 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 10% 80%, rgba(245, 184, 0, 0.04) 0%, transparent 60%);
          z-index: 1;
        }

        .hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--s30-gold);
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.2s forwards;
          z-index: 2;
          position: relative;
        }
        .hero-eyebrow::before {
          content: '';
          width: 40px;
          height: 1px;
          background: var(--s30-gold);
          display: inline-block;
        }

        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5.5vw, 4.6rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          max-width: 940px;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeUp 0.9s ease 0.35s forwards;
          z-index: 2;
          position: relative;
        }
        .hero-headline em {
          font-style: italic;
          color: var(--s30-gold);
        }

        .hero-sub {
          max-width: 520px;
          margin-bottom: 36px;
          opacity: 0;
          animation: fadeUp 0.9s ease 0.5s forwards;
          z-index: 2;
          position: relative;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 24px;
          opacity: 0;
          animation: fadeUp 0.9s ease 0.65s forwards;
          z-index: 2;
          position: relative;
        }

        .s30-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--s30-gold);
          color: #0E0E11;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 17px 36px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        }
        .s30-btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
        .s30-btn-primary span, .s30-btn-primary svg { position: relative; z-index: 1; }

        .s30-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--s30-cream-dim);
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          text-decoration: none;
          padding: 17px 0;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 1px solid var(--s30-border-dim);
          transition: all 0.2s;
        }
        .s30-btn-ghost:hover { color: var(--s30-gold); border-bottom-color: var(--s30-gold-dim); }

        .hero-stats {
          position: absolute;
          right: 60px;
          bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          opacity: 0;
          animation: fadeLeft 1s ease 0.8s forwards;
          z-index: 2;
        }
        .hero-stat {
          text-align: right;
          border-right: 2px solid var(--s30-gold-dim);
          padding-right: 20px;
        }
        .stat-number {
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--s30-gold);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--s30-cream-dim);
          margin-top: 4px;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--s30-gold-dim);
          opacity: 0;
          animation: fadeUp 1s ease 1.1s forwards;
          z-index: 2;
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--s30-gold), transparent);
        }

        /* ── MARQUEE ── */
        .marquee-wrap {
          padding: 20px 0;
          border-top: 1px solid var(--s30-border-dim);
          border-bottom: 1px solid var(--s30-border-dim);
          background: var(--s30-bg2);
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 5;
        }
        .marquee-track {
          display: inline-flex;
          animation: s30marquee 30s linear infinite;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 0 40px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--s30-cream-dim);
        }
        .marquee-item .dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--s30-gold);
        }
        @keyframes s30marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ── STORY SECTION ── */
        .s30-story { padding: 120px 60px; max-width: 820px; margin: 0 auto; position: relative; z-index: 5; }
        .story-label {
          font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 56px; display: flex; align-items: center; gap: 14px;
        }
        .story-label::after { content: ''; width: 36px; height: 1px; background: var(--s30-gold); }
        .dear-investor { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 32px; }
        .letter-body p { font-size: 1.15rem; color: var(--s30-cream-dim); margin-bottom: 24px; line-height: 1.85; }
        .letter-body p strong { color: var(--s30-cream); font-weight: 600; }
        .letter-body p.opener { font-family: var(--font-display); font-size: 1.6rem; font-weight: 400; font-style: italic; color: var(--s30-cream); line-height: 1.5; margin-bottom: 40px; }
        .letter-body p.shout { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--s30-cream); line-height: 1.4; margin-bottom: 20px; }

        .grand-plan { margin: 32px 0; padding: 36px 40px; background: var(--s30-bg2); border: 1px solid var(--s30-gold); display: flex; flex-direction: column; gap: 14px; }
        .grand-plan-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 8px; }
        .plan-item { display: flex; align-items: flex-start; gap: 16px; font-size: 1rem; color: var(--s30-cream); }
        .plan-num { font-family: var(--font-mono); font-size: 0.65rem; color: var(--s30-gold); padding-top: 4px; flex-shrink: 0; }

        .journey-phases { margin: 48px 0; border-left: 2px solid var(--s30-gold); }
        .phase { padding: 28px 32px; border-bottom: 1px solid var(--s30-border-dim); position: relative; transition: background 0.3s; }
        .phase:last-child { border-bottom: none; }
        .phase:hover { background: var(--s30-bg2); }
        .phase::before { content: ''; position: absolute; left: -7px; top: 36px; width: 12px; height: 12px; border-radius: 50%; background: var(--s30-bg); border: 2px solid var(--s30-gold-dim); transition: border-color 0.3s, background 0.3s; }
        .phase:hover::before { border-color: var(--s30-gold); background: var(--s30-gold-dim); }
        .phase-tag { font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 8px; }
        .phase-body { font-size: 1rem; color: var(--s30-cream-dim); line-height: 1.75; }
        .phase-result { margin-top: 12px; display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--s30-gold); }
        .phase-result::before { content: '→'; }
        .pull-quote { margin: 56px 0; padding: 48px 52px; border-left: 4px solid var(--s30-gold); background: var(--s30-bg2); }
        .pull-quote p { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; font-style: italic; line-height: 1.45; color: var(--s30-cream); margin: 0; }
        .pull-quote p em { color: var(--s30-gold); font-style: normal; }

        /* ── PROOF SECTION ── */
        .s30-proof { padding: 100px 60px; background: var(--s30-bg2); border-top: 1px solid var(--s30-border-dim); border-bottom: 1px solid var(--s30-border-dim); }
        .s-eyebrow { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
        .s-eyebrow::after { content: ''; flex: 0 0 36px; height: 1px; background: var(--s30-gold-dim); }
        .s-heading { font-family: var(--font-display); font-size: clamp(2.4rem, 4vw, 3.5rem); font-weight: 900; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 20px; }
        .s-heading em { font-style: italic; color: var(--s30-gold); }
        .trades-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; margin-top: 56px; max-width: 1100px; margin-left: auto; margin-right: auto; }
        .trade-card { background: var(--s30-bg3); padding: 44px 36px; border: 1px solid var(--s30-border-dim); transition: border-color 0.3s, transform 0.3s; }
        .trade-card:hover { border-color: var(--s30-gold-dim); transform: translateY(-4px); }
        .trade-stock { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--s30-cream-dim); margin-bottom: 10px; }
        .trade-name { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin-bottom: 24px; }
        .trade-return { font-family: var(--font-display); font-size: 3.8rem; font-weight: 900; color: var(--s30-gold); line-height: 1; margin-bottom: 6px; }
        .trade-time { font-size: 0.82rem; color: var(--s30-cream-dim); }

        /* ── SECRETS SECTION ── */
        .secrets-wrap { background: var(--s30-bg); padding: 120px 60px; position: relative; z-index: 5; }
        .secrets-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        .secret-card { background: var(--s30-bg2); padding: 56px 48px; position: relative; overflow: hidden; border: 1px solid var(--s30-border-dim); transition: border-color 0.3s, background 0.3s; }
        .secret-card:hover { border-color: var(--s30-gold-dim); background: var(--s30-bg3); }
        .secret-num-bg { font-family: var(--font-display); font-size: 8rem; font-weight: 900; color: rgba(245, 184, 0, 0.05); line-height: 1; position: absolute; right: 24px; top: 16px; letter-spacing: -0.04em; transition: color 0.3s; user-select: none; }
        .secret-card:hover .secret-num-bg { color: rgba(245, 184, 0, 0.09); }
        .secret-badge { display: inline-block; font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--s30-gold); border: 1px solid var(--s30-gold-dim); padding: 4px 12px; margin-bottom: 24px; }
        .secret-card h3 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; line-height: 1.25; margin-bottom: 20px; letter-spacing: -0.01em; }
        .secret-card h3 em { font-style: italic; color: var(--s30-gold); }
        .secret-body { font-size: 0.95rem; color: var(--s30-cream-dim); line-height: 1.8; margin-bottom: 16px; }
        .avoid-list { margin: 20px 0; display: flex; flex-direction: column; gap: 10px; }
        .avoid-item { display: flex; align-items: flex-start; gap: 12px; font-size: 0.9rem; color: var(--s30-cream-dim); line-height: 1.5; }
        .avoid-item::before { content: '✕'; color: var(--s30-gold-dim); font-size: 0.7rem; flex-shrink: 0; margin-top: 3px; }
        .secret-result { margin-top: 40px; padding-top: 28px; border-top: 1px solid var(--s30-border-dim); display: flex; align-items: center; gap: 18px; }
        .result-big { font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--s30-gold); line-height: 1; }
        .result-caption { font-size: 0.84rem; color: var(--s30-cream-dim); line-height: 1.6; }

        /* ── COMPOUNDING SECTION ── */
        .calc-wrap { padding: 120px 60px; background: var(--s30-bg); border-bottom: 1px solid var(--s30-border-dim); }
        .calc-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: center; }
        .calc-visual { background: var(--s30-bg3); border: 1px solid var(--s30-gold); overflow: hidden; }
        .calc-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 36px; border-bottom: 1px solid var(--s30-border-dim); }
        .calc-row.header { background: rgba(245, 184, 0, 0.05); padding: 14px 36px; }
        .calc-row-label { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--s30-cream-dim); }
        .calc-row-value { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--s30-cream); }
        .calc-row-value.highlight { color: var(--s30-gold); font-size: 1.8rem; }
        .calc-delta { padding: 28px 36px; text-align: center; background: rgba(245, 184, 0, 0.06); border-top: 1px solid var(--s30-gold); }
        .calc-delta .delta-num { font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; color: var(--s30-gold); display: block; margin-bottom: 6px; }
        .calc-delta .delta-label { font-size: 0.82rem; color: var(--s30-cream-dim); font-family: var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; }

        /* ── WIN RATE WRAP ── */
        .winrate-wrap { background: var(--s30-bg2); border-top: 1px solid var(--s30-border-dim); padding: 100px 60px; }
        .winrate-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
        .winrate-card { padding: 52px 40px; background: var(--s30-bg3); text-align: center; border: 1px solid var(--s30-border-dim); }

        /* ── LEARN GRID ── */
        .s30-learn { padding: 120px 60px; max-width: 1100px; margin: 0 auto; }
        .learn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; margin-top: 60px; }
        .learn-item { padding: 40px 36px; border: 1px solid var(--s30-border-dim); display: flex; gap: 24px; align-items: flex-start; transition: border-color 0.3s, background 0.3s; }
        .learn-item:hover { border-color: var(--s30-gold-dim); background: var(--s30-bg2); }

        /* ── CTA SECTION ── */
        .s30-cta-section { padding: 140px 60px; text-align: center; position: relative; overflow: hidden; z-index: 5; }
        .cta-bg-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(245, 184, 0, 0.07) 0%, transparent 70%); }
        .s30-cta-section h2 { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; max-width: 800px; margin: 0 auto 24px; position: relative; }
        .s30-cta-section h2 em { font-style: italic; color: var(--s30-gold); }
        .s30-cta-section p { font-size: 1rem; color: var(--s30-cream-dim); max-width: 480px; margin: 0 auto 48px; line-height: 1.8; position: relative; }
        .cta-group { position: relative; display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .cta-note { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--s30-gold-dim); margin-top: 24px; position: relative; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .cta-note::before, .cta-note::after { content: ''; width: 30px; height: 1px; background: var(--s30-gold-dim); }

        .s30-disclaimer { background: rgba(245, 184, 0, 0.05); border-top: 1px solid var(--s30-border); padding: 16px 60px; text-align: center; position: relative; z-index: 5; }
        .s30-disclaimer p { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--s30-cream-dim); line-height: 1.6; max-width: 900px; margin: 0 auto; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeLeft { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }

        @media (max-width: 900px) {
          .s30-hero { 
            height: 100vh; /* Locked even on mobile for first fold consistency */
            padding: 80px 24px 60px; 
          }
          .scroll-indicator { display: none; }
          .hero-stats { position: static; margin-top: 48px; flex-direction: row; flex-wrap: wrap; gap: 3px; }
          .hero-stat { flex: 1 1 45%; text-align: left; border-right: none; border-left: 2px solid var(--s30-gold-dim); padding-left: 16px; padding-right: 0; }
          .s30-story, .secrets-wrap, .calc-wrap, .winrate-wrap, .s30-proof, .s30-learn, .s30-cta-section { padding: 80px 28px; }
          .calc-inner, .secrets-grid, .trades-grid, .learn-grid, .winrate-inner { grid-template-columns: 1fr; }
          .calc-inner { gap: 40px; }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="s30-hero">
        {program.heroVideo && (
          <>
            {getYoutubeVideoId(program.heroVideo) ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 w-full h-full scale-[1.02]"> {/* Slight scale to prevent edge bleed */}
                  <iframe
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[101vh] min-w-[178.77vh] opacity-60"
                    src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(program.heroVideo)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeVideoId(program.heroVideo)}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    title="Background Video"
                    frameBorder="0"
                  />
                </div>
              </div>
            ) : (
              <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none" autoPlay muted loop playsInline src={program.heroVideo} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08] via-[#0a0a08]/80 to-transparent z-[1]" />
          </>
        )}
        <div className="hero-bg-overlay" />
        <p className="hero-eyebrow">Super30 Masterclass - Limited Cohort</p>
        <h1 className="hero-headline">
          10 Years Into My Career,<br />
          I Accidentally Discovered<br />
          a <em>SECRET</em> That Changed<br />
          Everything About How<br />
          I Pick Stocks.
        </h1>

        <div className="hero-sub">
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3 text-s30-cream-dim">
              <div className="w-5 h-[1px] bg-s30-gold" /> This secret helped me improve my returns by <strong>~3% CAGR</strong>
            </div>
            <div className="flex items-center gap-3 text-s30-cream-dim">
              <div className="w-5 h-[1px] bg-s30-gold" /> It helped me increase my <strong>&quot;win-rate&quot; exponentially</strong>
            </div>
          </div>
        </div>

        <div className="hero-cta-group">
          <a href="#apply" className="s30-btn-primary">
            <span>Join Super30</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#story" className="s30-btn-ghost">Read the story ↓</a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-number">{program.investorsEducated || "72%"}</div>
            <div className="stat-label">Win rate on positions<br />held over 1 year</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{program.batchNumber || "8×"}</div>
            <div className="stat-label">Win / Loss ratio<br />in absolute ₹ terms</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{program.seatsRemaining || "+3.2%"}</div>
            <div className="stat-label">CAGR left on the table<br />by not applying Secret #2</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">10yr</div>
            <div className="stat-label">Of real investing<br />distilled into one framework</div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          Scroll to discover
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[1, 2].map((i) => (
            <div key={i} className="flex">
              <div className="marquee-item"><span className="dot"></span> Suzlon - 2X in 1 Year</div>
              <div className="marquee-item"><span className="dot"></span> Inox Wind - 3X in 1 Year</div>
              <div className="marquee-item"><span className="dot"></span> Sanghvi Movers - 2X in 1 Year</div>
              <div className="marquee-item"><span className="dot"></span> 72% Win Rate Over 5 Years</div>
              <div className="marquee-item"><span className="dot"></span> 8X Win / Loss Ratio in ₹ Terms</div>
              <div className="marquee-item"><span className="dot"></span> +3.2% CAGR From Not Buying</div>
              <div className="marquee-item"><span className="dot"></span> First Principles. Not Stardust.</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. STORY SECTION */}
      <section className="s30-story" id="story">
        <div className="story-label">The Story</div>
        <div className="dear-investor">Dear Investor,</div>
        <div className="letter-body">
          <p className="opener">You are going to HATE what I'm about to tell you.</p>
          <p>But as a trusted friend {'&'} advisor I MUST...</p>
          <p>12 years ago, I started my investing journey when I was 22 years young.</p>
          <p>The only thing I knew about FINANCE was how to spell the word - <strong>FINANCE.</strong></p>
          <p>My <strong>GRAND PLAN</strong> was:</p>
          <div className="grand-plan reveal" ref={addToRevealRefs}>
            <div className="grand-plan-label">The Grand Plan</div>
            <div className="plan-item"><span className="plan-num">01</span>Read &apos;The Intelligent Investor&apos;</div>
            <div className="plan-item"><span className="plan-num">02</span>Start Investing.</div>
            <div className="plan-item"><span className="plan-num">03</span>Get RICH $$</div>
          </div>
          <p>It worked. For some time.</p>
          <div className="pull-quote reveal" ref={addToRevealRefs}>
            <p>I bought my first stock - Cairn India {'<'} 0.5X Book value. In less than two years it <em>doubled.</em></p>
          </div>
          <p>Confident, I applied the same &quot;strategy&quot; to the next stock {'&'} <strong>IT WENT NOWHERE FOR 4 YEARS!</strong></p>
          <p>You know what I mean?</p>
          <p>My solution was to read ANOTHER book. This time on GROWTH INVESTING.</p>
        </div>

        <div className="journey-phases reveal" ref={addToRevealRefs}>
          <div className="phase">
            <div className="phase-tag">Growth Investing Phase</div>
            <div className="phase-body">
              Confident again, I bought a &quot;Growth stock&quot; - which went up <strong>3X in 2 years!</strong>
              <br /><br />
              I applied the same &quot;Growth strategy&quot; to the next stock pick {'&'} <strong>THE STOCK CRASHED 30%!</strong>
            </div>
            <div className="phase-result">Did I give up? Noo!</div>
          </div>
          <div className="phase">
            <div className="phase-tag">Techno-Funda Phase</div>
            <div className="phase-body">
              I went all guns blazing on &quot;TECHNO-FUNDA&quot; - An approach that combines Fundamentals {'&'} Technicals. Finally, I felt like I was about to get RICH. FAST!
              <br /><br />
              First stock I bought using this approach? <strong>10X in under 2 years!!</strong> I was unstoppable. The chosen one. The next RJ.
              <br /><br />
              The only problem? It was 1% of my portfolio. I tweaked the approach - applied the &quot;techno-funda strategy&quot; BUT with a 20% position from Day 1. The result? Got &quot;chopped out&quot; when stock corrected 15%.
            </div>
          </div>
          <div className="phase">
            <div className="phase-tag">Special Situations → Turnarounds → Everything</div>
            <div className="phase-body">
              Next? Special situations…then Turnarounds…&quot;strategy&quot; after &quot;strategy&quot;, book after book until…
              <br /><br />
              <strong>One fine afternoon in 2022, when EVERYTHING CHANGED.</strong>
            </div>
            <div className="phase-result">It literally took me 10 years to accidentally discover this SECRET.</div>
          </div>
        </div>
      </section>

      {/* 4. PROOF SECTION */}
      <section className="s30-proof">
        <div className="trades-inner" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="reveal" ref={addToRevealRefs}>
            <div className="s-eyebrow">Secret #1 in Action</div>
            <h2 className="s-heading">Using this SECRET,<br />I bought these stocks.</h2>
          </div>
          <div className="trades-grid">
            <div className="trade-card reveal" ref={addToRevealRefs}>
              <div className="trade-stock">NSE: SUZLON</div>
              <div className="trade-name">Suzlon Energy</div>
              <div className="trade-return">2×</div>
              <div className="trade-time">in 1 year</div>
            </div>
            <div className="trade-card reveal reveal-delay-1" ref={addToRevealRefs}>
              <div className="trade-stock">NSE: INOXWIND</div>
              <div className="trade-name">Inox Wind Ltd</div>
              <div className="trade-return">3×</div>
              <div className="trade-time">in 1 year</div>
            </div>
            <div className="trade-card reveal reveal-delay-2" ref={addToRevealRefs}>
              <div className="trade-stock">NSE: SANGHVIMOV</div>
              <div className="trade-name">Sanghvi Movers</div>
              <div className="trade-return">~2×</div>
              <div className="trade-time">in 1 year</div>
            </div>
          </div>
          <div className="letter-body reveal" style={{ marginTop: '48px', maxWidth: '680px' }} ref={addToRevealRefs}>
            <p>All thanks to SECRET #1.</p>
            <p>But it wasn't all rainbows {'&'} butterflies. I made mistakes too. MAS Financial, Repco Home Finance, DB Corp to name a few. <strong>THAT WILL ALWAYS HAPPEN NO MATTER WHO YOU ARE.</strong></p>
            <p>But my win rate for holdings over 1 year is <strong>{program.investorsEducated || "72%"}</strong> and Win/Loss in absolute INR terms is <strong>~{program.batchNumber || "8X"} over the last 5 years.</strong></p>
          </div>
        </div>
      </section>

      {/* 5. SECRETS SECTION */}
      <section className="secrets-wrap">
        <div className="letter-body reveal" style={{ maxWidth: '680px', margin: '0 auto 48px' }} ref={addToRevealRefs}>
          <p className="shout">Here's where it gets CRAZIER!</p>
          <p>When I analysed my trades over 10 years, I learnt something that <strong>BLEW MY MIND!</strong></p>
          <p>If I HAD JUST NOT BOUGHT CERTAIN STOCKS, my CAGR would be UP by <strong>{program.seatsRemaining || "3.2%"} CAGR!</strong><br />That&apos;s annualised growth I was leaving on the table.</p>
          <p>And I don&apos;t want to leave ANYTHING on the table.</p>
          <p><strong>{program.seatsRemaining || "3.2%"} CAGR is the difference between BEATING the STREET and GETTING BEAT.</strong></p>
          <p className="shout">THAT WAS SECRET #2</p>
        </div>

        <div className="secrets-grid">
          <div className="secret-card reveal" ref={addToRevealRefs}>
            <div className="secret-num-bg">01</div>
            <div className="secret-badge">Secret #1</div>
            <h3>Know <em>What</em> to Buy - and When</h3>
            <p className="secret-body">
              The pattern I discovered after 10 years - a business-level, cycle-aware framework that identifies which companies are almost certain to reward patient capital. Not chart patterns. First principles.
            </p>
            <div className="secret-result">
              <div className="result-big">3 picks</div>
              <div className="result-caption">Suzlon 2X, Inox Wind 3X,<br />Sanghvi Movers 2X - all in ~12 months</div>
            </div>
          </div>
          <div className="secret-card reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="secret-num-bg">02</div>
            <div className="secret-badge">Secret #2</div>
            <h3>What You <em>Don&apos;t Buy</em> Is Equally - If Not More - Important</h3>
            <p className="secret-body">Most investors obsess over WHAT TO BUY. Not me. I'm very clear on what I will NOT buy:</p>
            <div className="avoid-list">
              <div className="avoid-item">The type of business models I'll avoid like the plague</div>
              <div className="avoid-item">The type of valuations I'll never buy at</div>
              <div className="avoid-item">The type of time-frames I'll NOT invest for</div>
              <div className="avoid-item">The type of stories I&apos;ll put in the &quot;pump {'&'} dump&quot; category</div>
            </div>
            <div className="secret-result">
              <div className="result-big">{program.seatsRemaining || "+3.2%"}</div>
              <div className="result-caption">CAGR NOT BUYING would've added<br />to my annualised performance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPOUNDING SECTION */}
      <section className="calc-wrap">
        <div className="calc-inner reveal" ref={addToRevealRefs}>
          <div className="calc-left">
            <div className="s-eyebrow">The Context</div>
            <h2 className="s-heading">You know why they call compounding<br />the <em>8th wonder</em> of the world?</h2>
            <div className="letter-body">
              <p>Here&apos;s why:</p>
              <p>3% CAGR is the difference between BEATING the STREET and GETTING BEAT.</p>
              <p>If that doesn&apos;t hit you right in the gut - <strong>₹171 Crore more over 30 years</strong> - nothing will.</p>
              <p><strong>NOT BUYING</strong> would&apos;ve added {program.seatsRemaining || "3.2%"} of annualised performance to my portfolio.</p>
            </div>
          </div>
          <div className="calc-visual">
            <div className="calc-row header"><div className="calc-row-label">Starting Capital</div><div className="calc-row-label">Horizon</div></div>
            <div className="calc-row"><div className="calc-row-label">₹1 Crore</div><div className="calc-row-label">30 Years</div></div>
            <div className="calc-row"><div className="calc-row-label">At 17% CAGR</div><div className="calc-row-value">₹66 Cr</div></div>
            <div className="calc-row"><div className="calc-row-label">At 20% CAGR (+3%)</div><div className="calc-row-value highlight">₹237 Cr</div></div>
            <div className="calc-delta"><span className="delta-num">₹171 Crore</span><span className="delta-label">The difference 3% makes over 30 years</span></div>
          </div>
        </div>
      </section>

      {/* 7. WIN RATE CARDS */}
      <section className="winrate-wrap">
        <div className="winrate-inner">
          <div className="winrate-card reveal" ref={addToRevealRefs}>
            <div className="result-big" style={{ fontSize: '4rem', marginBottom: '12px' }}>{program.investorsEducated || "72%"}</div>
            <div className="phase-tag">Win Rate</div>
            <p className="trade-time">On positions held {'>'} 1 year</p>
          </div>
          <div className="winrate-card reveal reveal-delay-1" ref={addToRevealRefs}>
            <div className="result-big" style={{ fontSize: '4rem', marginBottom: '12px' }}>{program.batchNumber || "8×"}</div>
            <div className="phase-tag">Win / Loss Ratio</div>
            <p className="trade-time">In absolute ₹ terms</p>
          </div>
          <div className="winrate-card reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="result-big" style={{ fontSize: '4rem', marginBottom: '12px' }}>{program.seatsRemaining || "3.2%"}</div>
            <div className="phase-tag">CAGR &quot;Saved&quot;</div>
            <p className="trade-time">By Secret #2 implementation</p>
          </div>
        </div>
      </section>

      {/* 8. CURRICULUM GRID */}
      <section className="s30-learn" id="curriculum">
        <div className="reveal" ref={addToRevealRefs}>
          <div className="s-eyebrow">Super30 Program</div>
          <h2 className="s-heading">What we&apos;re going to teach you -<br /><em>everything.</em></h2>
          <p style={{ maxWidth: '560px', color: 'var(--s30-cream-dim)', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '0' }}>
            What we&apos;re calling secrets are simply first principles. In our Super30 program we&apos;re going to teach you everything you need to sharpen your stock picking skillset.
          </p>
        </div>
        <div className="learn-grid">
          {[
            { tag: 'S1', title: 'Secret #1 - The Buying Framework', desc: 'The exact first-principles pattern that identified Suzlon, Inox Wind, and Sanghvi Movers before they moved. Not a tip. A repeatable process.' },
            { tag: 'S2', title: 'Secret #2 - What NOT to Buy', desc: 'Business models to avoid like the plague. Valuation zones. Time-frames that don&apos;t work. Narratives that go straight into the &quot;pump {\'&\'} dump&quot; bucket.' },
            { tag: 'FP', title: 'Investing from First Principles', desc: 'These first principles are boring. They work. While the rest of the industry sells stardust, we teach the truth - invest from first principles.' },
            { tag: 'WR', title: 'Building a 72% Win Rate', desc: 'The structural process and portfolio habits that moved the win rate from random luck to 72% - across real market cycles and real money.' },
            { tag: 'PS', title: 'Position Sizing That Moves the Needle', desc: 'The difference between a 10X stock and a 10X portfolio is position size. Getting chopped out at 1% concentration is not investing. We fix that.' },
            { tag: 'LS', title: 'Learning From the Losers', desc: 'MAS Financial. Repco Home Finance. DB Corp. Mistakes always happen no matter who you are. We&apos;ll show you how to make sure they never hurt twice.' }
          ].map((u, i) => (
            <div key={u.tag} className={`learn-item reveal reveal-delay-${(i % 2) + 1}`} ref={addToRevealRefs}>
              <div className="secret-badge">{u.tag}</div>
              <div className="learn-content"><h4 className="trade-name">{u.title}</h4><p className="phase-body" style={{ fontSize: '0.92rem' }}>{u.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* 8.5. FIRST PRINCIPLES CLOSE */}
      <section className="s30-story">
        <div className="letter-body">
          <div className="pull-quote reveal" ref={addToRevealRefs}>
            <p>You know why we&apos;re called First Principles Investing?</p>
          </div>
          <p>Because while the rest of the industry is busy selling you stardust, we like telling the truth.</p>
          <p>Which is: <strong>INVEST from FIRST PRINCIPLES.</strong></p>
          <div className="grand-plan reveal" style={{ margin: '40px 0' }} ref={addToRevealRefs}>
            <div className="grand-plan-label">The Truth</div>
            <div className="plan-item" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--s30-cream)' }}>
              <span className="plan-num" style={{ paddingTop: '6px' }}>→</span>
              THESE FIRST PRINCIPLES ARE BORING.
            </div>
            <div className="plan-item" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--s30-gold)' }}>
              <span className="plan-num" style={{ paddingTop: '6px' }}>→</span>
              THEY WORK.
            </div>
          </div>
        </div>
      </section>



      {/* 10. FINAL CTA */}
      <section className="s30-cta-section" id="apply">
        <div className="cta-bg-overlay"></div>
        <div className="reveal" ref={addToRevealRefs}>
          <h2>Sharpen Your<br />Stock Picking<br /><em>Skillset.</em></h2>
          <p>Super30 is a limited cohort. The seats will go. Don&apos;t leave {program.seatsRemaining || "3.2%"} CAGR on the table for another year.</p>
          <div className="cta-group"><Super30Pricing program={program} /></div>
          <div className="cta-note">Limited Seats &nbsp;·&nbsp; First Principles Only &nbsp;·&nbsp; No Stardust</div>
        </div>
      </section>

      {/* 11. DISCLAIMER */}
      <footer className="s30-disclaimer">
        <p>DISCLAIMER: Stocks mentioned (Suzlon, Inox Wind, etc.) are for educational case study purposes only and not buy/sell recommendations. Investing in securities is subject to market risks. Past performance is not indicative of future results.</p>
      </footer>
    </div>
  );
}
