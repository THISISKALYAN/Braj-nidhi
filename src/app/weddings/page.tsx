"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

const FloatingWidgets = dynamic(() => import('@/components/FloatingWidgets'), { ssr: false });
const BookNowButton = dynamic(() => import('@/components/BookNowButton'), { ssr: false });

export default function Weddings() {
  const [heroImgIndex, setHeroImgIndex] = useState(0);
  const heroImages = ["/DSC02591.webp", "/DSC06003-HDR.webp"];

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="weddings-page">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Events specific styles */
        body {
            background-color: #fafafa;
            color: #1a1a1a;
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

        /* Gallery Masonry */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            grid-auto-rows: 250px;
            grid-auto-flow: dense;
            gap: 10px;
            margin-top: 40px;
        }

        .gallery-item {
            position: relative;
            overflow: hidden;
            border-radius: 4px;
        }

        .gallery-item.large {
            grid-column: span 2;
            grid-row: span 2;
        }

        .gallery-item.tall {
            grid-row: span 2;
        }

        .gallery-item.wide {
            grid-column: span 2;
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .gallery-item:hover img {
            transform: scale(1.05);
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
            background: #fff5e6;
            color: #e95d35;
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
            background: #fff5e6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .trust-icon i {
            color: #e95d35;
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
            border-color: #e95d35;
            box-shadow: 0 0 0 3px rgba(233, 93, 53, 0.08);
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
            background: #e95d35;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(233, 93, 53, 0.3);
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
            .gallery-item.large, .gallery-item.wide {
                grid-column: span 1;
            }
            .form-group.full-width {
                grid-column: span 1;
            }
            .inquiry-form button {
                grid-column: span 1;
            }
        }

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
        .testi-card {
            flex-shrink: 0;
            width: 380px;
            background: #fff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 32px;
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        .testi-quote { font-size: 1.5rem; color: #fbc434; margin-bottom: 16px; }
        .testi-stars { color: #fbc434; font-size: 0.9rem; margin-bottom: 12px; letter-spacing: 2px; }
        .testi-text { font-size: 0.95rem; color: #555; line-height: 1.6; font-style: italic; margin-bottom: 20px; }
        .testi-user { display: flex; align-items: center; gap: 12px; margin-top: auto; }
        .testi-user img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
        .testi-user h4 { font-family: 'Arial Black', sans-serif; font-size: 0.9rem; text-transform: uppercase; margin: 0; color: #1a1a1a; }
        .testi-user span { font-size: 0.8rem; color: #888; }

        /* Responsive Styles */
        .testi-container-outer {
            position: relative;
            padding: 0 40px;
        }
        .testi-gradient-overlay {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100px;
            z-index: 2;
            pointer-events: none;
            filter: blur(3px);
        }
        .testi-gradient-overlay.left {
            left: 0;
            background: linear-gradient(to right, #fdfcf8 0%, transparent 100%);
        }
        .testi-gradient-overlay.right {
            right: 0;
            background: linear-gradient(to left, #fdfcf8 0%, transparent 100%);
        }

        @media (max-width: 768px) {
            .testi-track { gap: 16px; }
            .testi-container-outer {
                padding: 0 16px;
            }
            .testi-gradient-overlay {
                width: 40px;
            }
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

        {/* Mobile Header Actions Wrapper */}
        <div className="mobile-header-actions">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
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
                <div className="hero-title-large">DIVINE CELEBRATIONS</div>
                
                <div className="hero-single-card">
                    {heroImages.map((img, i) => {
                        const isActive = heroImgIndex === i;
                        const isPrev = (heroImgIndex - 1 + heroImages.length) % heroImages.length === i;
                        return (
                            <motion.img 
                                key={img}
                                src={img}
                                alt="Divine Weddings"
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
                        <h3>Your Divine Journey Begins</h3>
                        <p>Experience the spiritual heart of Vrindavan with our bespoke wedding venues and personalized services designed for your special day.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Weddings & Events Module */}
        <section id="weddings" className="module-section">
            <motion.div className="module-header" {...fadeInUp}>
                <h2>Wedding Venues</h2>
                <p>From intimate spiritual ceremonies to grand celebrations, our venues offer the perfect blend of heritage charm and modern luxury.</p>
            </motion.div>

            <motion.div className="events-bento" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="bento-item" variants={slideInLeft}>
                    <i className="fas fa-om"></i>
                    <h4>The Grand Courtyard</h4>
                    <p>An open-air venue perfect for traditional ceremonies under the stars. Accommodates up to 500 guests with customized mandap setups.</p>
                </motion.div>
                <motion.div className="bento-item" variants={fadeInUp}>
                    <i className="fas fa-place-of-worship"></i>
                    <h4>Royal Banquet</h4>
                    <p>A fully air-conditioned, pillar-less hall designed for grand receptions and sangeet nights. Premium acoustics and lighting included.</p>
                </motion.div>
                <motion.div className="bento-item" variants={slideInRight}>
                    <i className="fas fa-camera"></i>
                    <h4>Pre-Wedding Spaces</h4>
                    <p>Beautifully landscaped gardens and heritage architecture providing stunning backdrops for your pre-wedding photography.</p>
                </motion.div>
            </motion.div>

            <motion.div className="packages-grid" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="package-card" variants={slideInLeft}>
                    <div className="package-badge">Popular</div>
                    <h3>The Eternal Vows</h3>
                    <ul className="package-features">
                        <li><i className="fas fa-check"></i> Grand Courtyard Venue Access (12 Hours)</li>
                        <li><i className="fas fa-check"></i> Traditional Floral Mandap Setup</li>
                        <li><i className="fas fa-check"></i> Pure Vegetarian Catering for 200 Guests</li>
                        <li><i className="fas fa-check"></i> 2 Bridal Dressing Rooms</li>
                        <li><i className="fas fa-check"></i> Basic Sound & Lighting System</li>
                    </ul>
                    <a href="#inquiry" className="btn-outline" style={{"border":"2px solid #1a1a1a","padding":"15px 30px","textDecoration":"none","color":"#1a1a1a","fontWeight":"800","textTransform":"uppercase","display":"inline-block"}}>Request Quote</a>
                </motion.div>
                
                <motion.div className="package-card" variants={slideInRight}>
                    <h3>The Heritage Royale</h3>
                    <ul className="package-features">
                        <li><i className="fas fa-check"></i> Full Property Exclusive Access (2 Days)</li>
                        <li><i className="fas fa-check"></i> Custom Theme Decor & floral arrangements</li>
                        <li><i className="fas fa-check"></i> Multi-cuisine Live Counters for 500 Guests</li>
                        <li><i className="fas fa-check"></i> 20 Guest Suites Included</li>
                        <li><i className="fas fa-check"></i> Dedicated Event Manager</li>
                    </ul>
                    <a href="#inquiry" className="btn-outline" style={{"border":"2px solid #1a1a1a","padding":"15px 30px","textDecoration":"none","color":"#1a1a1a","fontWeight":"800","textTransform":"uppercase","display":"inline-block"}}>Request Quote</a>
                </motion.div>
            </motion.div>
        </section>

        {/* Culinary Excellence Split Section */}
        <motion.section className="split-section" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="split-content" variants={slideInLeft}>
                <h3>Sattvic Culinary Excellence</h3>
                <p>Delight your guests with our exquisite, pure vegetarian catering. From traditional regional delicacies to global cuisines, our master chefs craft menus that are both divinely delicious and culturally respectful.</p>
                <p>Experience interactive live counters, artisanal sweets, and customized wedding cakes, all prepared in our state-of-the-art hygienic kitchens without onion or garlic.</p>
                <ul className="package-features" style={{"marginTop":"20px"}}>
                    <li><i className="fas fa-check"></i> 100% Pure Vegetarian (No Onion/Garlic option)</li>
                    <li><i className="fas fa-check"></i> Customized Menus & Live Counters</li>
                    <li><i className="fas fa-check"></i> Specialized Artisanal Sweets</li>
                </ul>
            </motion.div>
            <motion.div className="split-image" variants={slideInRight}>
                <img loading="lazy" decoding="async" src="/the-design-thoughtfully.webp" alt="Sattvic Culinary Excellence" />
            </motion.div>
        </motion.section>

        {/* Guest Accommodation Split Section (Reverse) */}
        <motion.section className="split-section reverse" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div className="split-content" variants={slideInRight}>
                <h3>Luxury Guest Accommodation</h3>
                <p>Ensure your family and friends experience the utmost comfort during your multi-day celebrations. Braj Nidhi offers premium rooms and expansive suites designed with spiritual luxury in mind.</p>
                <p>Our dedicated hospitality team ensures seamless check-ins, personalized welcome hampers, and 24/7 room service for your esteemed guests.</p>
                <a href="/guesthouse" className="btn-outline" style={{"border":"2px solid #1a1a1a","padding":"12px 25px","textDecoration":"none","color":"#1a1a1a","fontWeight":"800","textTransform":"uppercase","display":"inline-block","marginTop":"15px"}}>View Rooms & Suites</a>
            </motion.div>
            <motion.div className="split-image" variants={slideInLeft}>
                <img loading="lazy" decoding="async" src="/DSC05963-HDR.webp" alt="Luxury Suites" />
            </motion.div>
        </motion.section>

        {/* Wedding Gallery */}
        <section className="module-section" style={{"paddingTop":"20px"}}>
            <motion.div className="module-header" {...fadeInUp}>
                <h2>Moments of Magic</h2>
                <p>A glimpse into the beautiful memories crafted at Braj Nidhi.</p>
            </motion.div>
            <motion.div className="gallery-grid" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                <motion.div className="gallery-item large" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we8.webp" alt="Wedding Celebration" style={{objectPosition: 'center center'}} />
                </motion.div>
                <motion.div className="gallery-item tall" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we1.webp" alt="Wedding Moments" style={{objectPosition: 'center center'}} />
                </motion.div>
                <motion.div className="gallery-item wide" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we2.webp" alt="Wedding Decor" style={{objectPosition: 'center center'}} />
                </motion.div>
                <motion.div className="gallery-item" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we4.webp" alt="Wedding Ceremony" style={{objectPosition: 'center center'}} />
                </motion.div>
                <motion.div className="gallery-item tall" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we5.webp" alt="Wedding Reception" style={{objectPosition: 'center center'}} />
                </motion.div>
                <motion.div className="gallery-item wide" variants={fadeInUp}>
                    <img loading="lazy" decoding="async" src="/we7.webp" alt="Wedding Rituals" style={{objectPosition: 'center center'}} />
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

        {/* Happy Couples - Auto-scroll */}
        <section style={{background:'#fdfcf8', padding:'100px 0', overflow:'hidden', position:'relative'}}>
            <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 20px', textAlign:'center', marginBottom:'50px'}}>
                <div className="rating-badge">
                    <i className="fas fa-star"></i> Rated 4.9/5 by our happy couples
                </div>
                <h2 style={{fontFamily:'Arial Black,sans-serif', fontSize:'2.5rem', textTransform:'uppercase', color:'#1a1a1a', margin:'16px 0 12px'}}>Happy Couples</h2>
                <p style={{color:'#666', fontSize:'1.05rem'}}>Hear from those who began their forever journey with us.</p>
            </div>

            <div className="testi-container-outer">
                <div className="testi-gradient-overlay left"></div>
                <div className="testi-gradient-overlay right"></div>
                <div className="testi-track-wrap">
                    <div className="testi-track">
                        {/* Card 1 - Priya & Aarav */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Our wedding at Braj Nidhi was like a dream come true. The spiritual atmosphere combined with royal service made our special day truly divine. The team went above and beyond!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1615114814213-a2450f03ebe1?q=80&w=150&auto=format&fit=crop" alt="Priya & Aarav" />
                                <div>
                                    <h4>Priya & Aarav</h4>
                                    <span>Wedding Couple</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 2 - Kavita Sharma */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The mandap setup was absolutely breathtaking. Every detail, from the floral decorations to the authentic Sattvic catering, was handled with so much care and grace."</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=150&auto=format&fit=crop" alt="Kavita Sharma" />
                                <div>
                                    <h4>Kavita Sharma</h4>
                                    <span>Bride</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 3 - Vikram & Anjali */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"We couldn't have asked for a better venue. The team at Braj Nidhi made sure everything was perfect for our traditional Vedic ceremony. Truly unforgettable experience!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop" alt="Vikram & Anjali" />
                                <div>
                                    <h4>Vikram & Anjali</h4>
                                    <span>Anniversary Celebration</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 4 - Rajesh Khanna */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Exceptional hospitality! Our guests are still talking about the beautiful surroundings and the peace they felt during the entire event. Highly recommended for destination weddings."</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Rajesh Khanna" />
                                <div>
                                    <h4>Rajesh Khanna</h4>
                                    <span>Father of the Bride</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 5 - Meera & Arjun */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The Ganga Aarti theme was perfect for our reception. Braj Nidhi understood our vision and delivered beyond expectations. Our families are forever grateful!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=150&auto=format&fit=crop" alt="Meera & Arjun" />
                                <div>
                                    <h4>Meera & Arjun</h4>
                                    <span>Wedding Couple</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 6 - Sunita Devi */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"From the moment we arrived, we felt like royalty. The warm hospitality, pristine grounds, and spiritual ambiance made our daughter's wedding magical. Thank you Braj Nidhi!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="Sunita Devi" />
                                <div>
                                    <h4>Sunita Devi</h4>
                                    <span>Mother of the Bride</span>
                                </div>
                            </div>
                        </div>
                        {/* Duplicated for loop */}
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Our wedding at Braj Nidhi was like a dream come true. The spiritual atmosphere combined with royal service made our special day truly divine. The team went above and beyond!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1615114814213-a2450f03ebe1?q=80&w=150&auto=format&fit=crop" alt="Priya & Aarav" />
                                <div>
                                    <h4>Priya & Aarav</h4>
                                    <span>Wedding Couple</span>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The mandap setup was absolutely breathtaking. Every detail, from the floral decorations to the authentic Sattvic catering, was handled with so much care and grace."</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=150&auto=format&fit=crop" alt="Kavita Sharma" />
                                <div>
                                    <h4>Kavita Sharma</h4>
                                    <span>Bride</span>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"We couldn't have asked for a better venue. The team at Braj Nidhi made sure everything was perfect for our traditional Vedic ceremony. Truly unforgettable experience!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop" alt="Vikram & Anjali" />
                                <div>
                                    <h4>Vikram & Anjali</h4>
                                    <span>Anniversary Celebration</span>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"Exceptional hospitality! Our guests are still talking about the beautiful surroundings and the peace they felt during the entire event. Highly recommended for destination weddings."</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Rajesh Khanna" />
                                <div>
                                    <h4>Rajesh Khanna</h4>
                                    <span>Father of the Bride</span>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"The Ganga Aarti theme was perfect for our reception. Braj Nidhi understood our vision and delivered beyond expectations. Our families are forever grateful!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=150&auto=format&fit=crop" alt="Meera & Arjun" />
                                <div>
                                    <h4>Meera & Arjun</h4>
                                    <span>Wedding Couple</span>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card">
                            <div className="testi-quote"><i className="fas fa-quote-left"></i></div>
                            <div className="testi-stars">★★★★★</div>
                            <p className="testi-text">"From the moment we arrived, we felt like royalty. The warm hospitality, pristine grounds, and spiritual ambiance made our daughter's wedding magical. Thank you Braj Nidhi!"</p>
                            <div className="testi-user">
                                <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" alt="Sunita Devi" />
                                <div>
                                    <h4>Sunita Devi</h4>
                                    <span>Mother of the Bride</span>
                                </div>
                            </div>
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
                    <div className="inquiry-eyebrow"><i className="fas fa-ring"></i> Wedding Inquiries</div>
                    <h2>Plan Your Wedding</h2>
                    <p>Let us help you craft an unforgettable, divine celebration. Share your vision and our wedding experts will reach out within 24 hours.</p>

                    <div className="inquiry-trust-items">
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-clock"></i></div>
                            <div>
                                <h5>24-Hour Response</h5>
                                <p>Our dedicated wedding team responds to every inquiry within one business day.</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-shield-alt"></i></div>
                            <div>
                                <h5>100% Confidential</h5>
                                <p>Your personal information is safe with us and never shared with third parties.</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><i className="fas fa-star"></i></div>
                            <div>
                                <h5>Rated 4.9/5</h5>
                                <p>Over 200+ happy couples have celebrated their wedding with us in Vrindavan.</p>
                            </div>
                        </div>
                    </div>

                    <a href="#" className="inquiry-download-link">
                        <i className="fas fa-file-pdf"></i> Download Wedding Brochure
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
                    <form className="inquiry-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" placeholder="e.g. Priya" required />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" placeholder="e.g. Sharma" required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="priya@example.com" required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" placeholder="+91 90000 00000" required />
                        </div>
                        <div className="form-group full-width">
                            <label>Event Type</label>
                            <select required defaultValue="wedding">
                                <option value="wedding">Wedding</option>
                                <option value="pre-wedding">Pre-Wedding / Engagement</option>
                                <option value="anniversary">Anniversary Celebration</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estimated Guest Count</label>
                            <input type="number" placeholder="e.g. 150" />
                        </div>
                        <div className="form-group">
                            <label>Expected Date</label>
                            <input type="date" />
                        </div>
                        <div className="form-group full-width">
                            <label>Additional Requirements</label>
                            <textarea rows={4} placeholder="Tell us about your vision — decor style, catering preferences, special rituals..."></textarea>
                        </div>
                        <button type="submit">Send Inquiry <i className="fas fa-paper-plane"></i></button>
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
