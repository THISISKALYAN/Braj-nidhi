"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingWidgets from '@/components/FloatingWidgets';
import BookNowButton from '@/components/BookNowButton';
import Link from 'next/link';
import Image from 'next/image';

/* ─── DATA ─── */
const packages = [
  {
    id: 1, tag: "Popular", title: "Chaurasi Kos Yatra",
    subtitle: "Complete Circumambulation of Braj",
    desc: "Experience the ultimate spiritual journey covering all 84 Kos of Braj Bhoomi. Visit the most sacred forests, kunds, and pastime places of Radha and Krishna.",
    price: "₹29,999", priceLabel: "Starting From", duration: "3 Days / 2 Nights",
    ideal: ["Families", "Pilgrims", "Spiritual Groups"],
    highlights: ["Temple Darshan", "Heritage Walk", "Cultural Immersion", "Sattvic Meals"],
    image: "/IMG_3846.webp", badge: "Most Popular", color: "#d4af37",
  },
  {
    id: 2, tag: "Vrindavan", title: "Sapt Devalaya Darshan",
    subtitle: "Seven Divine Temples of Vrindavan",
    desc: "Journey through the seven ancient historical temples established by the Goswamis of Vrindavan — Radha Raman, Radha Damodar, Radha Shyamasundar, and more. A deeply moving spiritual experience.",
    price: "₹14,999", priceLabel: "Starting From", duration: "1 Day / 2 Days",
    ideal: ["Devotees", "Seekers", "Solo Travelers"],
    highlights: ["7 Temple Darshan", "Expert Guide", "Prasad Included", "Flexible Timing"],
    image: "https://blog.yatradham.org/wp-content/uploads/2025/03/Shri-Radha-Raman-Temple.webp", badge: "Devotee's Choice", color: "#c87941",
  },
  {
    id: 3, tag: "Exclusive", title: "Customized Yatra",
    subtitle: "Your Perfect Pilgrimage",
    desc: "A completely personalized spiritual journey tailored to your soul. Select your divine destinations, set your own pace, and travel in premium comfort with a dedicated guide and private vehicle.",
    price: "On Request", priceLabel: "Custom Pricing", duration: "Flexible",
    ideal: ["Couples", "VIPs", "Corporate Groups"],
    highlights: ["Private Vehicle", "Personal Guide", "Premium Hotels", "Custom Itinerary"],
    image: "/keshi ghat.webp", badge: "Premium", color: "#6b8f5e",
  },
];

const destinations = [
  { name: "Vrindavan", label: "Braj Bhoomi", image: "/vrindavan_new.webp", span: "wide" },
  { name: "Mathura", label: "Birthplace of Krishna", image: "/mathura_new.webp", span: "normal" },
  { name: "Nandgaon", label: "Krishna's Childhood Home", image: "/nandgaon_new.webp", span: "normal" },
  { name: "Barsana", label: "Radha's Divine Abode", image: "/IMG_3637.webp", span: "wide" },
];

const journeySteps = [
  { num: "01", title: "Choose Your Yatra", desc: "Select from our curated packages or create your own custom journey." },
  { num: "02", title: "Plan With Us", desc: "Our spiritual experts craft the perfect itinerary for your needs." },
  { num: "03", title: "Travel In Comfort", desc: "Premium transport, handpicked hotels, and sattvic dining throughout." },
  { num: "04", title: "Experience Divinity", desc: "Walk the divine lands, receive divine darshan, and return transformed." },
];

const testimonials = [
  { 
    name: "Rajesh Sharma", 
    location: "Delhi", 
    text: "Walking the sacred pathways of Nandgaon and Barsana was an ethereal experience. The narration of leelas by the Braj Nidhi guides made us feel like we were living in the pastimes of Radha and Krishna.", 
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  { 
    name: "Priya Patel", 
    location: "Mumbai", 
    text: "The Sapt Devalaya Darshan was impeccably organized. We completed the parikrama of the seven historical temples of Vrindavan with absolute ease, high devotion, and wonderful sattvic prasad. Highly recommended!", 
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
  },
  { 
    name: "Anand & Meera Gupta", 
    location: "Jaipur", 
    text: "Taking our elderly parents for the Chaurasi Kos Yatra was a dream we couldn't fulfill until we found Braj Nidhi. The premium AC transport, gentle care, and pure sattvic meals kept everyone healthy and blissful.", 
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
  },
  { 
    name: "Dr. Kavita Reddy", 
    location: "Hyderabad", 
    text: "Our customized family yatra was a journey of a lifetime. The personalized itinerary allowed us to spend peaceful hours in the quiet forest groves of Vrindavan and witness the sublime Yamuna Aarti.", 
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&q=80&w=150&h=150"
  },
  { 
    name: "Suresh Iyer", 
    location: "Chennai", 
    text: "Every detail of the yatra—from the comfortable lodging to the expert guidance—resonates with devotion. It wasn't just a sightseeing trip; it was a deep, soul-stirring spiritual awakening.", 
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150"
  },
];

/* ─── ANIMATED COUNTER HOOK ─── */
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}



