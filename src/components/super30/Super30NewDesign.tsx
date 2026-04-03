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
          --s30-bg: #0E0E11;
          --s30-bg2: #131315;
          --s30-bg3: #1c1c1f;
          --s30-surface: #242427;
          --s30-gold: #FFC72C;
          --s30-gold-light: #FFE082;
          --s30-gold-dim: #C89B3C;
          --s30-cream: #F0EDE8;
          --s30-cream-dim: #9CA3AF;
          --s30-border: rgba(255, 199, 44, 0.18);
          --s30-border-dim: rgba(255, 255, 255, 0.07);
          
          background: var(--s30-bg);
          color: var(--s30-cream);
          font-weight: 300;
          line-height: 1.65;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .s30-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          padding: 80px 60px 100px;
          overflow: hidden;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 60% 40%, rgba(255, 199, 44, 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 10% 80%, rgba(255, 199, 44, 0.04) 0%, transparent 60%);
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
          font-size: clamp(3rem, 7vw, 6.5rem);
          font-weight: 900;
          line-height: 1.03;
          letter-spacing: -0.02em;
          max-width: 820px;
          margin-bottom: 32px;
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
          font-size: 1.1rem;
          font-weight: 300;
          color: var(--s30-cream-dim);
          max-width: 520px;
          margin-bottom: 52px;
          line-height: 1.75;
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
        .s30-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--s30-gold-light);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .s30-btn-primary:hover::before { transform: translateX(0); }
        .s30-btn-primary:hover { box-shadow: 0 8px 40px rgba(255, 199, 44, 0.35); }
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
          bottom: 100px;
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
          bottom: 36px;
          left: 60px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--s30-cream-dim);
          opacity: 0;
          animation: fadeUp 1s ease 1.1s forwards;
          z-index: 2;
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--s30-gold), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }

        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(0.6); }
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
          animation: s30marquee 22s linear infinite;
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
        .s30-story {
          padding: 120px 60px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 80px;
          align-items: start;
          position: relative;
          z-index: 5;
        }
        .story-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--s30-gold);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .story-label::before {
          content: '01';
          color: var(--s30-border);
          font-size: 0.65rem;
        }
        .story-left h2 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .story-left h2 em { font-style: italic; color: var(--s30-gold); }
        .sticky-top { position: sticky; top: 120px; }

        .story-right p {
          font-size: 1.05rem;
          color: var(--s30-cream-dim);
          margin-bottom: 22px;
          line-height: 1.8;
        }
        .story-right p strong { color: var(--s30-cream); font-weight: 500; }
        .story-right p.big { font-size: 1.25rem; color: var(--s30-cream); font-weight: 400; line-height: 1.65; }

        .s30-journey {
          margin: 48px 0;
          border-left: 2px solid var(--s30-border);
          padding-left: 28px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .journey-item { position: relative; }
        .journey-item::before {
          content: '';
          position: absolute;
          left: -35px;
          top: 8px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--s30-bg);
          border: 2px solid var(--s30-gold-dim);
          transition: border-color 0.3s;
        }
        .journey-item:hover::before { border-color: var(--s30-gold); }
        .journey-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--s30-gold-dim);
          margin-bottom: 6px;
        }
        .journey-text { font-size: 0.95rem; color: var(--s30-cream-dim); line-height: 1.7; }
        .journey-text strong { color: var(--s30-cream); font-weight: 500; }

        /* ── SECRETS SECTION ── */
        .secrets-wrap {
          background: var(--s30-bg2);
          border-top: 1px solid var(--s30-border-dim);
          border-bottom: 1px solid var(--s30-border-dim);
          padding: 120px 60px;
          position: relative;
          z-index: 5;
        }
        .s30-section-header {
          max-width: 1200px;
          margin: 0 auto 72px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--s30-gold);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-label.num::before {
          content: attr(data-num);
          color: var(--s30-border);
          font-size: 0.65rem;
        }
        .s30-section-header h2 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          max-width: 600px;
          line-height: 1.15;
        }
        .s30-section-header h2 em { font-style: italic; color: var(--s30-gold); }
        .s30-section-header p {
          max-width: 320px;
          font-size: 0.92rem;
          color: var(--s30-cream-dim);
          line-height: 1.75;
        }

        .secrets-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .secret-card {
          background: var(--s30-bg3);
          padding: 56px 52px;
          position: relative;
          overflow: hidden;
          transition: background 0.3s;
          cursor: default;
        }
        .secret-card:hover { background: var(--s30-surface); }
        .secret-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 0;
          background: var(--s30-gold);
          transition: height 0.4s ease;
        }
        .secret-card:hover::before { height: 100%; }

        .secret-number {
          font-family: var(--font-display);
          font-size: 5rem;
          font-weight: 900;
          color: rgba(255, 199, 44, 0.08);
          line-height: 1;
          position: absolute;
          top: 24px; right: 36px;
          letter-spacing: -0.04em;
          transition: color 0.3s;
        }
        .secret-card:hover .secret-number { color: rgba(255, 199, 44, 0.12); }

        .secret-tag {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--s30-gold);
          margin-bottom: 20px;
          display: inline-block;
          border: 1px solid var(--s30-gold-dim);
          padding: 4px 12px;
        }
        .secret-card h3 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }
        .secret-card p { font-size: 0.95rem; color: var(--s30-cream-dim); line-height: 1.75; margin-bottom: 20px; }
        .secret-result {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid var(--s30-border-dim);
        }
        .result-number { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--s30-gold); line-height: 1; }
        .result-label { font-size: 0.82rem; color: var(--s30-cream-dim); line-height: 1.5; }

        /* ── PROOF SECTION ── */
        .s30-proof { padding: 120px 60px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 5; }
        .trades-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 60px; }
        .trade-card {
          background: var(--s30-bg2);
          padding: 40px 36px;
          border: 1px solid var(--s30-border-dim);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
        }
        .trade-card:hover { border-color: var(--s30-gold-dim); transform: translateY(-4px); }
        .trade-stock { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--s30-cream-dim); margin-bottom: 12px; }
        .trade-name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
        .trade-return { font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: var(--s30-gold); line-height: 1; margin-bottom: 4px; }
        .trade-time { font-size: 0.82rem; color: var(--s30-cream-dim); }
        .trade-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          background: linear-gradient(to right, var(--s30-gold), var(--s30-gold-light));
          width: 0;
          transition: width 0.8s ease;
        }
        .trade-card:hover .trade-bar { width: 100%; }

        /* ── COMPOUNDING CALC ── */
        .calc-wrap {
          background: var(--s30-bg2);
          border-top: 1px solid var(--s30-border-dim);
          border-bottom: 1px solid var(--s30-border-dim);
          padding: 120px 60px;
          position: relative;
          z-index: 5;
        }
        .calc-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .calc-label { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--s30-gold); margin-bottom: 16px; }
        .calc-left h2 { font-family: var(--font-display); font-size: clamp(2rem, 3vw, 2.8rem); font-weight: 900; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 24px; }
        .calc-left h2 em { font-style: italic; color: var(--s30-gold); }
        .calc-left p { font-size: 1rem; color: var(--s30-cream-dim); line-height: 1.8; margin-bottom: 16px; }

        .calc-visual { background: var(--s30-bg3); border: 1px solid var(--s30-border); padding: 48px; }
        .calc-row { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--s30-border-dim); }
        .calc-row:last-child { border-bottom: none; }
        .calc-row-label { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.12em; color: var(--s30-cream-dim); text-transform: uppercase; }
        .calc-row-value { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--s30-cream); }
        .calc-row-value.highlight { color: var(--s30-gold); }
        .calc-row-value.big { font-size: 2.2rem; font-weight: 900; }
        .calc-divider { height: 1px; background: var(--s30-border); margin: 12px 0; }
        .calc-delta { margin-top: 28px; padding: 20px; background: rgba(255, 199, 44, 0.06); border: 1px solid var(--s30-border); text-align: center; }
        .calc-delta .delta-num { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--s30-gold); }
        .calc-delta .delta-label { font-size: 0.85rem; color: var(--s30-cream-dim); margin-top: 4px; }

        /* ── WHAT YOU'LL LEARN ── */
        .s30-learn { padding: 120px 60px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 5; }
        .learn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 60px; }
        .learn-item { padding: 40px 36px; border: 1px solid var(--s30-border-dim); display: flex; gap: 24px; align-items: flex-start; transition: border-color 0.3s, background 0.3s; }
        .learn-item:hover { border-color: var(--s30-gold-dim); background: var(--s30-bg2); }
        .learn-icon {
          width: 44px; height: 44px;
          border: 1px solid var(--s30-gold-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-family: var(--font-mono); font-size: 0.72rem;
          color: var(--s30-gold); letter-spacing: 0.05em;
        }
        .learn-content h4 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
        .learn-content p { font-size: 0.88rem; color: var(--s30-cream-dim); line-height: 1.7; }

        /* ── WIN RATE ── */
        .winrate-wrap { background: var(--s30-bg2); border-top: 1px solid var(--s30-border-dim); padding: 100px 60px; position: relative; z-index: 5; }
        .winrate-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; }
        .winrate-card { padding: 52px 40px; background: var(--s30-bg3); text-align: center; }
        .winrate-number { font-family: var(--font-display); font-size: 4rem; font-weight: 900; color: var(--s30-gold); line-height: 1; margin-bottom: 12px; }
        .winrate-desc { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--s30-cream-dim); line-height: 1.6; }

        /* ── CTA SECTION ── */
        .s30-cta-section { padding: 140px 60px; text-align: center; position: relative; overflow: hidden; z-index: 5; }
        .cta-bg-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255, 199, 44, 0.07) 0%, transparent 70%); }
        .s30-cta-section h2 { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; max-width: 800px; margin: 0 auto 24px; position: relative; }
        .s30-cta-section h2 em { font-style: italic; color: var(--s30-gold); }
        .s30-cta-section p { font-size: 1rem; color: var(--s30-cream-dim); max-width: 480px; margin: 0 auto 48px; line-height: 1.8; position: relative; }
        .cta-group { position: relative; display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .cta-note {
          font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--s30-gold-dim); margin-top: 24px;
          position: relative; display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .cta-note::before, .cta-note::after { content: ''; width: 30px; height: 1px; background: var(--s30-gold-dim); }

        /* ── DISCLAIMER ── */
        .s30-disclaimer { background: rgba(255, 199, 44, 0.05); border-top: 1px solid var(--s30-border); padding: 16px 60px; text-align: center; position: relative; z-index: 5; }
        .s30-disclaimer p { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--s30-cream-dim); line-height: 1.6; max-width: 900px; margin: 0 auto; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        /* Responsive */
        @media (max-width: 900px) {
          .s30-hero { padding: 120px 28px 80px; }
          .hero-stats { right: 28px; bottom: 80px; position: static; margin-top: 48px; flex-direction: row; justify-content: flex-start; }
          .hero-stat { text-align: left; border-right: none; border-left: 2px solid var(--s30-gold-dim); padding-right: 0; padding-left: 16px; }
          .s30-story { grid-template-columns: 1fr; padding: 80px 28px; }
          .secrets-wrap, .calc-wrap, .winrate-wrap { padding: 80px 28px; }
          .s30-proof, .s30-learn, .s30-cta-section { padding: 80px 28px; }
          .s30-disclaimer { padding: 14px 28px; }
          .scroll-indicator { left: 28px; }
          .secrets-grid, .trades-grid, .learn-grid, .winrate-inner, .calc-inner { grid-template-columns: 1fr; }
          .s30-section-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="s30-hero">
        {/* Background Layer: Cinematic Video or fallback */}
        {program.heroVideo && (
          <>
            {getYoutubeVideoId(program.heroVideo) ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <iframe
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] opacity-60"
                  src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(
                    program.heroVideo
                  )}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeVideoId(
                    program.heroVideo
                  )}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title="Background Video"
                />
              </div>
            ) : (
              <video
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
                autoPlay
                muted
                loop
                playsInline
                src={program.heroVideo}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--s30-bg)] via-[var(--s30-bg)]/80 to-transparent z-[1]" />
          </>
        )}
        <div className="hero-bg-overlay" />

        <p className="hero-eyebrow">Super30 Masterclass - Limited Cohort</p>

        <h1 className="hero-headline">
          10 Years to Discover<br />
          Two <em>Secrets</em> That<br />
          Changed Everything.
        </h1>

        <p className="hero-sub">
          A first-principles framework for stock picking that improved returns by 3% CAGR and pushed win-rates to 72% - built from a decade of real trades, real losses, and one accidental discovery.
        </p>

        <div className="hero-cta-group">
          <a href="#apply" className="s30-btn-primary">
            <span>Join Super30</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#story" className="s30-btn-ghost">Read the story ↓</a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-number">{program.investorsEducated || "72%"}</div>
            <div className="stat-label">Win Rate ({'>'}1yr holds)</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{program.batchNumber || "8×"}</div>
            <div className="stat-label">Win / Loss (₹ terms)</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{program.seatsRemaining || "+3.2%"}</div>
            <div className="stat-label">CAGR From Not Buying</div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          Scroll to discover
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[1, 2].map((i) => (
            <div key={i} className="flex">
              <div className="marquee-item"><span className="dot"></span> Suzlon - 2X in 12 Months</div>
              <div className="marquee-item"><span className="dot"></span> Inox Wind - 3X in 12 Months</div>
              <div className="marquee-item"><span className="dot"></span> Sanghvi Movers - 2X in 12 Months</div>
              <div className="marquee-item"><span className="dot"></span> 72% Win Rate Over 5 Years</div>
              <div className="marquee-item"><span className="dot"></span> 8X Win / Loss Ratio</div>
              <div className="marquee-item"><span className="dot"></span> 3.2% CAGR From Not Buying</div>
              <div className="marquee-item"><span className="dot"></span> First Principles. Not Magic.</div>
            </div>
          ))}
        </div>
      </div>

      {/* STORY SECTION */}
      <section className="s30-story" id="story">
        <div className="story-left sticky-top">
          <div className="story-label">The Origin</div>
          <h2>A 12-Year<br /><em>Education</em><br />in What Works.</h2>
        </div>
        <div className="story-right">
          <p className="big">
            In 2012, at 22, the only finance word I knew was <strong>finance</strong>. My grand plan: Read <em>The Intelligent Investor</em>. Start Investing. Get Rich.
          </p>
          <p>
            It sort of worked. My first stock - Cairn India at under 0.5× book value - doubled in under two years. Confidence soared. I applied the same logic to the next pick. <strong>It went nowhere for 4 years.</strong>
          </p>

          <div className="s30-journey reveal" ref={addToRevealRefs}>
            <div className="journey-item">
              <div className="journey-label">Value Investing Phase</div>
              <div className="journey-text">First stock <strong>doubled in 2 years</strong>. Applied same strategy. Went nowhere for 4 years. Moved on.</div>
            </div>
            <div className="journey-item">
              <div className="journey-label">Growth Investing Phase</div>
              <div className="journey-text">New book, new framework. <strong>Next pick 3X'd in 2 years.</strong> Applied same approach again. Stock crashed 30%.</div>
            </div>
            <div className="journey-item">
              <div className="journey-label">Techno-Funda Phase</div>
              <div className="journey-text">Combined fundamentals {'&'} technicals. <strong>First pick: 10X in under 2 years.</strong> But it was 1% of the portfolio. Scaled position. Got chopped out at -15%.</div>
            </div>
            <div className="journey-item">
              <div className="journey-label">The Accidental Discovery - 2022</div>
              <div className="journey-text">After a decade of strategies - special situations, turnarounds, everything - one afternoon everything changed. <strong>The discovery wasn't a new strategy. It was a first principle.</strong></div>
            </div>
          </div>

          <p>
            The best part? What I discovered wasn't some complicated quant model or insider edge. It was simple, boring, and it <strong>worked every time I applied it with discipline.</strong>
          </p>
        </div>
      </section>

      {/* SECRETS SECTION */}
      <section className="secrets-wrap">
        <div className="s30-section-header reveal" ref={addToRevealRefs}>
          <div>
            <div className="section-label num" data-num="02">The Discovery</div>
            <h2>Two Secrets.<br /><em>One Framework.</em></h2>
          </div>
          <p>These aren't shortcuts or tips. They're first principles that permanently altered how I approach every single investment decision.</p>
        </div>

        <div className="secrets-grid">
          <div className="secret-card reveal" ref={addToRevealRefs}>
            <div className="secret-number">01</div>
            <div className="secret-tag">Secret #1</div>
            <h3>Know <em>What</em> to Buy - and When</h3>
            <p>After cycling through every strategy imaginable, the discovery was pattern recognition at the business level - not the chart level. The type of companies at the right point in their cycle that almost always reward patient capital.</p>
            <p>Suzlon. Inox Wind. Sanghvi Movers. All Secret #1 picks.</p>
            <div className="secret-result">
              <div className="result-number">3 picks</div>
              <div className="result-label">Each returned 2–3× within 12 months of application</div>
            </div>
          </div>

          <div className="secret-card reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="secret-number">02</div>
            <div className="secret-tag">Secret #2 - The More Powerful One</div>
            <h3>What You <em>Don't Buy</em> Is the Real Edge</h3>
            <p>When I forensically analysed 10 years of trades, the revelation wasn't my winners - it was my avoidable losers. A category of businesses, valuations, time-frames, and narratives that destroyed returns when I ignored the rules.</p>
            <p>Not buying them would have added <strong>3.2% CAGR to my portfolio.</strong></p>
            <div className="secret-result">
              <div className="result-number">+3.2%</div>
              <div className="result-label">CAGR left on the table every single year by not applying this principle</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section className="s30-proof">
        <div className="s30-section-header reveal" ref={addToRevealRefs}>
          <div>
            <div className="section-label num" data-num="03">Verified Track Record</div>
            <h2>Real Trades.<br /><em>Real Returns.</em></h2>
          </div>
          <p>Past performance doesn't guarantee future results. But the framework that generated these results can be learned, replicated, and applied.</p>
        </div>

        <div className="trades-grid">
          <div className="trade-card reveal" ref={addToRevealRefs}>
            <div className="trade-stock">NSE: SUZLON</div>
            <div className="trade-name">Suzlon Energy</div>
            <div className="trade-return">2×</div>
            <div className="trade-time">Returned in ~12 months</div>
            <div className="trade-bar"></div>
          </div>
          <div className="trade-card reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="trade-stock">NSE: INOXWIND</div>
            <div className="trade-name">Inox Wind</div>
            <div className="trade-return">3×</div>
            <div className="trade-time">Returned in ~12 months</div>
            <div className="trade-bar"></div>
          </div>
          <div className="trade-card reveal reveal-delay-3" ref={addToRevealRefs}>
            <div className="trade-stock">NSE: SANGHVIMOV</div>
            <div className="trade-name">Sanghvi Movers</div>
            <div className="trade-return">~2×</div>
            <div className="trade-time">Returned in ~12 months</div>
            <div className="trade-bar"></div>
          </div>
        </div>
      </section>

      {/* COMPOUNDING CALCULATOR */}
      <section className="calc-wrap">
        <div className="calc-inner">
          <div className="calc-left reveal" ref={addToRevealRefs}>
            <div className="calc-label">The 8th Wonder</div>
            <h2>Why <em>3%</em> Is Worth ₹171 Crore</h2>
            <p>They call compounding the 8th wonder of the world. Most investors treat a 3% CAGR difference as noise. Over 30 years, it is not noise. It is the difference between a comfortable retirement and generational wealth.</p>
            <p>This is what Secret #2 - simply <em>not buying</em> the wrong stocks - actually means in rupees.</p>
          </div>
          <div className="calc-visual reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="calc-row">
              <div className="calc-row-label">Starting Capital</div>
              <div className="calc-row-value">₹1 Crore</div>
            </div>
            <div className="calc-row">
              <div className="calc-row-label">Time Horizon</div>
              <div className="calc-row-value">30 Years</div>
            </div>
            <div className="calc-divider"></div>
            <div className="calc-row">
              <div className="calc-row-label">At 17% CAGR</div>
              <div className="calc-row-value">₹66 Crore</div>
            </div>
            <div className="calc-row">
              <div className="calc-row-label">At 20% CAGR (+3%)</div>
              <div className="calc-row-value highlight big">₹237 Crore</div>
            </div>
            <div className="calc-delta">
              <div className="delta-num">₹171 Crore</div>
              <div className="delta-label">The difference 3% makes - over 30 years</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL LEARN */}
      <section className="s30-learn">
        <div className="s30-section-header reveal" ref={addToRevealRefs}>
          <div>
            <div className="section-label num" data-num="04">The Super30 Program</div>
            <h2>What You'll<br /><em>Actually</em> Learn.</h2>
          </div>
          <p>No stardust. No get-rich-quick. First principles, taught directly, with context from real trades across a decade.</p>
        </div>

        <div className="learn-grid">
          {[
            { id: 'S1', title: 'Secret #1 - The Buying Framework', desc: 'Identify the business models and market cycles that consistently reward patient investors. The exact framework behind Suzlon, Inox Wind, and Sanghvi Movers.' },
            { id: 'S2', title: 'Secret #2 - The Avoidance List', desc: 'Business models to avoid forever. Valuation zones that destroy returns. Timeframes that don\'t work. The narrative patterns that belong in the "pump & dump" bucket.' },
            { id: 'FP', title: 'First Principles Stock Analysis', desc: 'How to think about businesses from first principles - not analyst reports. The mental models that cut through noise and lead to high-conviction picks.' },
            { id: 'WR', title: 'Improving Your Win Rate', desc: 'The structural habits and process checks that moved the win rate from random to 72% - across 5 years of documented trades and market cycles.' },
            { id: 'PS', title: 'Position Sizing & Portfolio Construction', desc: 'The difference between a 10X stock and a 10X portfolio. How to size positions so your winners actually move the needle on your overall returns.' },
            { id: 'LS', title: 'Learning From Losses', desc: 'MAS Financial. Repco Home Finance. DB Corp. The mistakes that always happen and the system that prevents the same mistake from hurting you twice.' },
          ].map((item, i) => (
            <div key={item.id} className={`learn-item reveal reveal-delay-${i % 4}`} ref={addToRevealRefs}>
              <div className="learn-icon">{item.id}</div>
              <div className="learn-content">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WIN RATE STATS */}
      <section className="winrate-wrap">
        <div className="winrate-inner">
          <div className="winrate-card reveal" ref={addToRevealRefs}>
            <div className="winrate-number">72%</div>
            <div className="winrate-desc">Win rate on<br />positions held {'>'}1 year<br />over the last 5 years</div>
          </div>
          <div className="winrate-card reveal reveal-delay-1" ref={addToRevealRefs}>
            <div className="winrate-number">8×</div>
            <div className="winrate-desc">Win / Loss ratio<br />in absolute ₹ terms<br />over the last 5 years</div>
          </div>
          <div className="winrate-card reveal reveal-delay-2" ref={addToRevealRefs}>
            <div className="winrate-number">10yr</div>
            <div className="winrate-desc">Of live investing<br />distilled into a<br />single framework</div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - This uses the existing logic */}
      <Super30Pricing program={program} />

      {/* FINAL CTA */}
      <section className="s30-cta-section">
        <div className="cta-bg-overlay" />
        <h2 className="reveal" ref={addToRevealRefs}>Stop Leaving<br /><em>3% on the Table.</em></h2>
        <p className="reveal reveal-delay-1" ref={addToRevealRefs}>
          The Super30 is a limited cohort. When the seats are gone, they are gone. No reruns. No recordings sold separately. Show up or miss out.
        </p>
        <div className="cta-group reveal reveal-delay-2" ref={addToRevealRefs}>
          <a href="#apply" className="s30-btn-primary" style={{ fontSize: '0.9rem', padding: '20px 44px' }}>
            <span>Reserve My Seat in Super30</span>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
        <div className="cta-note reveal reveal-delay-3" ref={addToRevealRefs}>
          {program.applyByDate ? `${program.applyByDate} · ` : ""}Limited Seats · First Principles Only · No Stardust
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className="s30-disclaimer">
        <p>
          Past performance is not indicative of future results. All investments carry risk including the risk of loss of principal. The information presented is for educational purposes only and does not constitute financial advice. Please consult a SEBI-registered investment advisor before making investment decisions. First Principles Investing is an educational platform.
        </p>
      </div>
    </div>
  );
}
