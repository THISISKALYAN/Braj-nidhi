"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import NearbyAttractions from "@/components/NearbyAttractions";
import FloatingWidgets from "@/components/FloatingWidgets";
import BookNowButton from "@/components/BookNowButton";

const visitRows = [
  {
    label: "Location:",
    value: "Braj Nidhi Dham, near Prem Mandir, Raman Reti, Vrindavan, Uttar Pradesh, PIN 281121",
  },
  { label: "Open Daily:", value: "24/7 Front Desk · Check-in 12:00 PM" },
  { label: "Phone:", value: "+91 70377 94300" },
  { label: "Email:", value: "support@thebrajnidhi.com" },
];

export default function Contact() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("guesthouse");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your inquiry! We will get back to you within 24 hours.");
  };

  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" as const },
  };

  return (
    <motion.div className="contact-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .contact-page { background: #fafafa; }

        .contact-hero-split {
          background: #0a0a0a;
          padding: 130px 6% 70px;
          min-height: 85vh;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .contact-hero-title {
          font-family: 'Arial Black', sans-serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          color: #e8dcc8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 0.95;
          margin: 0;
        }
        .contact-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: stretch;
          flex: 1;
        }
        .contact-hero-image {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          min-height: 420px;
        }
        .contact-hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .contact-hero-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 60%, rgba(10,10,10,0.4));
        }
        .contact-hero-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 28px;
          padding: 20px 0;
        }
        .btn-reserve-hero {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #c45c26;
          color: #fff;
          font-family: 'Arial Black', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 18px 36px;
          text-decoration: none;
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
          width: fit-content;
        }
        .btn-reserve-hero:hover {
          background: #d46a32;
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(196, 92, 38, 0.4);
        }
        .visit-us-heading {
          font-size: 1.35rem;
          color: #e8dcc8;
          font-weight: 600;
          margin: 0;
        }
        .visit-us-rows { display: flex; flex-direction: column; }
        .visit-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(232, 220, 200, 0.25);
          align-items: start;
        }
        .visit-row-label { color: rgba(232, 220, 200, 0.55); font-size: 0.9rem; }
        .visit-row-value { color: #fff; font-size: 0.95rem; line-height: 1.5; }

        /* Quick Booking Bar */
        .quick-booking-bar {
          background: #fff;
          max-width: 1200px;
          margin: -50px auto 0;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          position: relative;
          z-index: 10;
          overflow: hidden;
        }
        .booking-tabs {
          display: flex;
          background: #1a1a1a;
          padding: 0;
        }
        .booking-tab {
          flex: 1;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255,255,255,0.5);
          font-family: 'Arial Black', sans-serif;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: all 0.3s;
        }
        .booking-tab:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        .booking-tab.active {
          background: #7c5a2a;
          color: #fff;
        }
        .booking-tab i { font-size: 1.1rem; }
        .booking-fields {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0;
          padding: 32px 36px;
          align-items: end;
        }
        .booking-field {
          padding: 0 24px;
          border-right: 1px solid #eee;
        }
        .booking-field:last-of-type { border-right: none; }
        .booking-field-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #999;
          margin-bottom: 10px;
        }
        .booking-field-sub {
          font-size: 0.78rem;
          color: #bbb;
          margin-top: 6px;
        }
        .booking-field select,
        .booking-field input {
          width: 100%;
          padding: 12px 0;
          border: none;
          background: transparent;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }
        .booking-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237c5a2a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0 center;
        }
        .btn-check-availability {
          background: #7c5a2a;
          color: #fff;
          border: none;
          padding: 20px 40px;
          border-radius: 12px;
          font-family: 'Arial Black', sans-serif;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .btn-check-availability:hover {
          background: #9e7f52;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 90, 42, 0.3);
        }

        .inquiry-section {
          padding: 90px 6%;
          background: #fafafa;
        }
        .inquiry-container {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 0;
          align-items: start;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }
        .inquiry-info {
          padding: 50px 45px;
          background: #f8f7f4;
          border-right: 1px solid #eee;
        }
        .inquiry-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 90, 42, 0.1);
          color: #7c5a2a;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 6px 14px;
          border-radius: 50px;
          margin-bottom: 20px;
        }
        .inquiry-info h2 {
          font-family: 'Arial Black', sans-serif;
          font-size: 2.2rem;
          text-transform: uppercase;
          line-height: 1.15;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .inquiry-info > p { color: #666; line-height: 1.7; margin-bottom: 32px; font-size: 0.95rem; }
        .inquiry-features { display: flex; flex-direction: column; gap: 24px; margin-bottom: 36px; }
        .inquiry-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .inquiry-feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(124, 90, 42, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c5a2a;
          flex-shrink: 0;
          font-size: 1.1rem;
        }
        .inquiry-feature h4 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
          font-weight: 800;
          color: #1a1a1a;
        }
        .inquiry-feature span { font-size: 0.85rem; color: #777; line-height: 1.5; }
        .btn-download-brochure {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border: 2px solid #1a1a1a;
          background: transparent;
          color: #1a1a1a;
          font-family: 'Arial Black', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .btn-download-brochure:hover {
          background: #1a1a1a;
          color: #fff;
        }
        .inquiry-form-card {
          padding: 50px 45px;
          background: #faf9f7;
        }
        .form-card-title {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 28px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eee;
          font-size: 1rem;
          color: #1a1a1a;
        }
        .contact-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full-width { grid-column: span 2; }
        .contact-form label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #555;
        }
        .contact-form input,
        .contact-form select,
        .contact-form textarea {
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid #e5e5e5;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          font-family: inherit;
          color: #1a1a1a;
        }
        .contact-form input::placeholder,
        .contact-form textarea::placeholder {
          color: #aaa;
        }
        .contact-form input:focus,
        .contact-form select:focus,
        .contact-form textarea:focus {
          border-color: #7c5a2a;
          box-shadow: 0 0 0 3px rgba(124, 90, 42, 0.1);
        }
        .contact-form textarea { min-height: 110px; resize: vertical; }
        .contact-form select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
        .btn-submit-inquiry {
          grid-column: span 2;
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 18px;
          border-radius: 6px;
          font-family: 'Arial Black', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
          transition: background 0.3s, transform 0.3s;
          font-size: 0.9rem;
        }
        .btn-submit-inquiry:hover {
          background: #7c5a2a;
          transform: translateY(-2px);
        }
        .form-footer-note {
          text-align: center;
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Scrolling Banner */
        .scrolling-banner-section {
          background: #1a1a1a;
          padding: 20px 0;
          overflow: hidden;
          border-top: 1px solid rgba(124, 90, 42, 0.3);
          border-bottom: 1px solid rgba(124, 90, 42, 0.3);
        }
        .scrolling-banner-track {
          display: flex;
          animation: scrollBanner 25s linear infinite;
          width: max-content;
        }
        .scrolling-banner-track:hover {
          animation-play-state: paused;
        }
        @keyframes scrollBanner {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-banner-content {
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 0 20px;
        }
        .banner-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.7);
          font-family: 'Arial Black', sans-serif;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          white-space: nowrap;
        }
        .banner-item i {
          color: #7c5a2a;
          font-size: 1rem;
        }
        .banner-dot {
          color: #7c5a2a;
          font-size: 0.6rem;
          opacity: 0.6;
        }

        .location-section {
          padding: 90px 6%;
          background: #fff;
        }
        .location-container {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 60px;
          align-items: start;
        }
        .location-info > p {
          color: #555;
          line-height: 1.7;
          margin-bottom: 32px;
          font-size: 1rem;
        }
        .location-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .location-item {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 24px;
          background: #faf9f7;
          border-radius: 12px;
          border: 1px solid #f0ede6;
          transition: transform 0.3s;
        }
        .location-item:hover {
          transform: translateX(4px);
        }
        .location-item-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f5efe6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c5a2a;
          flex-shrink: 0;
          font-size: 1rem;
        }
        .location-item-content h4 {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
          font-weight: 800;
          color: #bbb;
        }
        .location-item-content p {
          color: #1a1a1a;
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.5;
          font-weight: 500;
        }
        .location-map {
          height: 520px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
        }
        .location-map iframe { width: 100%; height: 100%; border: none; }

        @media (max-width: 900px) {
          .contact-hero-grid, .inquiry-container, .location-container {
            grid-template-columns: 1fr;
          }
          .contact-hero-image { min-height: 300px; }
          .inquiry-container { border-radius: 16px; }
          .inquiry-info { border-right: none; border-bottom: 1px solid #eee; padding: 36px 28px; }
          .inquiry-form-card { padding: 36px 28px; }
          .contact-form { grid-template-columns: 1fr; }
          .form-group.full-width, .btn-submit-inquiry { grid-column: span 1; }
          .visit-row { grid-template-columns: 1fr; gap: 6px; }
          .booking-fields {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
          }
          .booking-field { border-right: none; border-bottom: 1px solid #eee; padding: 0 0 16px; }
          .booking-field:last-of-type { border-bottom: none; }
          .btn-check-availability { grid-column: span 2; justify-content: center; }
        }
        @media (max-width: 500px) {
          .booking-tabs { flex-wrap: wrap; }
          .booking-tab { flex: 1 1 50%; font-size: 0.75rem; padding: 14px 12px; }
          .booking-fields { grid-template-columns: 1fr; }
          .btn-check-availability { grid-column: span 1; }
        }
      `,
        }}
      />

      <header id="main-header" className={scrolled ? "scrolled" : ""}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/sp logo.webp" alt="Srila Prabhupada" width={100} height={60} style={{ height: '60px', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} />
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" width={165} height={55} style={{ height: '55px', width: 'auto', display: 'block' }} />
            </Link>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/LOGO1.webp" alt="Vrindavan Chandrodaya Mandir" width={50} height={50} style={{ height: '50px', width: 'auto', display: 'block', borderRadius: '6px' }} />
            </Link>
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

        {/* Mobile Header Actions Flex Wrapper */}
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
        <section className="contact-hero-split">
          <motion.h1
            className="contact-hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            Get In Touch
          </motion.h1>
          <div className="contact-hero-grid">
            <motion.div
              className="contact-hero-image"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15 }}
            >
              <img loading="lazy" decoding="async" src="/h11.webp"
                alt="Braj Nidhi hospitality" />
            </motion.div>
            <motion.div
              className="contact-hero-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
            >
              <motion.a
                href="#inquiry"
                className="btn-reserve-hero"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Reserve a Stay
              </motion.a>
              <h2 className="visit-us-heading">Visit Us</h2>
              <div className="visit-us-rows">
                {visitRows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    className="visit-row"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <span className="visit-row-label">{row.label}</span>
                    <span className="visit-row-value">{row.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

<section id="inquiry" className="inquiry-section">
          <div className="inquiry-container">
            <motion.div className="inquiry-info" {...fadeUp}>
              <motion.div className="inquiry-eyebrow">
                <i className="fas fa-comments" /> General Inquiries
              </motion.div>
              <h2>Plan Your Visit</h2>
              <p>
                Tell us about your travel plans. Our hospitality team will craft a personalized experience and reach out within 24 hours.
              </p>
              <div className="inquiry-features">
                <div className="inquiry-feature">
                  <div className="inquiry-feature-icon">
                    <i className="fas fa-clock" />
                  </div>
                  <div>
                    <h4>24-Hour Response</h4>
                    <span>Our team will review your requirements and respond within one business day.</span>
                  </div>
                </div>
                <div className="inquiry-feature">
                  <div className="inquiry-feature-icon">
                    <i className="fas fa-user-tie" />
                  </div>
                  <div>
                    <h4>Dedicated Coordinator</h4>
                    <span>A personal point of contact will be assigned to manage your entire stay seamlessly.</span>
                  </div>
                </div>
                <div className="inquiry-feature">
                  <div className="inquiry-feature-icon">
                    <i className="fas fa-building" />
                  </div>
                  <div>
                    <h4>10,000+ Happy Guests</h4>
                    <span>Trusted by travelers worldwide for spiritual retreats, family vacations, and peaceful getaways.</span>
                  </div>
                </div>
              </div>
              <a href="#" className="btn-download-brochure">
                <i className="fas fa-file-pdf" /> Download Guest Brochure
              </a>
            </motion.div>

            <motion.div
              className="inquiry-form-card"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="form-card-title">Fill In Your Details</div>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" name="name" placeholder="e.g. John Doe" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="+91 90000 00000" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="john@email.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Interested In</label>
                  <select name="interest" value={formData.interest} onChange={handleChange} required>
                    <option value="">Select an option</option>
                    <option value="guesthouse">Guesthouse Stay</option>
                    <option value="dining">Dining Experience</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Date</label>
                  <input type="date" name="date" />
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input type="number" name="guests" placeholder="e.g. 2" />
                </div>
                <div className="form-group full-width">
                  <label>Additional Requirements</label>
                  <textarea
                    name="message"
                    placeholder="Describe your needs — room preferences, dietary requirements, special requests..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                <motion.button
                  type="submit"
                  className="btn-submit-inquiry"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Inquiry <i className="fas fa-paper-plane" />
                </motion.button>
              </form>
              <p className="form-footer-note">
                <i className="fas fa-lock" /> Your information is secure and confidential
              </p>
            </motion.div>
          </div>
        </section>

        {/* Scrolling Banner */}
        <section className="scrolling-banner-section">
          <div className="scrolling-banner-track">
            <div className="scrolling-banner-content">
              <span className="banner-item"><i className="fas fa-hotel"></i> Luxury Guesthouse</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-utensils"></i> Sattvic Dining</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-om"></i> Spiritual Retreats</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-gopuram"></i> Temple Tours</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-spa"></i> Wellness & Yoga</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-ring"></i> Wedding Venues</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-briefcase"></i> Corporate Events</span>
              <span className="banner-dot">✦</span>
            </div>
            <div className="scrolling-banner-content" aria-hidden="true">
              <span className="banner-item"><i className="fas fa-hotel"></i> Luxury Guesthouse</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-utensils"></i> Sattvic Dining</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-om"></i> Spiritual Retreats</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-gopuram"></i> Temple Tours</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-spa"></i> Wellness & Yoga</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-ring"></i> Wedding Venues</span>
              <span className="banner-dot">✦</span>
              <span className="banner-item"><i className="fas fa-briefcase"></i> Corporate Events</span>
              <span className="banner-dot">✦</span>
            </div>
          </div>
        </section>

        <section className="location-section">
          <div className="location-container">
            <motion.div className="location-info" {...fadeUp}>
              <p>
                Located in the heart of Braj, Braj Nidhi offers easy access to
                sacred temples and spiritual landmarks.
              </p>
              <div className="location-details">
                <div className="location-item">
                  <div className="location-item-icon">
                    <i className="fas fa-map-pin" />
                  </div>
                  <div className="location-item-content">
                    <h4>Address</h4>
                    <p>Braj Nidhi Dham, near Prem Mandir, Raman Reti, Vrindavan, Uttar Pradesh, PIN 281121</p>
                  </div>
                </div>
                <div className="location-item">
                  <div className="location-item-icon">
                    <i className="fas fa-phone" />
                  </div>
                  <div className="location-item-content">
                    <h4>Phone</h4>
                    <p><a href="tel:+917037794300" className="hover:text-gold transition-colors">+91 70377 94300</a></p>
                  </div>
                </div>
                <div className="location-item">
                  <div className="location-item-icon">
                    <i className="fas fa-envelope" />
                  </div>
                  <div className="location-item-content">
                    <h4>Email</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p><a href="mailto:support@thebrajnidhi.com" className="hover:text-gold transition-colors">Support: support@thebrajnidhi.com</a></p>
                      <p><a href="mailto:bookings@thebrajnidhi.com" className="hover:text-gold transition-colors">Bookings: bookings@thebrajnidhi.com</a></p>
                      <p><a href="mailto:corporateevents@thebrajnidhi.com" className="hover:text-gold transition-colors">Corporate Events: corporateevents@thebrajnidhi.com</a></p>
                      <p><a href="mailto:weddings@thebrajnidhi.com" className="hover:text-gold transition-colors">Weddings: weddings@thebrajnidhi.com</a></p>
                    </div>
                  </div>
                </div>
                <div className="location-item">
                  <div className="location-item-icon">
                    <i className="fas fa-car" />
                  </div>
                  <div className="location-item-content">
                    <h4>Getting Here</h4>
                    <p>45 mins from Mathura Station · 3 hrs from Delhi Airport</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="location-map"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.7180523761876!2d77.64352459999999!3d27.571259500000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736d95ffadb1e5%3A0x964d0da837084cf6!2sBraj%20Nidhi%20Guest%20House!5e0!3m2!1sen!2sin!4v1782829856223!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Braj Nidhi Location"
              />
            </motion.div>
          </div>
        </section>

        <NearbyAttractions />
      </main>

      <footer className="site-footer">
        <div className="footer-top-links">
          <div className="footer-col">
            <h3>Our Services</h3>
            <Link href="/guesthouse">Guesthouse</Link>
            <Link href="/weddings">Weddings</Link>
            <Link href="/corporate">Corporate</Link>
            <Link href="/braj-yatra">Braj Yatra</Link>
          </div>
          <div className="footer-col">
            <h3>Explore Vrindavan</h3>
            <a href="/braj-yatra#packages">Sapt Devalaya Yatra</a>
            <a href="/braj-yatra#packages">Chaurasi Kos Yatra</a>
            <a href="/braj-yatra">Govardhan Parikrama</a>
            <a href="/braj-yatra">Barsana & Nandgaon</a>
          </div>
          <motion.div className="footer-col">
            <h3>Stay & Book</h3>
            <Link href="/booking">Book Your Stay</Link>
            <Link href="/weddings">Wedding Packages</Link>
            <Link href="/corporate">Corporate Stays</Link>
            <a href="#">Refund Policy</a>
          </motion.div>
          <div className="footer-col">
            <h3>Help & Support</h3>
            <a href="#">FAQ</a>
            <Link href="/contact">Contact Us</Link>
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
        <div className="footer-massive-text">BRAJNIDHI</div>
      </footer>
      <FloatingWidgets />
    </motion.div>
  );
}
