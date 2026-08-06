"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import FloatingWidgets from '@/components/FloatingWidgets';
import BookNowButton from '@/components/BookNowButton';
import Link from 'next/link';
import Image from 'next/image';

export default function Corporate() {
  const [heroImgIndex, setHeroImgIndex] = useState(0);
  const heroImages = ["/DSC09672.webp"];

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    eventType: 'conference',
    attendees: '',
    expectedDate: '',
    additionalRequirements: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'corporate',
          ...formData
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
      
      setStatus('success');
      setFormData({
        companyName: '', contactPerson: '', email: '', phone: '',
        eventType: 'conference', attendees: '', expectedDate: '', additionalRequirements: ''
      });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    let testimonialsSwiper: any;
    let resumeAutoplayFn: any;

    // Swiper initialization for subpages
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

    return () => {
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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" as const }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -70 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 1, ease: "easeOut" as const }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 70 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 1, ease: "easeOut" as const }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    },
    viewport: { once: true }
  };

  return (
    <div className="corporate-page">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Events specific styles */
        body {
            background-color: #fafafa;
            color: #1a1a1a;
        }

        /* Header overrides to show black text on light background */
        .index-page .corporate-page header:not(.scrolled) nav ul li a,
        .index-page .corporate-page header:not(.scrolled) .mobile-menu-btn {
            color: #1a1a1a !important;
        }
        .index-page .corporate-page header:not(.scrolled) nav ul li a:hover {
            color: #C89B3C !important;
        }

        .events-hero {
            background-color: #ffffff;
            padding: 120px 0 60px 0;
            display: flex;
            justify-content: center;
        }

        .hero-bento-container {
            width: 100%;
            max-width: 1200px;
            padding: 0 20px;
            display: flex;
            flex-direction: column;
        }

        .hero-title-large {
            font-size: 2.2rem;
            font-weight: 900;
            color: #1a1a1a;
            background-color: #ffffff;
            display: inline-block;
            align-self: center;
            padding: 12px 30px;
            text-transform: uppercase;
            text-align: center;
            line-height: 1;
            margin-bottom: -25px;
            position: relative;
            z-index: 2;
            font-family: 'Arial Black', Impact, sans-serif;
            letter-spacing: 2px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            border: 2px solid #1a1a1a;
        }

        .hero-single-card {
            position: relative;
            height: 500px;
            overflow: hidden;
            border-radius: 4px;
            margin-top: 20px;
            background-color: #1a1a1a;
        }

        .hero-single-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .hero-single-content {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 60px 40px;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            color: #fff;
        }

        .hero-single-content h3 {
            font-family: 'Arial Black', sans-serif;
            font-size: 3rem;
            text-transform: uppercase;
            margin-bottom: 10px;
            line-height: 1.1;
        }

        .hero-single-content p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 600px;
        }

        /* Module Sections */
        .module-section {
            padding: 80px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .module-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .module-header h2 {
            font-family: 'Arial Black', sans-serif;
            font-size: 3rem;
            color: #1a1a1a;
            text-transform: uppercase;
            line-height: 1.1;
            margin-bottom: 20px;
        }

        .module-header p {
            font-size: 1.1rem;
            color: #555;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Bento Grids */
        .events-bento {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1px;
            background: #e5e5e5;
            border: 1px solid #e5e5e5;
        }

        .bento-item {
            background: #fff;
            padding: 40px;
            transition: all 0.4s ease;
        }

        .bento-item:hover {
            background: #1a1a1a;
            color: #fff;
        }

        .bento-item i {
            font-size: 2rem;
            color: #e95d35;
            margin-bottom: 20px;
            transition: color 0.4s ease;
        }

        .bento-item:hover i {
            color: #fbc434;
        }

        .bento-item h4 {
            font-size: 1.4rem;
            font-weight: 800;
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        .bento-item p {
            color: #666;
            line-height: 1.6;
            font-size: 0.95rem;
            transition: color 0.4s ease;
        }

        .bento-item:hover p {
            color: #ccc;
        }

        /* Package Cards */
        .packages-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-top: 50px;
        }

        .package-card {
            border: 2px solid #1a1a1a;
            padding: 40px;
            background: #fff;
            position: relative;
        }

        .package-badge {
            position: absolute;
            top: -15px;
            right: 30px;
            background: #1a1a1a;
            color: #fff;
            padding: 8px 20px;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 1px;
        }

        .package-card h3 {
            font-size: 2rem;
            font-family: 'Arial Black', sans-serif;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        .package-features {
            list-style: none;
            margin-bottom: 30px;
        }

        .package-features li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            color: #444;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .package-features li i {
            color: #e95d35;
        }

        /* Split Section */
        .split-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            align-items: center;
            margin: 80px auto;
            max-width: 1200px;
            padding: 0 20px;
        }

        .split-content h3 {
            font-family: 'Arial Black', sans-serif;
            font-size: 2.5rem;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        .split-content p {
            font-size: 1.1rem;
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .split-image {
            height: 500px;
            border-radius: 4px;
            overflow: hidden;
        }

        .split-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .veg-badge-container {
            width: 100%;
            height: 100%;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px dashed #2e7d32;
            border-radius: 8px;
            color: #2e7d32;
            padding: 40px;
            text-align: center;
        }

        .veg-badge-container i {
            font-size: 5rem;
            margin-bottom: 20px;
        }

        .veg-badge-container h4 {
            font-family: 'Arial Black', sans-serif;
            font-size: 2rem;
            text-transform: uppercase;
            margin: 0;
        }

        .veg-badge-container p {
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 10px;
        }

        .reverse {
            direction: rtl;
        }
        
        .reverse .split-content {
            direction: ltr;
        }

        /* Testimonials */
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-top: 40px;
        }

        .testimonial-card {
            background: #fff;
            padding: 40px;
            border: 1px solid #eee;
            position: relative;
        }

        .testimonial-card i.fa-quote-left {
            font-size: 2rem;
            color: #fbc434;
            margin-bottom: 20px;
        }

        .testimonial-card p {
            font-style: italic;
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .author-img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }

        .author-info h5 {
            font-family: 'Arial Black', sans-serif;
            text-transform: uppercase;
        }

        .author-info span {
            font-size: 0.85rem;
            color: #888;
        }

        /* ==============================
           REDESIGNED INQUIRY FORM SECTION
           ============================== */
        .inquiry-form-section {
            background: #ffffff;
            padding: 100px 20px;
            margin-top: 0;
        }

        .inquiry-layout {
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 80px;
            align-items: start;
        }

        /* LEFT PANEL */
        .inquiry-info-panel {
            position: sticky;
            top: 120px;
        }

        .inquiry-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #e8f1ff;
            color: #1a56db;
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding: 8px 16px;
            border-radius: 50px;
            margin-bottom: 24px;
        }

        .inquiry-info-panel h2 {
            font-family: 'Arial Black', sans-serif;
            font-size: 2.8rem;
            text-transform: uppercase;
            color: #111;
            line-height: 1.1;
            margin-bottom: 20px;
        }

        .inquiry-info-panel > p {
            font-size: 1.05rem;
            color: #666;
            line-height: 1.7;
            margin-bottom: 40px;
        }

        .inquiry-trust-items {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 40px;
        }

        .trust-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }

        .trust-icon {
            width: 44px;
            height: 44px;
            background: #e8f1ff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .trust-icon i {
            color: #1a56db;
            font-size: 1.1rem;
        }

        .trust-item h5 {
            font-weight: 800;
            color: #111;
            font-size: 0.95rem;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .trust-item p {
            font-size: 0.85rem;
            color: #888;
            line-height: 1.5;
            margin: 0;
        }

        .inquiry-download-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: 2px solid #1a1a1a;
            padding: 14px 24px;
            color: #1a1a1a;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
        }

        .inquiry-download-link:hover {
            background: #1a1a1a;
            color: #fff;
        }

        /* RIGHT PANEL - FORM CARD */
        .inquiry-form-card {
            background: #f9f9f7;
            border: 1px solid #ebebeb;
            border-radius: 4px;
            padding: 50px 45px;
        }

        .form-card-title {
            font-size: 1.2rem;
            font-weight: 800;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e5e5;
        }

        .inquiry-form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .form-group.full-width {
            grid-column: span 2;
        }

        .inquiry-form label {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #555;
        }

        .inquiry-form input,
        .inquiry-form select,
        .inquiry-form textarea {
            padding: 13px 16px;
            background: #ffffff;
            border: 1.5px solid #e0e0e0;
            border-radius: 3px;
            color: #1a1a1a;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.25s, box-shadow 0.25s;
            font-family: inherit;
        }

        .inquiry-form input::placeholder,
        .inquiry-form textarea::placeholder {
            color: #bbb;
        }

        .inquiry-form select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;
            cursor: pointer;
        }

        .inquiry-form input:focus,
        .inquiry-form select:focus,
        .inquiry-form textarea:focus {
            border-color: #1a56db;
            box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.08);
        }

        .inquiry-form textarea {
            resize: vertical;
            min-height: 110px;
        }

        .inquiry-form button {
            grid-column: span 2;
            padding: 18px 30px;
            background: #1a1a1a;
            color: #ffffff;
            border: none;
            border-radius: 3px;
            font-family: 'Arial Black', sans-serif;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .inquiry-form button:hover {
            background: #1a56db;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(26, 86, 219, 0.3);
        }

        .form-footer-note {
            text-align: center;
            font-size: 0.8rem;
            color: #aaa;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        @media (max-width: 900px) {
            .inquiry-layout {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .inquiry-info-panel {
                position: static;
            }
            .inquiry-form-card {
                padding: 35px 25px;
            }
            .events-bento,
            .packages-grid,
            .inquiry-form,
            .split-section,
            .testimonials-grid {
                grid-template-columns: 1fr;
            }
            .form-group.full-width {
                grid-column: span 1;
            }
            .inquiry-form button {
                grid-column: span 1;
            }
        }

        .conf-section { padding: 80px 20px; background: #fafaf8; border-top: 1px solid #ececec; }
        .conf-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr; gap: 60px; align-items: center; }
        .conf-badge { width: 260px; height: 260px; border-radius: 50%; background: linear-gradient(135deg,#6b4f2a,#9e7f52,#6b4f2a); display: flex; align-items: center; justify-content: center; text-align: center; padding: 36px; box-shadow: 0 16px 50px rgba(107,79,42,.35), 0 0 0 10px rgba(158,127,82,.12); margin: 0 auto; position: relative; }
        .conf-badge::before { content: ''; position: absolute; inset: 10px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.3); }
        .conf-badge h3 { font-family: Georgia,serif; font-size: 1.4rem; font-weight: 700; color: #fff; line-height: 1.35; position: relative; z-index: 1; }
        .conf-list { display: flex; flex-direction: column; position: relative; }
        .conf-list::before { content: ''; position: absolute; left: 27px; top: 36px; bottom: 36px; width: 2px; background: linear-gradient(to bottom,#c8a96e,#9e7f52,#c8a96e); }
        .conf-item { display: grid; grid-template-columns: 56px 1fr; gap: 20px; align-items: center; padding: 16px 0; }
        .conf-num-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 1; }
        .conf-circle { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #fff; transition: transform .3s; }
        .conf-item:hover .conf-circle { transform: scale(1.1); }
        .conf-circle.navy  { background:#1a2f5e; box-shadow:0 6px 20px rgba(26,47,94,.4); }
        .conf-circle.slate { background:#4a5e7a; box-shadow:0 6px 20px rgba(74,94,122,.4); }
        .conf-circle.steel { background:#6b7a8d; box-shadow:0 6px 20px rgba(107,122,141,.4); }
        .conf-circle.warm  { background:#c47a3a; box-shadow:0 6px 20px rgba(196,122,58,.4); }
        .conf-circle.stone { background:#8c8272; box-shadow:0 6px 20px rgba(140,130,114,.4); }
        .conf-num { font-size:.65rem; font-weight:800; color:#9e7f52; letter-spacing:1px; }
        .conf-text h4 { font-family:'Arial Black',sans-serif; font-size:.88rem; text-transform:uppercase; letter-spacing:1.5px; color:#1a1a1a; margin-bottom:4px; }
        .conf-text p { font-size:.875rem; color:#666; line-height:1.55; margin:0; }
        @media(max-width:900px){ .conf-inner { grid-template-columns:1fr; } .conf-badge { width:200px; height:200px; } }

        /* Testimonial Auto-Scroll */
        .testi-track-wrap { overflow: hidden; position: relative; padding: 20px 0; }
        .testi-track { display: flex; gap: 24px; animation: scrollTestimonials 30s linear infinite; width: max-content; }
        @media (hover: hover) {
            .testi-track:hover { animation-play-state: paused; }
        }
        @keyframes scrollTestimonials {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .testi-card { flex-shrink: 0; width: 380px; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 32px; position: relative; }
        .testi-quote { font-size: 1.5rem; color: #fbc434; margin-bottom: 16px; }
        .testi-stars { color: #fbc434; font-size: 0.9rem; margin-bottom: 12px; letter-spacing: 2px; }
        .testi-text { font-size: 0.95rem; color: #555; line-height: 1.6; font-style: italic; margin-bottom: 20px; }
        .testi-user { display: flex; align-items: center; gap: 12px; }
        .testi-user img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
        .testi-user h4 { font-family: 'Arial Black', sans-serif; font-size: 0.9rem; text-transform: uppercase; margin: 0; color: #1a1a1a; }
        .testi-user span { font-size: 0.8rem; color: #888; }

        @media (max-width: 768px) {
            .testi-track { gap: 16px; }
            .testi-card { width: 290px; padding: 20px; border-radius: 12px; }
            .testi-quote { font-size: 1.25rem; margin-bottom: 10px; }
            .testi-stars { font-size: 0.8rem; margin-bottom: 8px; }
            .testi-text { font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px; }
            .testi-user img { width: 40px; height: 40px; }
            .testi-user h4 { font-size: 0.8rem; }
            .testi-user span { font-size: 0.75rem; }
        }
    ` }} />
      
    {/* SVG Definitions */}
    <svg style={{"display":"none"}}>
        <defs>
            <g id="peacock-feather">
                <path d="M50,80 C10,80 0,20 50,0 C100,20 90,80 50,80 Z" fill="#008000" opacity="0.9"/>
                <path d="M50,70 C20,70 15,25 50,10 C85,25 80,70 50,70 Z" fill="#32CD32"/>
                <ellipse cx="50" cy="30" rx="14" ry="20" fill="#00CED1"/>
                <ellipse cx="50" cy="30" rx="8" ry="12" fill="#000080"/>
                <path d="M50,0 L50,95" stroke="#006400" strokeWidth="2"/>
            </g>
            <g id="krishna-flute-feather">
                <path d="M10,75 L90,45" stroke="#DAA520" strokeWidth="12" strokeLinecap="round"/>
                <path d="M12,73 L88,44" stroke="#F0E68C" strokeWidth="6" strokeLinecap="round"/>
                <line x1="20" y1="76" x2="25" y2="63" stroke="#DC143C" strokeWidth="3"/>
                <line x1="23" y1="75" x2="28" y2="62" stroke="#DC143C" strokeWidth="3"/>
                <circle cx="40" cy="62" r="2.5" fill="#3e2723"/>
                <circle cx="50" cy="59" r="2.5" fill="#3e2723"/>
                <circle cx="60" cy="56" r="2.5" fill="#3e2723"/>
                <circle cx="70" cy="53" r="2.5" fill="#3e2723"/>
                <g transform="translate(55, 10) rotate(15) scale(0.4)">
                    <use href="#peacock-feather" />
                </g>
            </g>
        </defs>
    </svg>

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

        {/* Hamburger Toggle Button */}
        <div className="mobile-header-actions">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    </header>

    {/* Mobile Menu Drawer Overlay */}
    {isMobileMenuOpen && (
      <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
        <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" style={{ height: "45px", width: "auto", cursor: "pointer" }} />
            </Link>
            <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
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
        {/* Hero Section */}
        <section className="events-hero">
            <div className="hero-bento-container">
                <div className="hero-title-large">CORPORATE RETREATS & CONFERENCES</div>
                
                <div className="hero-single-card">
                    {heroImages.map((img, i) => {
                        const isActive = heroImgIndex === i;
                        const isPrev = (heroImgIndex - 1 + heroImages.length) % heroImages.length === i;
                        return (
                            <motion.img 
                                key={img}
                                src={img}
                                alt="Corporate Retreats"
                                initial={false}
                                animate={{ 
                                    opacity: isActive ? 1 : (isPrev ? 1 : 0),
                                    scale: isActive ? 1 : 1.1,
                                    zIndex: isActive ? 2 : (isPrev ? 1 : 0)
                                }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: isActive ? 'auto' : 'none' }}
                            />
                        );
                    })}
                    <motion.div 
                        className="hero-single-content"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <h3>Elevate Your Corporate Experience</h3>
                        <p>Premium AV halls, Bose professional sound systems, acoustic interiors, luxury stays, and soulful Braj experiences all designed for impactful meetings, retreats, and executive events in Vrindavan.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Corporate Offsite Module */}
        <section id="corporate" className="module-section">
            <motion.div className="module-header" {...fadeInUp}>
                <h2>INFRASTRUCTURE & CAPABILITIES</h2>
                <p>Experience world-class conference infrastructure designed for impactful corporate events, executive meetings, seminars, and premium retreats in Vrindavan.</p>
            </motion.div>

            <motion.div className="events-bento" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="bento-item" variants={slideInLeft}>
                    <i className="fas fa-project-diagram"></i>
                    <h4>PREMIUM AV HALL</h4>
                    <p>State-of-the-art conference hall equipped with Bose professional sound systems, advanced AV setup, presentation facilities, and acoustic soundproof interiors.</p>
                </motion.div>
                <motion.div className="bento-item" variants={fadeInUp}>
                    <i className="fas fa-users"></i>
                    <h4>EXECUTIVE MEETING SPACES</h4>
                    <p>Elegant spaces designed for leadership meetings, private discussions, workshops, and collaborative corporate sessions.</p>
                </motion.div>
                <motion.div className="bento-item" variants={slideInRight}>
                    <i className="fas fa-mug-hot"></i>
                    <h4>NETWORKING & RETREAT LOUNGES</h4>
                    <p>Premium breakout areas with peaceful surroundings, ideal for networking, brainstorming, and meaningful corporate interactions.</p>
                </motion.div>
            </motion.div>

            <motion.div className="packages-grid" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="package-card" variants={slideInLeft}>
                    <h3>Day Conference Package</h3>
                    <ul className="package-features">
                        <li><i className="fas fa-check"></i> Executive AV Hall Access (8 Hours)</li>
                        <li><i className="fas fa-check"></i> 4K Projector & PA System</li>
                        <li><i className="fas fa-check"></i> 2 Tea/Coffee Breaks with Snacks</li>
                        <li><i className="fas fa-check"></i> Executive Buffet Lunch</li>
                        <li><i className="fas fa-check"></i> Dedicated IT Support Staff</li>
                    </ul>
                    <a href="#inquiry" className="btn-outline" style={{"border":"2px solid #1a1a1a","padding":"15px 30px","textDecoration":"none","color":"#1a1a1a","fontWeight":"800","textTransform":"uppercase","display":"inline-block"}}>Request Quote</a>
                </motion.div>
                
                <motion.div className="package-card" variants={slideInRight}>
                    <div className="package-badge">Premium</div>
                    <h3>Leadership Retreat</h3>
                    <ul className="package-features">
                        <li><i className="fas fa-check"></i> 2 Days Boardroom & AV Hall Access</li>
                        <li><i className="fas fa-check"></i> 10 Executive Suites Included</li>
                        <li><i className="fas fa-check"></i> All Meals + Gala Dinner Setup</li>
                        <li><i className="fas fa-check"></i> Guided Temple Tour Experience</li>
                        <li><i className="fas fa-check"></i> Team Building Activities Space</li>
                    </ul>
                    <a href="#inquiry" className="btn-outline" style={{"border":"2px solid #1a1a1a","padding":"15px 30px","textDecoration":"none","color":"#1a1a1a","fontWeight":"800","textTransform":"uppercase","display":"inline-block"}}>Request Quote</a>
                </motion.div>
            </motion.div>
        </section>

        {/* Conference Hall Features */}
        <section className="conf-section">
            <motion.div style={{textAlign:'center',marginBottom:'50px'}} {...fadeInUp}>
                <div style={{display:'inline-block',background:'#f0e8d8',color:'#7c5a2a',fontSize:'0.75rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'2px',padding:'7px 18px',borderRadius:'50px',marginBottom:'14px'}}>AV &amp; Tech Infrastructure</div>
                <h2 style={{fontFamily:'Arial Black,sans-serif',fontSize:'2rem',textTransform:'uppercase',color:'#1a1a1a',margin:'0 auto',lineHeight:1.2}}>Conference Hall Features</h2>
            </motion.div>
            <div className="conf-inner">
                <motion.div 
                    className="conf-badge"
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, type: "spring" }}
                >
                    <h3>Braj Nidhi Conference Hall Features</h3>
                </motion.div>
                <motion.div className="conf-list" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                    <motion.div className="conf-item" variants={slideInRight}>
                        <div className="conf-num-wrap"><div className="conf-circle navy"><i className="fas fa-tv"></i></div><span className="conf-num">01</span></div>
                        <div className="conf-text"><h4>4K Resolution LED Wall</h4><p>16 ft × 9 ft — Brand Delta Pitch 1.5P COB technology along with 2 Samsung TVs (98 inches)</p></div>
                    </motion.div>
                    <motion.div className="conf-item" variants={slideInRight}>
                        <div className="conf-num-wrap"><div className="conf-circle slate"><i className="fas fa-volume-up"></i></div><span className="conf-num">02</span></div>
                        <div className="conf-text"><h4>High End BOSE Speakers</h4><p>Bose MA12 EX column array for crystal clear sound experience</p></div>
                    </motion.div>
                    <motion.div className="conf-item" variants={slideInRight}>
                        <div className="conf-num-wrap"><div className="conf-circle steel"><i className="fas fa-microphone"></i></div><span className="conf-num">03</span></div>
                        <div className="conf-text"><h4>Microphones</h4><p>Sennheiser wireless super cardioid microphone — 16 gooseneck and 4 handheld</p></div>
                    </motion.div>
                    <motion.div className="conf-item" variants={slideInRight}>
                        <div className="conf-num-wrap"><div className="conf-circle warm"><i className="fas fa-video"></i></div><span className="conf-num">04</span></div>
                        <div className="conf-text"><h4>Video Conferencing</h4><p>Kramer technologies with Sony SRG 40 cameras with AI auto focus</p></div>
                    </motion.div>
                    <motion.div className="conf-item" variants={slideInRight}>
                        <div className="conf-num-wrap"><div className="conf-circle stone"><i className="fas fa-wifi"></i></div><span className="conf-num">05</span></div>
                        <div className="conf-text"><h4>Wireless Presentation</h4><p>Kramer — all participants can present wirelessly without any external device on all three displays</p></div>
                    </motion.div>
                </motion.div>
            </div>
        </section>

        {/* Why Choose Vrindavan Split Section */}
        <motion.section className="split-section" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="split-content" variants={slideInLeft}>
                <h3>THE POWER OF PEACEFUL LEADERSHIP</h3>
                <p>Step away from the noise of the city and experience corporate gatherings in the serene atmosphere of Vrindavan. Braj Nidhi blends premium conference infrastructure with the calm spiritual energy of Braj — creating an environment designed for clarity, creativity, and meaningful conversations.</p>
                <p>From executive retreats and leadership meets to focused business discussions, every experience is crafted to feel productive, elevated, and refreshing.</p>
                <ul className="package-features" style={{"marginTop":"20px"}}>
                    <li><i className="fas fa-check"></i> Peaceful & Distraction-Free Environment</li>
                    <li><i className="fas fa-check"></i> Premium AV & Bose Sound Setup</li>
                    <li><i className="fas fa-check"></i> Inspiring Spiritual Atmosphere</li>
                    <li><i className="fas fa-check"></i> Ideal for Leadership Retreats & Conferences</li>
                </ul>
            </motion.div>
            <motion.div 
                className="split-image"
                variants={slideInRight}
            >
                <img loading="lazy" decoding="async" src="/IMG_3683.webp" alt="Corporate Strategy Meeting" />
            </motion.div>
        </motion.section>

        {/* Sattvic Dining Split Section (Reverse) */}
        <motion.section className="split-section reverse" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="split-content" variants={slideInRight}>
                <h3>SATTVIC DINING EXPERIENCES</h3>
                <p>Elevate your corporate gatherings with thoughtfully curated sattvic dining experiences designed to energize, refresh, and inspire. From executive lunches and high-tea sessions to premium dinner setups, every meal at Braj Nidhi is prepared with purity, authenticity, and hospitality.</p>
                <p>Blending soulful flavors with elegant presentation, we create dining experiences that perfectly complement conferences, retreats, and leadership gatherings.</p>
                <ul className="package-features" style={{"marginTop":"20px"}}>
                    <li><i className="fas fa-check"></i> Vedic Tea & Coffee Experiences</li>
                    <li><i className="fas fa-check"></i> Curated Sattvic Buffet Setups</li>
                    <li><i className="fas fa-check"></i> Executive Dining & Retreat Catering</li>
                    <li><i className="fas fa-check"></i> Elegant Dinner & Gathering Experiences</li>
                </ul>
            </motion.div>
            <motion.div className="split-image" variants={slideInLeft}>
                <img loading="lazy" decoding="async" src="/the-design-thoughtfully.webp" alt="Sattvic Dining" />
            </motion.div>
        </motion.section>

        {/* Experience the Essence of Braj */}
        <section className="module-section" style={{"paddingTop":"20px"}}>
            <motion.div className="module-header" {...fadeInUp}>
                <h2>EXPERIENCE THE ESSENCE OF BRAJ</h2>
                <p>At Braj Nidhi, corporate gatherings go beyond meetings and presentations. We create meaningful experiences through the spiritual energy, culture, and timeless heritage of Vrindavan.</p>
            </motion.div>
            <motion.div className="events-bento" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="bento-item" variants={slideInLeft}>
                    <i className="fas fa-walking"></i>
                    <h4>CURATED BRAJ YATRA EXPERIENCES</h4>
                    <p>Explore sacred temples, spiritual landmarks, and the divine heritage of Braj through thoughtfully guided experiences.</p>
                </motion.div>
                <motion.div className="bento-item" variants={fadeInUp}>
                    <i className="fas fa-spa"></i>
                    <h4>SOULFUL KIRTANS & WELLNESS</h4>
                    <p>Reconnect through peaceful kirtans, meditation sessions, and calming wellness experiences designed to refresh the mind and spirit.</p>
                </motion.div>
                <motion.div className="bento-item" variants={slideInRight}>
                    <i className="fas fa-hands-helping"></i>
                    <h4>GAUSHALA & SEVA EXPERIENCES</h4>
                    <p>Experience the simplicity and warmth of Braj through peaceful gaushala visits, seva activities, and meaningful cultural interactions unique to Braj Nidhi.</p>
                </motion.div>
            </motion.div>
        </section>

        {/* Amenities Auto-Scrolling Marquee */}
        <div className="amenities-banner">
            <div className="scroller-container">
                <div className="scroller-content">
                    <div className="scroller-item"><i className="fas fa-parking"></i> Parking Space</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-tv"></i> HD Television</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-concierge-bell"></i> 24-hour Room Service</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-tshirt"></i> Laundry Service</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-mug-hot"></i> Tea/Coffee Maker</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-leaf"></i> Pure Vegetarian Restaurant</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-place-of-worship"></i> 3 km from ISKCON Temple</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-om"></i> 3 km from Prem Mandir</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-bath"></i> Bathtub in Suite Category</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-wifi"></i> Free High-Speed Wi-Fi</div>
                    <div className="scroller-dot">✦</div>
                </div>
                {/* Duplicate for seamless loop */}
                <div className="scroller-content" aria-hidden="true">
                    <div className="scroller-item"><i className="fas fa-parking"></i> Parking Space</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-tv"></i> HD Television</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-concierge-bell"></i> 24-hour Room Service</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-tshirt"></i> Laundry Service</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-mug-hot"></i> Tea/Coffee Maker</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-leaf"></i> Pure Vegetarian Restaurant</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-place-of-worship"></i> 3 km from ISKCON Temple</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-om"></i> 3 km from Prem Mandir</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-bath"></i> Bathtub in Suite Category</div>
                    <div className="scroller-dot">✦</div>
                    <div className="scroller-item"><i className="fas fa-wifi"></i> Free High-Speed Wi-Fi</div>
                    <div className="scroller-dot">✦</div>
                </div>
            </div>
        </div>

        {/* Testimonials — auto-scroll marquee */}
        <section style={{background:'#fdfcf8', padding:'100px 0', overflow:'hidden', position:'relative'}}>
            <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 20px', textAlign:'center', marginBottom:'50px'}}>
                <div className="rating-badge"><i className="fas fa-star"></i> Rated 4.8/5 by corporate clients</div>
                <h2 style={{fontFamily:'Arial Black,sans-serif', fontSize:'2.5rem', textTransform:'uppercase', color:'#1a1a1a', margin:'16px 0 12px'}}>Trusted by Leaders</h2>
                <p style={{color:'#666', fontSize:'1.05rem'}}>See what companies are saying about their offsite experiences at Braj Nidhi.</p>
            </div>

<div style={{position:'relative', padding:'0 40px'}}>
                <div style={{position:'absolute', top:0, bottom:0, left:0, width:'100px', background:'linear-gradient(to right, #fdfcf8 0%, transparent 100%)', zIndex:2, pointerEvents:'none', filter:'blur(3px)'}}></div>
                <div style={{position:'absolute', top:0, bottom:0, right:0, width:'100px', background:'linear-gradient(to left, #fdfcf8 0%, transparent 100%)', zIndex:2, pointerEvents:'none', filter:'blur(3px)'}}></div>
<div className="testi-track-wrap" style={{overflow:'hidden'}}>
                    <div className="testi-track">
                        {/* Card 1 - Raj Malhotra */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Hosting our annual leadership retreat at Braj Nidhi was the best decision. The state-of-the-art AV hall was perfectly equipped, and the serene environment led to our most productive strategy session yet."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Raj Malhotra" /><div><h4>Raj Malhotra</h4><span>CEO, TechVision India</span></div></div>
                        </div>
                        {/* Card 2 - Priya Iyer */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The hospitality team went above and beyond for our offsite. The working lunches were fantastic, and the morning meditation sessions completely recharged the entire team."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="Priya Iyer" /><div><h4>Priya Iyer</h4><span>HR Director, GlobalCorp</span></div></div>
                        </div>
                        {/* Card 3 - Vikram Sethi */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Braj Nidhi offers a unique blend of modern facilities and spiritual peace. It's the perfect place for team building and deep focus away from the city noise."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" alt="Vikram Sethi" /><div><h4>Vikram Sethi</h4><span>Operations Manager</span></div></div>
                        </div>
                        {/* Card 4 - Anjali Patel */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The pure vegetarian catering was a huge hit with our international clients. The attention to detail in the Bose sound system and AV setup made our conference absolutely seamless."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=150&auto=format&fit=crop" alt="Anjali Patel" /><div><h4>Anjali Patel</h4><span>Executive Director</span></div></div>
                        </div>
                        {/* Card 5 - Sanjay Kumar */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"We've hosted multiple offsites at Braj Nidhi. The combination of luxury rooms, professional AV facilities, and the peaceful Braj atmosphere makes it our go-to choice."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Sanjay Kumar" /><div><h4>Sanjay Kumar</h4><span>VP Operations, Indigo Tech</span></div></div>
                        </div>
                        {/* Card 6 - Sunita Reddy */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Our leadership team returned refreshed and recharged after the Braj Yatra experience. The perfect blend of business infrastructure and spiritual wellness. Highly recommended!"</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="Sunita Reddy" /><div><h4>Sunita Reddy</h4><span>CHRO, Reliance infra</span></div></div>
                        </div>
                        {/* Duplicated for loop */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Hosting our annual leadership retreat at Braj Nidhi was the best decision. The state-of-the-art AV hall was perfectly equipped, and the serene environment led to our most productive strategy session yet."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Raj Malhotra" /><div><h4>Raj Malhotra</h4><span>CEO, TechVision India</span></div></div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The hospitality team went above and beyond for our offsite. The working lunches were fantastic, and the morning meditation sessions completely recharged the entire team."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="Priya Iyer" /><div><h4>Priya Iyer</h4><span>HR Director, GlobalCorp</span></div></div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Braj Nidhi offers a unique blend of modern facilities and spiritual peace. It's the perfect place for team building and deep focus away from the city noise."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" alt="Vikram Sethi" /><div><h4>Vikram Sethi</h4><span>Operations Manager</span></div></div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The pure vegetarian catering was a huge hit with our international clients. The attention to detail in the Bose sound system and AV setup made our conference absolutely seamless."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=150&auto=format&fit=crop" alt="Anjali Patel" /><div><h4>Anjali Patel</h4><span>Executive Director</span></div></div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"We've hosted multiple offsites at Braj Nidhi. The combination of luxury rooms, professional AV facilities, and the peaceful Braj atmosphere makes it our go-to choice."</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Sanjay Kumar" /><div><h4>Sanjay Kumar</h4><span>VP Operations, Indigo Tech</span></div></div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Our leadership team returned refreshed and recharged after the Braj Yatra experience. The perfect blend of business infrastructure and spiritual wellness. Highly recommended!"</p>
                            <div className="testi-user"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="Sunita Reddy" /><div><h4>Sunita Reddy</h4><span>CHRO, Reliance infra</span></div></div>
                        </div>
</div>
                </div>
            </div>
        </section>

        {/* Lead Capture Form */}
        <section id="inquiry" className="inquiry-form-section">
            <div className="inquiry-layout">

                {/* Left Info Panel */}
                <motion.div 
                    className="inquiry-info-panel"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inquiry-eyebrow"><i className="fas fa-briefcase"></i> Corporate Inquiries</div>
                    <h2>Plan Your Corporate Event</h2>
                    <p>Tell us about your event requirements. Our corporate team will craft a tailored proposal and reach out within 24 hours.</p>

                    <div className="inquiry-trust-items">
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-clock"></i></div>
                            <div>
                                <h5>24-Hour Response</h5>
                                <p>Our corporate events team will review your requirements and respond within one business day.</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-project-diagram"></i></div>
                            <div>
                                <h5>Dedicated Coordinator</h5>
                                <p>A dedicated events coordinator will be assigned to manage your entire event seamlessly.</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-building"></i></div>
                            <div>
                                <h5>50+ Corporate Clients</h5>
                                <p>Trusted by leading companies for leadership retreats, conferences, and team offsites.</p>
                            </div>
                        </div>
                    </div>

                    <a href="#" className="inquiry-download-link">
                        <i className="fas fa-file-pdf"></i> Download Corporate Brochure
                    </a>
                </motion.div>

                {/* Right Form Card */}
                <motion.div 
                    className="inquiry-form-card"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="form-card-title">Fill in Your Details</div>
                    <form className="inquiry-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" required />
                        </div>
                        <div className="form-group">
                            <label>Contact Person</label>
                            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="e.g. John Doe" required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 90000 00000" required />
                        </div>
                        <div className="form-group full-width">
                            <label>Event Type</label>
                            <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                                <option value="conference">Day Conference</option>
                                <option value="retreat">Leadership Retreat / Offsite</option>
                                <option value="meeting">Board Meeting</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estimated Attendees</label>
                            <input type="number" name="attendees" value={formData.attendees} onChange={handleChange} placeholder="e.g. 50" />
                        </div>
                        <div className="form-group">
                            <label>Expected Date</label>
                            <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleChange} />
                        </div>
                        <div className="form-group full-width">
                            <label>Additional Requirements</label>
                            <textarea rows={4} name="additionalRequirements" value={formData.additionalRequirements} onChange={handleChange} placeholder="Describe your needs — AV setup, accommodation, catering preferences, breakout sessions..."></textarea>
                        </div>
                        
                        {status === 'success' && (
                            <div className="form-group full-width" style={{ padding: '12px', background: '#e6ffe6', color: '#006600', borderRadius: '8px', border: '1px solid #00cc00', textAlign: 'center' }}>
                                Thank you for your inquiry! Our corporate team will reach out to you shortly.
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="form-group full-width" style={{ padding: '12px', background: '#ffe6e6', color: '#cc0000', borderRadius: '8px', border: '1px solid #cc0000', textAlign: 'center' }}>
                                {errorMessage}
                            </div>
                        )}

                        <button type="submit" disabled={status === 'loading'} style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
                            {status === 'loading' ? 'Sending...' : 'Send Inquiry'} <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
<p className="form-footer-note"><i className="fas fa-lock"></i> Your information is secure and confidential</p>
                </motion.div>
            </div>
        </section>

    </main>

    {/* Footer */}
    <footer className="site-footer" id="contact" style={{"marginTop":"0","background":"#fff","paddingTop":"80px"}}>
        <div className="footer-top-links">
            <div className="footer-col">
                <h3>Our Services</h3>
                <a href="/guesthouse">Guesthouse</a>
                <a href="/weddings">Weddings</a>
                <a href="/corporate">Corporate</a>
                <a href="/braj-yatra">Braj Yatra</a>
            </div>
            <div className="footer-col">
                <h3>Explore Vrindavan</h3>
                <a href="/braj-yatra#packages">Sapt Devalaya Yatra</a>
                <a href="/braj-yatra#packages">Chaurasi Kos Yatra</a>
                <a href="/braj-yatra">Govardhan Parikrama</a>
                <a href="/braj-yatra">Barsana & Nandgaon</a>
                            <a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer">Chandrodaya Mandir</a>
                <a href="https://www.vhtofficial.com/" target="_blank" rel="noopener noreferrer">Heritage Tower</a>
</div>
            <div className="footer-col">
                <h3>Stay & Book</h3>
                <a href="/#contact">Book Your Stay</a>
                <a href="/weddings">Wedding Packages</a>
                <a href="/corporate">Corporate Stays</a>
                <Link href="/cancellation-policy">Refund Policy</Link>
            </div>
            <div className="footer-col">
                <h3>Help & Support</h3>
                <a href="#">FAQ</a>
                <a href="/contact">Contact Us</a>
                <a href="#">Direction Map</a>
                <a href="#">Group Inquiries</a>
            </div>
            <div className="footer-col">
                <h3>Information</h3>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <Link href="/guest-policy">Guest Policy</Link>
                <Link href="/cancellation-policy">Cancellation Policy</Link>
            </div>
                        <div className="footer-col">
                <h3>Follow Us</h3>
                <a href="https://wa.me/917037794300" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://www.instagram.com/braj.nidhi_/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
        </div>
        
        <div className="footer-middle-bar">
            <Link href="/privacy">Privacy Policy</Link>
            <span>Copyright &copy; BRAJNIDHI {new Date().getFullYear()}</span>
            <Link href="/terms">Terms Of Use</Link>
        </div>

        <div className="footer-massive-text">
            BRAJNIDHI
        </div>
    </footer>

    <FloatingWidgets />
    
    </div>
  );
}