/* ─── COMPONENT ─── */
export default function BrajYatra() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePackage, setActivePackage] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const matchedIndex = packages.findIndex(pkg =>
      pkg.title.toLowerCase().includes(query) ||
      pkg.tag.toLowerCase().includes(query) ||
      pkg.desc.toLowerCase().includes(query) ||
      pkg.subtitle.toLowerCase().includes(query)
    );

    if (matchedIndex !== -1) {
      setActivePackage(matchedIndex);
    }

    const element = document.getElementById('packages');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const counter1 = useCounter(12, 1800);
  const counter2 = useCounter(5000, 2200);
  const counter3 = useCounter(98, 2000);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-cycle packages
  const [pkgPaused, setPkgPaused] = useState(false);
  useEffect(() => {
    if (pkgPaused) return;
    const timer = setInterval(() => {
      setActivePackage(prev => (prev + 1) % packages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [pkgPaused]);

  // Swiper initialization for testimonials
  useEffect(() => {
    let testimonialsSwiper: any;
    let resumeAutoplayFn: any;

    const initTestimonialsSwiper = () => {
      if (typeof window !== 'undefined' && (window as any).Swiper) {
        const swiperElements = document.querySelectorAll('.swiper');
        if (swiperElements.length > 0) {
          try {
            testimonialsSwiper = new (window as any).Swiper('.testimonials-slider', {
              slidesPerView: 'auto',
              spaceBetween: 24,
              loop: true,
              speed: 5000,
              autoplay: { 
                delay: 0, 
                disableOnInteraction: false,
                pauseOnMouseEnter: false
              },
              grabCursor: true,
              freeMode: true,
              observer: true,
              observeParents: true,
              on: {
                touchEnd: function(swiper: any) {
                  if (swiper && swiper.autoplay) {
                    swiper.autoplay.start();
                  }
                },
                touchStart: function(swiper: any) {
                  if (swiper && swiper.autoplay) {
                    swiper.autoplay.start();
                  }
                }
              }
            });

            // Extra layer of protection using native DOM touch events to handle vertical scrolls cleanly
            const sliderEl = document.querySelector('.testimonials-slider');
            if (sliderEl) {
              resumeAutoplayFn = () => {
                if (testimonialsSwiper && testimonialsSwiper.autoplay) {
                  try {
                    testimonialsSwiper.autoplay.start();
                  } catch (err) {}
                }
              };
              sliderEl.addEventListener('touchstart', resumeAutoplayFn, { passive: true });
              sliderEl.addEventListener('touchend', resumeAutoplayFn, { passive: true });
              sliderEl.addEventListener('touchcancel', resumeAutoplayFn, { passive: true });
            }
          } catch (e) {
            console.error("Error initializing Swiper:", e);
          }
        }
      }
    };

    let pollTimer: NodeJS.Timeout;
    if (typeof window !== 'undefined') {
      if ((window as any).Swiper) {
        initTestimonialsSwiper();
      } else {
        pollTimer = setInterval(() => {
          if ((window as any).Swiper) {
            clearInterval(pollTimer);
            initTestimonialsSwiper();
          }
        }, 100);
      }
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      try {
        const sliderEl = document.querySelector('.testimonials-slider');
        if (sliderEl && resumeAutoplayFn) {
          sliderEl.removeEventListener('touchstart', resumeAutoplayFn);
          sliderEl.removeEventListener('touchend', resumeAutoplayFn);
          sliderEl.removeEventListener('touchcancel', resumeAutoplayFn);
        }
        if (testimonialsSwiper && typeof testimonialsSwiper.destroy === 'function') {
          testimonialsSwiper.destroy(true, false);
        }
      } catch (e) {
        console.error("Error destroying Swiper:", e);
      }
    };
  }, []);

  const nextPackage = () => setActivePackage(prev => (prev + 1) % packages.length);
  const prevPackage = () => setActivePackage(prev => (prev - 1 + packages.length) % packages.length);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 40 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, margin: "-80px" } as const,
    transition: { duration: 0.9, ease: "easeOut" as const }
  };

  return (
    <div className="index-page braj-yatra-page">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══════════════════════════════════════════
           BRAJ YATRA — WORLD-CLASS EDITION
           ═══════════════════════════════════════════ */

        .braj-yatra-page { --gold: #d4af37; --gold-light: #f0d060; --dark: #0a0e14; --dark-soft: #111820; }

        /* ── Header overrides ── */
        .braj-yatra-page header:not(.scrolled) nav ul li a,
        .braj-yatra-page header:not(.scrolled) .mobile-menu-btn { color: #1e293b !important; }
        .braj-yatra-page header:not(.scrolled) .btn-book { background: #f37022; color: #fff !important; border: 1px solid #f37022; }
        .braj-yatra-page header:not(.scrolled) .btn-book:hover { background: #e05e11; border-color: #e05e11; }
        .braj-yatra-page header:not(.scrolled) .btn-login { color: #1e293b !important; border: 1px solid rgba(30,41,59,0.25); }
        .braj-yatra-page header:not(.scrolled) .user-label { color: rgba(30,41,59,0.65); }
        .braj-yatra-page header:not(.scrolled) .user-name { color: #1e293b; }

        /* ── Scroll Progress Bar ── */
        .scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #f37022, #f5e07a); z-index: 9999; transform-origin: left; }

        /* ═══ HERO — CINEMATIC EDITION ═══ */
        .y-hero {
          position: relative;
          min-height: 100vh;
          height: auto;
          background-color: #faf8f5;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          padding: 140px 8% 80px;
          overflow: hidden;
        }

        /* Subtle noise & background elements */
        .y-hero-noise { position: absolute; inset: 0; z-index: 2; opacity: 0.02; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); pointer-events: none; }
        .y-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, transparent 0%, #f37022 30%, #f37022 70%, transparent 100%); z-index: 4; }

        /* Main content block (on the upside) */
        .y-hero-content {
          position: relative;
          z-index: 3;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 820px;
          margin-bottom: 48px;
        }

        /* Eyebrow pill */
        .y-eyebrow { display: inline-flex; align-items: center; gap: 10px; background: rgba(243,112,34,0.08); border: 1px solid rgba(243,112,34,0.25); backdrop-filter: blur(16px); color: #f37022; font-size: 0.7rem; font-weight: 700; letter-spacing: 3.5px; text-transform: uppercase; padding: 8px 20px; border-radius: 50px; margin-bottom: 24px; }
        .y-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #f37022; animation: pulseDot 2s ease-in-out infinite; flex-shrink: 0; }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.35; transform:scale(0.55); } }

        /* Big title matching image */
        .y-hero-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: clamp(2.8rem, 5.5vw, 5rem) !important;
          font-weight: 400 !important;
          line-height: 1.05 !important;
          color: #0c1829;
          letter-spacing: 0.03em;
          margin-bottom: 24px;
          text-shadow: none;
        }
        .y-hero-title .y-orange {
          color: #f37022 !important;
          display: inline;
        }
        .y-hero-title .y-navy {
          color: #0c1829 !important;
          display: inline;
        }

        /* Descriptive block matching image */
        .y-hero-desc {
          font-family: var(--font-outfit), sans-serif;
          font-size: clamp(0.95rem, 1.15vw, 1.12rem);
          color: #4b5563;
          line-height: 1.8;
          max-width: 720px;
          margin-bottom: 0px;
          font-weight: 400;
          display: block;
        }

        /* PREMIUM IMAGE SLIDER CONTAINER */
        .y-slider-container {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.1);
          border: 10px solid #ffffff;
          background: #ffffff;
          aspect-ratio: 16 / 9;
          min-height: 360px;
          max-height: 700px;
          z-index: 5;
        }
        
        .y-slider-inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 12px;
          background: #0f172a;
        }

        .y-slider-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Inset white border outline overlay */
        .y-slider-border-overlay {
          position: absolute;
          inset: 16px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          pointer-events: none;
          z-index: 6;
          border-radius: 8px;
        }

        /* Legibility gradient at the bottom of the slider */
        .y-slider-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.15) 35%, rgba(0, 0, 0, 0) 100%);
          z-index: 4;
          pointer-events: none;
        }

        /* Bottom-centered bold title */
        .y-slider-title-overlay {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          color: #ffffff;
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: clamp(2rem, 5.5vw, 3.8rem);
          text-align: center;
          z-index: 7;
          letter-spacing: 0.08em;
          text-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          text-transform: uppercase;
          line-height: 1.1;
          pointer-events: none;
          width: 95%;
          white-space: normal;
        }

        /* Circular Navigation Arrows */
        .y-slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .y-slider-arrow:hover {
          background: #f37022;
          border-color: #f37022;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 8px 24px rgba(243, 112, 34, 0.35);
        }
        .y-slider-arrow:active {
          transform: translateY(-50%) scale(0.96);
        }
        .y-slider-arrow.y-left {
          left: 36px;
        }
        .y-slider-arrow.y-right {
          right: 36px;
        }

        /* Search Packages Card */
        .y-search-card {
          position: absolute;
          bottom: 40px;
          right: calc(8% + 10px);
          z-index: 10;
          background: #ffffff;
          box-shadow: 0 15px 45px rgba(15, 23, 42, 0.15);
          border-radius: 8px;
          padding: 8px;
          width: 100%;
          max-width: 480px;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .y-search-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
        }
        .y-search-form {
          display: flex;
          width: 100%;
          align-items: center;
        }
        .y-search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 18px;
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 500;
          background: transparent;
        }
        .y-search-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        .y-search-btn {
          background: #f37022;
          border: none;
          color: #ffffff;
          width: 48px;
          height: 48px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .y-search-btn:hover {
          background: #e05e11;
        }
        .y-search-btn:active {
          transform: scale(0.96);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .y-hero {
            padding: 130px 5% 60px;
          }
          .y-hero-content {
            align-items: center;
            max-width: 100%;
            text-align: center;
            margin-bottom: 36px;
          }
          .y-hero-desc {
            margin: 0 auto;
          }
          .y-slider-container {
            aspect-ratio: 16 / 9;
            min-height: 280px;
          }
          .y-search-card {
            position: relative;
            bottom: auto;
            right: auto;
            margin: 30px auto 0;
            max-width: 100%;
          }
          .y-slider-arrow.y-left {
            left: 20px;
          }
          .y-slider-arrow.y-right {
            right: 20px;
          }
          .y-slider-title-overlay {
            bottom: 24px;
          }
        }
        @media (max-width: 768px) {
          .y-hero {
            padding: 120px 4% 50px;
          }
          .y-slider-container {
            border-width: 6px;
            aspect-ratio: 4 / 3;
          }
          .y-slider-border-overlay {
            inset: 10px;
          }
          .y-slider-title-overlay {
            bottom: 20px;
            font-size: 1.45rem;
            width: 95%;
            word-wrap: break-word;
          }
        }

        /* ═══ STATS STRIP ═══ */
        .y-stats-wrapper {
          background: #ffffff;
          width: 100%;
          position: relative;
          z-index: 11;
          padding: 0;
          margin: 0;
        }
        .y-stats-strip {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 24px;
          padding: 42px 4%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          position: relative;
          z-index: 12;
          margin: -20px auto 0;
          width: 88%;
          max-width: 1200px;
          box-shadow: 0 25px 55px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.4s ease;
        }
        .y-stats-strip:hover {
          transform: translateY(-2px);
          box-shadow: 0 30px 65px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .y-stat {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .y-stat-num {
          font-family: var(--font-bebas-neue), cursive;
          font-size: clamp(2.5rem, 3.8vw, 3.8rem);
          color: #d4af37;
          line-height: 1;
          letter-spacing: 0.04em;
          font-weight: 700;
        }
        .y-stat-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #475569;
          font-weight: 700;
          margin-top: 10px;
        }
        .y-stat-divider {
          width: 1px;
          background: rgba(15, 23, 42, 0.08);
          align-self: stretch;
        }

        /* ═══ INTRO ═══ */
        .y-intro { padding: 70px 8%; background: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .y-sec-eyebrow { display: inline-flex; align-items: center; gap: 12px; color: var(--gold); font-size: 0.72rem; font-weight: 700; letter-spacing: 3.5px; text-transform: uppercase; margin-bottom: 22px; }
        .y-sec-eyebrow::before { content: ''; width: 32px; height: 2px; background: var(--gold); border-radius: 2px; }
        .y-sec-title { font-family: var(--font-bebas-neue), cursive !important; font-size: clamp(2.4rem, 4.5vw, 3.8rem) !important; font-weight: 400 !important; color: var(--dark); line-height: 1 !important; margin-bottom: 28px; letter-spacing: 0.04em; }
        .y-sec-title .y-accent { color: var(--gold); }
        .y-body { font-size: 1.02rem; line-height: 1.9; color: #666; margin-bottom: 16px; }

        .y-feature-list { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-top: 32px; padding: 0; }
        .y-feature-list li { display: flex; align-items: center; gap: 16px; font-size: 0.95rem; color: #333; font-weight: 500; }
        .y-feature-check { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.18)); border: 1.5px solid rgba(212,175,55,0.35); display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 0.65rem; flex-shrink: 0; }

        /* Intro image stack */
        .y-intro-imgs { position: relative; height: 600px; }
        .y-intro-main { position: absolute; right: 0; top: 0; width: 75%; height: 82%; object-fit: cover; border-radius: 28px; box-shadow: 0 30px 70px rgba(0,0,0,0.12); }
        .y-intro-accent { position: absolute; left: 0; bottom: 0; width: 50%; height: 50%; object-fit: cover; border-radius: 24px; border: 10px solid #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.12); z-index: 2; }
        .y-intro-badge { position: absolute; top: 35px; left: 25px; z-index: 3; background: var(--dark); color: #fff; padding: 22px 28px; border-radius: 22px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); text-align: center; }
        .y-intro-badge strong { display: block; font-family: var(--font-bebas-neue), cursive; font-size: 2.5rem; color: var(--gold); line-height: 1; }
        .y-intro-badge span { font-size: 0.68rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 1.5px; }
        /* Decorative ring */
        .y-intro-ring { position: absolute; right: -20px; top: -20px; width: 140px; height: 140px; border: 2px solid rgba(212,175,55,0.15); border-radius: 50%; z-index: 0; }

        /* ═══ JOURNEY TIMELINE — VERTICAL ═══ */
        .y-journey { padding: 60px 8%; background: #f8f7f3; overflow: hidden; }
        .y-journey-inner { display: grid; grid-template-columns: 260px 1fr; gap: 60px; align-items: center; }

        /* Left Orb */
        .y-journey-orb-wrap { display: flex; align-items: center; justify-content: center; }
        .y-journey-orb {
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle at 38% 36%, #c8a84b, #8b6914 60%, #5a440d 100%);
          display: flex; align-items: center; justify-content: center; text-align: center;
          box-shadow: 0 8px 40px rgba(139, 105, 20, 0.35), inset 0 -6px 20px rgba(0,0,0,0.25), inset 0 6px 20px rgba(255,220,100,0.12);
          position: relative; flex-shrink: 0;
          animation: orbFloat 6s ease-in-out infinite;
        }
        @keyframes orbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .y-journey-orb::before {
          content: ''; position: absolute;
          inset: 10px; border-radius: 50%;
          border: 1.5px solid rgba(255, 220, 100, 0.25);
        }
        .y-journey-orb-text {
          font-family: var(--font-bebas-neue), cursive;
          font-size: 1.15rem;
          color: #fff;
          letter-spacing: 0.06em;
          line-height: 1.25;
          text-shadow: 0 2px 12px rgba(0,0,0,0.45);
          padding: 0 22px;
          position: relative; z-index: 1;
        }

        /* Right — header + vertical steps */
        .y-journey-right { display: flex; flex-direction: column; }
        .y-journey-header { margin-bottom: 50px; }
        .y-journey-header .y-sec-eyebrow { margin-bottom: 14px; }

        /* Vertical list */
        .y-vlist { position: relative; display: flex; flex-direction: column; gap: 0; }
        .y-vlist::before {
          content: ''; position: absolute;
          left: 24px; top: 48px; bottom: 48px;
          width: 2px;
          background: linear-gradient(to bottom, transparent, rgba(212,175,55,0.3) 15%, var(--gold) 50%, rgba(212,175,55,0.3) 85%, transparent);
          z-index: 0;
        }
        .y-vitem { display: flex; align-items: flex-start; gap: 28px; padding: 0 0 44px 0; position: relative; }
        .y-vitem:last-child { padding-bottom: 0; }
        .y-vitem-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; position: relative; z-index: 1; }
        .y-vitem-icon {
          width: 50px; height: 50px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; color: #fff;
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .y-vitem:hover .y-vitem-icon { transform: scale(1.12); box-shadow: 0 10px 30px rgba(0,0,0,0.22); }
        .y-vitem-icon.ic-1 { background: #1b2a4a; }
        .y-vitem-icon.ic-2 { background: #1b3a3a; }
        .y-vitem-icon.ic-3 { background: #c87941; }
        .y-vitem-icon.ic-4 { background: #2a3a1b; }
        .y-vitem-num {
          font-family: var(--font-bebas-neue), cursive;
          font-size: 0.72rem;
          color: rgba(0,0,0,0.28);
          letter-spacing: 1px;
          margin-top: 6px;
        }
        .y-vitem-body { padding-top: 8px; }
        .y-vitem-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.15rem !important;
          font-weight: 400 !important;
          color: #0a0e14;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .y-vitem-desc { font-size: 0.88rem; line-height: 1.75; color: #74748a; max-width: 480px; }

        /* Responsive */
        @media (max-width: 900px) {
          .y-journey-inner { grid-template-columns: 1fr; gap: 40px; }
          .y-journey-orb { width: 180px; height: 180px; }
          .y-journey-orb-text { font-size: 1rem; }
        }

        /* ═══ PACKAGES ═══ */
        .y-packages { padding: 70px 8%; background: #ffffff; position: relative; overflow: hidden; }
        .y-packages::before { content: ''; position: absolute; top: -200px; right: -100px; width: 600px; height: 600px; background: radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%); pointer-events: none; }
        .y-packages::after { content: ''; position: absolute; bottom: -200px; left: -100px; width: 500px; height: 500px; background: radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 70%); pointer-events: none; }

        .y-pkg-header { margin-bottom: 60px; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .y-pkg-header .y-sec-title { color: var(--dark); margin-bottom: 0; }
        .y-pkg-subtitle { font-size: 0.92rem; color: #64748b; max-width: 340px; line-height: 1.75; text-align: right; }

        /* Package nav arrows */
        .y-pkg-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 50px; }
        .y-pkg-tabs { display: flex; gap: 8px; flex: 1; }
        .y-pkg-arrow {
          width: 42px; height: 42px; border-radius: 50%;
          background: #f1f5f9; border: 1.5px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          color: #475569; cursor: pointer; flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          font-size: 0.9rem;
        }
        .y-pkg-arrow:hover { background: var(--dark); border-color: var(--dark); color: #fff; transform: scale(1.08); box-shadow: 0 6px 20px rgba(10,14,20,0.15); }
        /* Progress dots */
        .y-pkg-dots { display: flex; gap: 7px; align-items: center; }
        .y-pkg-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; transition: all 0.4s ease; cursor: pointer; }
        .y-pkg-dot.active { background: var(--gold); width: 22px; border-radius: 4px; }
        /* Progress bar under active tab */
        .y-pkg-tab { padding: 11px 26px; border-radius: 50px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.4s cubic-bezier(0.22,1,0.36,1); border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; letter-spacing: 0.5px; position: relative; overflow: hidden; }
        .y-pkg-tab.active { background: var(--dark); border-color: var(--dark); color: #fff; font-weight: 700; box-shadow: 0 6px 24px rgba(10,14,20,0.15); }
        .y-pkg-tab:hover:not(.active) { border-color: #cbd5e1; color: #334155; background: #f1f5f9; }
        .y-pkg-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          background: var(--gold);
          border-radius: 2px;
          animation: pkgTabProgress 4s linear;
        }
        @keyframes pkgTabProgress { from { width: 0%; } to { width: 100%; } }

        .y-bento { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; min-height: 560px; }
        .y-bento-img { position: relative; border-radius: 28px; overflow: hidden; background: #f1f5f9; }
        .y-bento-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 1s cubic-bezier(0.22,1,0.36,1); }
        .y-bento-img:hover img { transform: scale(1.05); }
        .y-bento-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,5,10,0.88) 0%, rgba(5,5,10,0.25) 55%, rgba(5,5,10,0.05) 100%); z-index: 1; }
        .y-bento-img-content { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 40px; }

        /* Left/Right Overlaid Arrows on Image */
        .y-bento-img-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: #ffffff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          z-index: 4;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .y-bento-img-arrow:hover {
          background: #ffffff;
          color: var(--dark);
          border-color: #ffffff;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.25);
        }
        .y-bento-img-arrow.left { left: 24px; }
        .y-bento-img-arrow.right { right: 24px; }

        .y-badge { display: inline-block; background: var(--gold); color: var(--dark); font-size: 0.68rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; padding: 6px 16px; border-radius: 50px; margin-bottom: 18px; }
        .y-pkg-title { font-family: var(--font-bebas-neue), cursive !important; font-size: 2.4rem !important; font-weight: 400 !important; color: #fff; line-height: 1 !important; margin-bottom: 10px; letter-spacing: 0.05em; }
        .y-pkg-sub { font-size: 0.88rem; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .y-duration { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); font-size: 0.8rem; padding: 8px 18px; border-radius: 50px; }

        .y-bento-info { display: flex; flex-direction: column; gap: 16px; }
        .y-info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; flex: 1; transition: border-color 0.3s ease, box-shadow 0.3s ease; position: relative; overflow: hidden; }
        .y-info-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold), #f0d060, var(--gold)); }
        .y-info-card:hover { border-color: rgba(212,175,55,0.3); box-shadow: 0 8px 30px rgba(212,175,55,0.08); }

        .y-price-lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 2.5px; color: #94a3b8; margin-bottom: 6px; font-weight: 600; }
        .y-price { font-family: var(--font-bebas-neue), cursive; font-size: 3.2rem; color: var(--dark); line-height: 1; letter-spacing: 0.04em; }
        .y-price-note { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; margin-bottom: 24px; }
        .y-pkg-desc { font-size: 0.9rem; line-height: 1.8; color: #64748b; margin-bottom: 28px; }

        .y-btn-book { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: var(--dark); color: #fff; padding: 17px 28px; border-radius: 50px; font-family: var(--font-bebas-neue), cursive; font-size: 1.15rem; letter-spacing: 1.5px; text-decoration: none; transition: all 0.4s cubic-bezier(0.22,1,0.36,1); border: none; cursor: pointer; position: relative; overflow: hidden; }
        .y-btn-book::before { content:''; position: absolute; top:0; left:-80%; width:60%; height:100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.12), transparent); transform: skewX(-20deg); transition: left 0.7s ease; }
        .y-btn-book:hover::before { left: 130%; }
        .y-btn-book:hover { background: var(--gold); color: var(--dark); transform: translateY(-2px); box-shadow: 0 12px 35px rgba(212,175,55,0.35); }

        .y-highlights { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 28px; }
        .y-highlights-lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 2.5px; color: #94a3b8; margin-bottom: 18px; font-weight: 600; }
        .y-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .y-pill { display: inline-flex; align-items: center; gap: 7px; background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; font-size: 0.78rem; padding: 7px 14px; border-radius: 50px; transition: all 0.3s ease; }
        .y-pill:hover { background: rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.3); color: #92700c; }
        .y-pill i { color: var(--gold); font-size: 0.68rem; }
        .y-ideal { margin-top: 18px; padding-top: 18px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .y-ideal-lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 600; }
        .y-ideal-tag { font-size: 0.75rem; color: #475569; background: #f8fafc; padding: 4px 13px; border-radius: 50px; border: 1px solid #e2e8f0; }

        /* ═══ DESTINATIONS ═══ */
        .y-destinations { padding: 60px 8%; background: #fdfcf8; }
        .y-dest-header { text-align: center; margin-bottom: 70px; }
        .y-dest-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr; grid-template-rows: 260px 260px; gap: 16px; }
        .y-dest-grid .y-dest:nth-child(1) { grid-row: 1 / 3; }
        .y-dest-grid .y-dest:nth-child(4) { grid-column: 2 / 4; }
        .y-dest { position: relative; border-radius: 24px; overflow: hidden; cursor: pointer; transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .y-dest:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 25px 60px rgba(0,0,0,0.14); }
        .y-dest img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.22,1,0.36,1); }
        .y-dest:hover img { transform: scale(1.08); }
        .y-dest-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,5,10,0.88) 0%, rgba(5,5,10,0.1) 60%); z-index: 1; }
        .y-dest-content { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 28px; }
        .y-dest-label { display: block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 2.5px; color: var(--gold); font-weight: 600; margin-bottom: 8px; }
        .y-dest-name { font-family: var(--font-bebas-neue), cursive !important; font-size: 1.8rem !important; font-weight: 400 !important; color: #fff; line-height: 1 !important; letter-spacing: 0.04em; }
        .y-dest:nth-child(1) .y-dest-name { font-size: 2.4rem !important; }
        .y-dest-arrow { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.85rem; z-index: 2; opacity: 0; transition: all 0.4s ease; transform: translateX(-8px); }
        .y-dest:hover .y-dest-arrow { opacity: 1; transform: translateX(0); }


        /* ═══ WHY CHOOSE US — BENTO GRID EDITION ═══ */
        .y-why { 
          padding: 60px 8%; 
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }
        /* ── Why Header ── */
        .y-why-header-wrap {
          margin-bottom: 44px;
          position: relative;
          z-index: 2;
        }
        .y-why-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #374151;
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 7px 18px;
          border-radius: 50px;
          margin-bottom: 18px;
        }
        .y-why-section-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: clamp(2.2rem, 4vw, 3.4rem) !important;
          font-weight: 400 !important;
          line-height: 1.05 !important;
          color: #0f172a !important;
          margin: 0 0 0 0;
          letter-spacing: 0.03em;
          max-width: 780px;
        }
        .y-why-section-title span {
          color: #d4af37 !important;
          font-style: normal;
          font-weight: 800;
        }
        .y-why-header-divider { display: none; }

        /* ── Bento grid ── */
        .y-why-bento {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        /* Light cards (3 of them) */
        .y-why-lcard {
          background: #f8f9fb;
          border: 1px solid #e8eaed;
          border-radius: 18px;
          padding: 36px 32px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: default;
        }
        .y-why-lcard:hover {
          border-color: #d4af37;
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.12);
          transform: translateY(-4px);
        }
        /* Card 3 spans full 2 columns on bottom row */
        .y-why-lcard.span2 {
          grid-column: 1 / 3;
        }

        /* Icon circle on light cards */
        .y-why-lcard-icon {
          width: 52px;
          height: 52px;
          border: 1.5px solid #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          font-size: 1.1rem;
          margin-bottom: 24px;
          transition: all 0.4s ease;
          background: #fff;
        }
        .y-why-lcard:hover .y-why-lcard-icon {
          border-color: #d4af37;
          color: #d4af37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
        }
        .y-why-lcard-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.5rem !important;
          font-weight: 400 !important;
          color: #0f172a;
          margin-bottom: 12px;
          line-height: 1.1;
          letter-spacing: 0.04em;
        }
        .y-why-lcard-desc {
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.9rem;
          line-height: 1.75;
          color: #64748b;
        }

        /* Dark featured card (right column, spans both rows) */
        .y-why-dcard {
          grid-column: 3 / 4;
          grid-row: 1 / 3;
          background: #0f2248;
          border-radius: 18px;
          padding: 44px 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 460px;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s ease;
        }
        .y-why-dcard::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .y-why-dcard:hover { transform: translateY(-4px); }
        .y-why-dcard-icon {
          width: 52px;
          height: 52px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.15rem;
          margin-bottom: 28px;
          background: rgba(255, 255, 255, 0.07);
        }
        .y-why-dcard-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.9rem !important;
          font-weight: 400 !important;
          color: #ffffff;
          margin-bottom: 20px;
          line-height: 1.05;
          letter-spacing: 0.04em;
        }
        .y-why-dcard-body {
          flex: 1;
        }
        .y-why-dcard-desc {
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.9rem;
          line-height: 1.78;
          color: rgba(190, 210, 245, 0.75);
          margin-bottom: 14px;
        }
        .y-why-dcard-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #d4af37;
          color: #0f172a;
          font-family: var(--font-bebas-neue), cursive;
          font-size: 1.1rem;
          font-weight: 400;
          padding: 13px 26px;
          border-radius: 50px;
          text-decoration: none;
          margin-top: 32px;
          transition: all 0.3s ease;
          letter-spacing: 0.06em;
        }
        .y-why-dcard-btn:hover {
          background: #c8a020;
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.35);
        }
        .y-why-dcard-btn i { font-size: 0.8rem; }

        /* Responsive */
        @media (max-width: 1024px) {
          .y-why-bento { grid-template-columns: 1fr 1fr; }
          .y-why-dcard { grid-column: 1 / -1; grid-row: auto; min-height: 320px; flex-direction: row; align-items: center; gap: 32px; }
          .y-why-lcard.span2 { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .y-why-bento { grid-template-columns: 1fr; }
          .y-why-dcard { flex-direction: column; }
          .y-why-lcard.span2 { grid-column: 1 / 2; }
        }

        /* ═══ CTA ═══ */
        .y-cta { padding: 0 8% 70px; background: #fff; }
        .y-cta-box {
          background-image: linear-gradient(to right, rgba(10, 14, 20, 0.85) 0%, rgba(10, 14, 20, 0.5) 100%), url('https://experiencemyindia.com/wp-content/uploads/2025/03/rog5xhi8eunkjcl0t9fn.webp') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          border-radius: 32px;
          padding: 70px 64px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 60px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .y-cta-box::before { content: ''; position: absolute; right: -80px; top: -80px; width: 500px; height: 500px; background: radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%); pointer-events: none; }
        .y-cta-box::after { content: ''; position: absolute; left: 50px; bottom: 50px; width: 200px; height: 200px; background: radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%); pointer-events: none; }
        .y-cta-tag { display: inline-flex; align-items: center; gap: 10px; color: var(--gold); font-size: 0.7rem; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 22px; font-family: var(--font-outfit), sans-serif; }
        .y-cta-title { font-family: var(--font-bebas-neue), cursive !important; font-size: clamp(2.2rem, 4vw, 3.6rem) !important; font-weight: 400 !important; color: #fff; line-height: 1.05 !important; margin-bottom: 20px; letter-spacing: 0.04em; }
        .y-cta-desc { font-family: var(--font-outfit), sans-serif; font-size: 0.98rem; color: rgba(255,255,255,0.5); line-height: 1.75; max-width: 500px; }
        .y-cta-btns { display: flex; flex-direction: column; gap: 14px; min-width: 250px; flex-shrink: 0; }
        .y-btn-cta { display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--gold); color: var(--dark); padding: 18px 36px; border-radius: 50px; font-family: var(--font-bebas-neue), cursive; font-size: 1.2rem; letter-spacing: 1.5px; text-decoration: none; transition: all 0.4s cubic-bezier(0.22,1,0.36,1); white-space: nowrap; }
        .y-btn-cta:hover { background: #e8c84a; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(212,175,55,0.45); }
        .y-btn-cta-outline { display: flex; align-items: center; justify-content: center; gap: 10px; background: transparent; color: rgba(255,255,255,0.65); padding: 16px 36px; border-radius: 50px; font-family: var(--font-bebas-neue), cursive; font-size: 1.1rem; letter-spacing: 1.5px; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.1); transition: all 0.4s ease; white-space: nowrap; }
        .y-btn-cta-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; background: rgba(255,255,255,0.05); }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1100px) {
          .y-hero-content { grid-template-columns: 1fr; }
          .y-hero-right { display: none; }
          .y-intro, .y-why-grid { grid-template-columns: 1fr; gap: 60px; }
          .y-bento { grid-template-columns: 1fr; }
          .y-bento-img { height: 400px; }
          .y-cta-box { grid-template-columns: 1fr; padding: 50px 40px; }
          .y-dest-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .y-dest-grid .y-dest:nth-child(1) { grid-row: auto; }
          .y-dest-grid .y-dest:nth-child(4) { grid-column: auto; }
          .y-dest { height: 280px; }
          .y-timeline { grid-template-columns: 1fr 1fr; gap: 40px; }
          .y-timeline::before { display: none; }
          .y-stats-strip { grid-template-columns: repeat(2, 1fr); gap: 30px; margin: -15px auto 0; width: 90%; }
          .y-stat-divider { display: none; }
        }
        @media (max-width: 768px) {
          .y-bento-img-arrow { display: none; }
          .y-hero-content { padding: 0 5%; }
          .y-hero-title { font-size: clamp(3.5rem, 12vw, 6rem) !important; }
          .y-intro, .y-packages, .y-destinations, .y-why, .y-cta, .y-journey { padding-left: 5%; padding-right: 5%; }
          .y-intro { padding-top: 50px; padding-bottom: 50px; }
          .y-intro-imgs { height: 400px; }
          .y-why-cards { grid-template-columns: 1fr; }
          .y-dest-grid { grid-template-columns: 1fr; }
          .y-dest { height: 240px; }
          .y-pkg-header { flex-direction: column; align-items: flex-start; }
          .y-pkg-subtitle { text-align: left; }
          .y-cta-box { padding: 40px 24px; border-radius: 28px; }
          .y-cta-btns { min-width: auto; }
          .y-timeline { grid-template-columns: 1fr 1fr; gap: 30px; }
          .y-stats-strip { padding: 30px 4%; grid-template-columns: repeat(2, 1fr); margin: -10px auto 0; width: 92%; border-radius: 18px; }
        }
        @media (max-width: 480px) {
          .y-hero-actions { flex-direction: column; align-items: flex-start; }
          .y-timeline { grid-template-columns: 1fr; }
          .y-stats-strip { grid-template-columns: 1fr; gap: 24px; margin: 0 auto; width: 94%; padding: 25px 4%; }
        }

        /* ─── Testimonials Gold Theme & Compact Layout Overrides ─── */
        .braj-yatra-page .testimonials-section {
          padding: 60px 8% 40px !important;
          background: #faf8f5 !important; /* Premium light warm background */
        }
        .braj-yatra-page .center-header {
          margin-bottom: 36px !important;
        }
        .braj-yatra-page .rating-badge {
          background: rgba(243,112,34,0.08) !important;
          border: 1px solid rgba(243,112,34,0.25) !important;
          color: #f37022 !important;
          font-size: 0.78rem !important;
          padding: 6px 16px !important;
          margin-bottom: 16px !important;
          box-shadow: none !important;
        }
        .braj-yatra-page .rating-badge i {
          color: #d4af37 !important; /* Gold star */
          background: rgba(212,175,55,0.1) !important;
        }
        .braj-yatra-page .center-header h2 {
          font-size: 2.2rem !important;
          font-family: 'Playfair Display', serif !important;
          font-weight: 700 !important;
          color: #0c1829 !important;
        }
        .braj-yatra-page .testimonials-slider {
          -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
          mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
        }
        .braj-yatra-page .testimonials-slider .swiper-slide {
          width: 310px !important;
        }
        .braj-yatra-page .testimonials-slider .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        .braj-yatra-page .testimonial-card {
          background: #ffffff !important; /* Pure white card for contrast */
          border: 1px solid #e2e8f0 !important;
          padding: 24px !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03) !important;
          transition: all 0.3s ease !important;
        }
        .braj-yatra-page .testimonial-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 30px rgba(212, 175, 55, 0.08) !important;
          border-color: rgba(212, 175, 55, 0.3) !important;
        }
        .braj-yatra-page .quote-icon {
          font-size: 1.4rem !important;
          color: #d4af37 !important; /* Gold Quote Icon */
          margin-bottom: 12px !important;
        }
        .braj-yatra-page .testimonial-text {
          font-size: 0.88rem !important;
          line-height: 1.6 !important;
          color: #4b5563 !important;
          margin-bottom: 20px !important;
          font-weight: 400 !important;
        }
        .braj-yatra-page .testimonial-user img {
          width: 38px !important;
          height: 38px !important;
          border: 1.5px solid #d4af37 !important; /* Gold profile border */
        }
        .braj-yatra-page .testimonial-user h4 {
          font-size: 0.88rem !important;
          color: #0c1829 !important;
          font-weight: 600 !important;
        }
        .braj-yatra-page .testimonial-user span {
          font-size: 0.75rem !important;
          color: #6b7280 !important;
        }
      `}} />



      {/* ═══ HEADER ═══ */}
      <header id="main-header" className={scrolled ? "scrolled" : ""}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/sp logo.webp" alt="Srila Prabhupada" width={100} height={60} style={{ height: '60px', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} />
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" width={165} height={55} style={{ height: '55px', width: 'auto', display: 'block' }} />
            </Link>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
            <a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/LOGO1.webp" alt="Vrindavan Chandrodaya Mandir" width={50} height={50} style={{ height: '50px', width: 'auto', display: 'block', borderRadius: '6px' }} />
            </a>
          </div>
        <nav>
          <ul>
            <li><a href="/guesthouse">Guesthouse</a></li>
            <li><a href="/weddings">Weddings</a></li>
            <li><a href="/corporate">Corporate</a></li>
            <li><a href="/braj-yatra">Braj Yatra</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
        <div className="nav-btns">
          <BookNowButton href="/guesthouse#rooms-suites" />
        </div>
        <div className="mobile-header-actions">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" style={{ height: "45px", width: "auto", cursor: "pointer" }} />
              </Link>
              <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X size={24} /></button>
            </div>
            <div className="mobile-nav-links">
              <ul>
                <li><a href="/guesthouse" onClick={() => setIsMobileMenuOpen(false)}>Guesthouse</a></li>
                <li><a href="/weddings" onClick={() => setIsMobileMenuOpen(false)}>Weddings</a></li>
                <li><a href="/corporate" onClick={() => setIsMobileMenuOpen(false)}>Corporate</a></li>
                <li><a href="/braj-yatra" onClick={() => setIsMobileMenuOpen(false)}>Braj Yatra</a></li>
                <li><a href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a></li>
              </ul>
            </div>
            <div className="mobile-menu-footer">
              <BookNowButton href="/guesthouse#rooms-suites" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', textAlign: 'center', marginTop: '4px' }} />
            </div>
          </div>
        </div>
      )}

      <main>
        {/* ═══ HERO — DAYTIME CINEMATIC ═══ */}
        <section className="y-hero">
          <div className="y-hero-noise" />

          {/* Left content block (Upside) */}
          <div className="y-hero-content">
            <motion.div className="y-eyebrow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" as const }}
            >
              <span className="y-eyebrow-dot" />
              Pilgrimage &bull; Braj Bhoomi
            </motion.div>

            <motion.h1 className="y-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.5, ease: "easeOut" as const }}
            >
              Book Your <span className="y-orange">Spiritual</span><br />
              <span className="y-navy">Braj Yatra</span> With Us!
            </motion.h1>

            <motion.p className="y-hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" as const }}
            >
              One has to take association of devotees, hear the lilas of Hari,
              worship the Deity, serve the Lord in the holy place, partake
              prasadam, give in charity and perform bhajans. The purpose
              of Tirth Yatra is to connect ourselves with God.
            </motion.p>
          </div>

          {/* DIVINE DESTINATIONS GRID (Replaces Slider) */}
          <motion.div 
            className="y-dest-grid"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.6, ease: "easeOut" }}
            style={{ width: '100%', zIndex: 5, position: 'relative' }}
          >
            {destinations.map((dest, i) => (
              <motion.div key={dest.name} className="y-dest" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}>
                <img loading="lazy" decoding="async" src={dest.image} alt={dest.name} />
                <div className="y-dest-overlay" />
                <div className="y-dest-arrow"><i className="fas fa-arrow-right"></i></div>
                <div className="y-dest-content">
                  <span className="y-dest-label">{dest.label}</span>
                  <div className="y-dest-name">{dest.name}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Search Packages widget (Bottom Right) */}
          <motion.div className="y-search-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" as const }}
          >
            <form onSubmit={handleSearch} className="y-search-form">
              <input
                type="text"
                placeholder="Search Yatra Packages"
                className="y-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="y-search-btn" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
            </form>
          </motion.div>
        </section>

        {/* ═══ STATS STRIP ═══ */}
        <div className="y-stats-wrapper">
          <div className="y-stats-strip">
            <div className="y-stat" ref={counter1.ref}>
              <div className="y-stat-num">{counter1.count}+</div>
              <div className="y-stat-label">Divine Destinations</div>
            </div>
            <div className="y-stat" ref={counter2.ref}>
              <div className="y-stat-num">{counter2.count.toLocaleString()}+</div>
              <div className="y-stat-label">Happy Pilgrims</div>
            </div>
            <div className="y-stat" ref={counter3.ref}>
              <div className="y-stat-num">{counter3.count}%</div>
              <div className="y-stat-label">Satisfaction Rate</div>
            </div>
            <div className="y-stat">
              <div className="y-stat-num">24/7</div>
              <div className="y-stat-label">Support Available</div>
            </div>
          </div>
        </div>

        {/* ═══ INTRO ═══ */}
        <section className="y-intro">
          <motion.div {...fadeUp}>
            <div className="y-sec-eyebrow">Our Mission</div>
            <h2 className="y-sec-title">A Divine Journey<br />Like No <span className="y-accent">Other</span></h2>
            <p className="y-body">Discover the spiritual beauty of Braj through thoughtfully curated yatra experiences designed for devotees, families, and spiritual travelers. From divine temples and pastime places to comfortable travel arrangements, we provide a peaceful and memorable pilgrimage.</p>
            <p className="y-body">Whether you seek temple darshan, Braj heritage exploration, or a personalized spiritual journey, our packages make every experience seamless and deeply fulfilling.</p>
            <ul className="y-feature-list">
              {["Expert Spiritual Guides", "Premium & Comfortable Transport", "Curated Darshan Timings", "Sattvic Meals Included", "Flexible Itinerary Options"].map(item => (
                <li key={item}><span className="y-feature-check"><i className="fas fa-check"></i></span>{item}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" as const }}>
            <div className="y-intro-imgs">
              <div className="y-intro-ring" />
              <img loading="lazy" decoding="async" src="/radha-raman-temple.webp" alt="Temple Darshan" className="y-intro-main" />
              <img loading="lazy" decoding="async" src="/keshi%20ghat.webp" alt="Braj Heritage" className="y-intro-accent" />
              <motion.div className="y-intro-badge" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true } as const} transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" as const }}>
                <strong>20+</strong><span>Years of<br />Experience</span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ═══ JOURNEY TIMELINE — VERTICAL ═══ */}
        <section className="y-journey">
          <div className="y-journey-inner">

            {/* Left: Golden Orb */}
            <motion.div
              className="y-journey-orb-wrap"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: "easeOut" }}
            >
              <div className="y-journey-orb">
                <div className="y-journey-orb-text">Braj Nidhi<br />Braj Yatra<br />Journey</div>
              </div>
            </motion.div>

            {/* Right: Header + Vertical Steps */}
            <div className="y-journey-right">
              <motion.div className="y-journey-header" {...fadeUp}>
                <div className="y-sec-eyebrow">How It Works</div>
                <h2 className="y-sec-title">Your Journey,<br /><span className="y-accent">Step by Step</span></h2>
              </motion.div>

              <div className="y-vlist">
                {[
                  { num: "01", icon: "fas fa-map-marked-alt", cls: "ic-1", title: "Choose Your Yatra", desc: "Browse our carefully crafted packages — from heritage tours to personalized pilgrimages — and select the one that calls to your soul." },
                  { num: "02", icon: "fas fa-headset", cls: "ic-2", title: "Plan With Us", desc: "Our spiritual experts work with you to craft the perfect itinerary, arrange transport, meals, and accommodations tailored to your needs." },
                  { num: "03", icon: "fas fa-bus", cls: "ic-3", title: "Travel In Comfort", desc: "Board premium AC vehicles with trusted drivers. Enjoy sattvic meals and handpicked lodging throughout your divine journey." },
                  { num: "04", icon: "fas fa-om", cls: "ic-4", title: "Experience Divinity", desc: "Walk the divine lands of Braj, receive darshan at timeless temples, and return home transformed and deeply fulfilled." },
                ].map((item, i) => (
                  <motion.div
                    key={item.num}
                    className="y-vitem"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
                  >
                    <div className="y-vitem-left">
                      <div className={`y-vitem-icon ${item.cls}`}>
                        <i className={item.icon}></i>
                      </div>
                      <div className="y-vitem-num">{item.num}</div>
                    </div>
                    <div className="y-vitem-body">
                      <div className="y-vitem-title">{item.title}</div>
                      <div className="y-vitem-desc">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ═══ PACKAGES ═══ */}
        <section className="y-packages" id="packages">
          <div className="y-pkg-header">
            <div>
              <div className="y-sec-eyebrow" style={{ color: '#d4af37' }}>Our Packages</div>
              <h2 className="y-sec-title">Braj Yatra<br /><span className="y-accent">Packages</span></h2>
            </div>
            <p className="y-pkg-subtitle">Each package is carefully curated by our spiritual experts, combining divine darshan with comfortable travel and authentic experiences.</p>
          </div>

          {/* Nav row: arrows + tabs + dots */}
          <div className="y-pkg-nav">
            <button className="y-pkg-arrow" onClick={prevPackage} aria-label="Previous Package">
              <ChevronLeft size={18} />
            </button>
            <div className="y-pkg-tabs">
              {packages.map((pkg, i) => (
                <button
                  key={pkg.id}
                  className={`y-pkg-tab${activePackage === i ? ' active' : ''}`}
                  onClick={() => { setActivePackage(i); setPkgPaused(true); setTimeout(() => setPkgPaused(false), 8000); }}
                >
                  {pkg.tag}
                </button>
              ))}
            </div>
            <div className="y-pkg-dots">
              {packages.map((_, i) => (
                <div
                  key={i}
                  className={`y-pkg-dot${activePackage === i ? ' active' : ''}`}
                  onClick={() => { setActivePackage(i); setPkgPaused(true); setTimeout(() => setPkgPaused(false), 8000); }}
                />
              ))}
            </div>
            <button className="y-pkg-arrow" onClick={nextPackage} aria-label="Next Package">
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            className="y-bento"
            onMouseEnter={() => setPkgPaused(true)}
            onMouseLeave={() => setPkgPaused(false)}
          >
            <div className="y-bento-img">
              {packages.map((pkg, i) => {
                const isActive = activePackage === i;
                const isPrev = (activePackage - 1 + packages.length) % packages.length === i;
                return (
                  <motion.img
                    key={pkg.image}
                    src={pkg.image}
                    alt={pkg.title}
                    initial={false}
                    animate={{ 
                      opacity: isActive ? 1 : (isPrev ? 1 : 0),
                      scale: isActive ? 1 : 1.05,
                      zIndex: isActive ? 2 : (isPrev ? 1 : 0)
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: isActive ? 'auto' : 'none' }}
                  />
                );
              })}
              <div className="y-bento-img-overlay" />
              
              {/* Left/Right Overlaid Arrow Buttons */}
              <button 
                className="y-bento-img-arrow left" 
                onClick={(e) => { e.stopPropagation(); prevPackage(); }} 
                aria-label="Previous Package"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="y-bento-img-arrow right" 
                onClick={(e) => { e.stopPropagation(); nextPackage(); }} 
                aria-label="Next Package"
              >
                <ChevronRight size={20} />
              </button>

              <div className="y-bento-img-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePackage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="y-badge">{packages[activePackage].badge}</div>
                    <h3 className="y-pkg-title">{packages[activePackage].title}</h3>
                    <p className="y-pkg-sub">{packages[activePackage].subtitle}</p>
                    <span className="y-duration"><i className="far fa-clock"></i>{packages[activePackage].duration}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="y-bento-info">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePackage}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}
                >
                  <div className="y-info-card">
                    <div className="y-price-lbl">{packages[activePackage].priceLabel}</div>
                    <div className="y-price">{packages[activePackage].price}</div>
                    <div className="y-price-note">per person, taxes applicable</div>
                    <p className="y-pkg-desc">{packages[activePackage].desc}</p>
                    <a href="/contact" className="y-btn-book"><i className="fas fa-paper-plane"></i>Book This Package</a>
                  </div>
                  <div className="y-highlights">
                    <div className="y-highlights-lbl">What&apos;s Included</div>
                    <div className="y-pills">
                      {packages[activePackage].highlights.map(h => (
                        <span className="y-pill" key={h}><i className="fas fa-check-circle"></i>{h}</span>
                      ))}
                    </div>
                    <div className="y-ideal">
                      <span className="y-ideal-lbl">Ideal For:</span>
                      {packages[activePackage].ideal.map(t => <span className="y-ideal-tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>



        {/* ═══ TESTIMONIALS ═══ */}
        <section className="testimonials-section">
          <div className="section-header center-header">
            <div className="rating-badge">
              <i className="fas fa-star"></i> Rated 4.8/5 by over 10,000 pilgrims
            </div>
            <h2>What Our Travelers Say</h2>
          </div>
          
          <div className="testimonials-slider swiper">
            <div className="swiper-wrapper">
              {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <div className="swiper-slide testimonial-card" key={i}>
                  <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                  <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                  <div className="testimonial-user">
                    <img loading="lazy" decoding="async" src={t.avatar} alt={t.name} />
                    <div>
                      <h4>{t.name}</h4>
                      <span>{t.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY CHOOSE US — BENTO EDITION ═══ */}
        <section className="y-why">
          <motion.div {...fadeUp} className="y-why-header-wrap">
            <div className="y-why-pill">Why Choose Us</div>
            <h2 className="y-why-section-title">
              Why <span>Braj Nidhi</span> is The Right Choice for Your Yatra
            </h2>
          </motion.div>

          <div className="y-why-bento">
            {/* Card 1 — top left */}
            <motion.div className="y-why-lcard" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true } as const} transition={{ duration: 0.6, delay: 0, ease: "easeOut" as const }}>
              <div className="y-why-lcard-icon"><i className="fas fa-om"></i></div>
              <h3 className="y-why-lcard-title">Expert Spiritual Guides</h3>
              <p className="y-why-lcard-desc">Our knowledgeable guides bring the divine leelas of Braj to life — narrating the sacred significance of every temple, kund, and pastime place so your yatra becomes a truly transformative experience.</p>
            </motion.div>

            {/* Card 2 — top middle */}
            <motion.div className="y-why-lcard" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true } as const} transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}>
              <div className="y-why-lcard-icon"><i className="fas fa-bus"></i></div>
              <h3 className="y-why-lcard-title">Premium AC Transport</h3>
              <p className="y-why-lcard-desc">Travel in comfort with our fleet of premium, well-maintained AC vehicles and professional drivers — ensuring a safe, smooth, and dignified journey across the sacred lands of Braj.</p>
            </motion.div>

            {/* Dark featured card — right, spanning 2 rows */}
            <motion.div className="y-why-dcard" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true } as const} transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" as const }}>
              <div>
                <div className="y-why-dcard-icon"><i className="fas fa-hands-praying"></i></div>
                <h3 className="y-why-dcard-title">Personalized Braj Yatra Packages</h3>
              </div>
              <div className="y-why-dcard-body">
                <p className="y-why-dcard-desc">At Braj Nidhi, we understand that every devotee&apos;s spiritual journey is unique. That&apos;s why our yatras are thoughtfully crafted — from temple darshan timings to sattvic meals and comfortable stays.</p>
                <p className="y-why-dcard-desc">Whether you are a first-time pilgrim or a seasoned devotee, we tailor every detail of your Braj Yatra to align with your devotion, pace, and purpose.</p>
                <a href="/contact" className="y-why-dcard-btn">Plan My Yatra <i className="fas fa-arrow-right"></i></a>
              </div>
            </motion.div>

            {/* Card 3 — bottom, spanning 2 cols */}
            <motion.div className="y-why-lcard span2" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true } as const} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}>
              <div className="y-why-lcard-icon"><i className="fas fa-map-marked-alt"></i></div>
              <h3 className="y-why-lcard-title">12+ Divine Destinations Covered</h3>
              <p className="y-why-lcard-desc">Braj Nidhi covers the complete Braj Mandal — from Vrindavan&apos;s sacred groves and Mathura&apos;s ghats to Nandgaon, Barsana, Govardhan, and beyond. We handle all logistics so you can focus entirely on your bhakti and connection with the divine.</p>
            </motion.div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="y-cta">
          <motion.div className="y-cta-box" {...fadeUp}>
            <div>
              <div className="y-cta-tag"><i className="fas fa-pray"></i> Begin Your Divine Journey</div>
              <h2 className="y-cta-title">Book Your Braj<br />Yatra Today</h2>
              <p className="y-cta-desc">Our spiritual guides and hospitality team are ready to craft the perfect pilgrimage for you and your family. Reach out and let us plan a journey you will treasure forever.</p>
            </div>
            <div className="y-cta-btns">
              <a href="/contact" className="y-btn-cta"><i className="fas fa-paper-plane"></i>Plan My Yatra</a>
              <a href="tel:+917037794300" className="y-btn-cta-outline"><i className="fas fa-phone-alt"></i>Call Us Now</a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="site-footer">
        <div className="footer-top-links">
          <div className="footer-col"><h3>Our Services</h3><a href="/guesthouse">Guesthouse</a><a href="/weddings">Weddings</a><a href="/corporate">Corporate</a><a href="/braj-yatra">Braj Yatra</a></div>
          <div className="footer-col"><h3>Explore Vrindavan</h3><a href="/braj-yatra#packages">Sapt Devalaya Yatra</a><a href="/braj-yatra#packages">Chaurasi Kos Yatra</a><a href="/braj-yatra">Govardhan Parikrama</a><a href="/braj-yatra">Barsana & Nandgaon</a><a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer">Chandrodaya Mandir</a><a href="https://www.vhtofficial.com/" target="_blank" rel="noopener noreferrer">Heritage Tower</a></div>
          <div className="footer-col"><h3>Stay & Book</h3><a href="/booking">Book Your Stay</a><a href="/weddings">Wedding Packages</a><a href="/corporate">Corporate Stays</a><a href="#">Refund Policy</a></div>
          <div className="footer-col"><h3>Help & Support</h3><a href="#">FAQ</a><a href="/contact">Contact Us</a><a href="#">Direction Map</a><a href="#">Group Inquiries</a></div>
          <div className="footer-col"><h3>Information</h3><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/guest-policy">Guest Policy</Link><Link href="/cancellation-policy">Cancellation Policy</Link></div>
                        <div className="footer-col">
                <h3>Follow Us</h3>
                <a href="https://wa.me/917037794300" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://www.instagram.com/braj.nidhi_/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
        </div>

        <div className="footer-middle-bar"><Link href="/privacy">Privacy Policy</Link><span>Copyright &copy; BRAJNIDHI {new Date().getFullYear()}</span><Link href="/terms">Terms Of Use</Link></div>
        <div className="footer-massive-text">BRAJNIDHI</div>
      </footer>

      <FloatingWidgets />
    </div>
  );
}
