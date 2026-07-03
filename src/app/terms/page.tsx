"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, Scale, FileText, CheckCircle2, ChevronRight, Home } from "lucide-react";
import FloatingWidgets from "@/components/FloatingWidgets";
import BookNowButton from "@/components/BookNowButton";

export default function TermsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div className="terms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .terms-page { 
          background: #ffffff; 
          min-height: 100vh;
          font-family: var(--font-outfit), sans-serif;
          color: #2c2520;
        }

        /* Header visibility overrides for white background */
        body.index-page .terms-page header:not(.scrolled) .logo,
        body.index-page .terms-page header:not(.scrolled) .logo span,
        body.index-page .terms-page header:not(.scrolled) nav ul li a,
        body.index-page .terms-page header:not(.scrolled) .mobile-menu-btn {
          color: #2c2520 !important;
        }

        body.index-page .terms-page header:not(.scrolled) nav ul li a:hover {
          color: #8b0000 !important;
        }

        body.index-page .terms-page header:not(.scrolled) .btn-book {
          background: #8b0000 !important;
          color: #ffffff !important;
          border: 1px solid #8b0000 !important;
        }

        body.index-page .terms-page header:not(.scrolled) .btn-book:hover {
          background: #a30000 !important;
          border-color: #a30000 !important;
          color: #ffffff !important;
          transform: translateY(-2px);
        }

        body.index-page .terms-page header:not(.scrolled) .btn-login {
          background: rgba(0, 0, 0, 0.05) !important;
          color: #2c2520 !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          box-shadow: none !important;
        }

        body.index-page .terms-page header:not(.scrolled) .btn-login:hover {
          background: rgba(0, 0, 0, 0.1) !important;
          border-color: rgba(0, 0, 0, 0.25) !important;
          transform: translateY(-2px) scale(1.02);
        }

        body.index-page .terms-page header:not(.scrolled) .user-name {
          color: #8b0000 !important;
        }

        body.index-page .terms-page header:not(.scrolled) .user-label {
          color: rgba(0, 0, 0, 0.5) !important;
        }

        body.index-page .terms-page header:not(.scrolled) .user-profile-badge {
          border-color: transparent !important;
          background: #8b0000 !important;
          color: #ffffff !important;
        }

        .terms-hero {
          background: #ffffff;
          padding: 160px 6% 60px;
          text-align: center;
          color: #2c2520;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .terms-hero h1 {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: clamp(3rem, 8vw, 5.5rem);
          color: #8b0000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          line-height: 0.95;
        }

        .terms-hero p {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: rgba(44, 37, 32, 0.75);
          max-width: 600px;
          margin: 0 auto;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 8px 16px;
          border-radius: 50px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          color: rgba(44, 37, 32, 0.6);
        }

        .breadcrumb a {
          color: #7c5a2a;
          text-decoration: none;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .breadcrumb a:hover {
          color: #8b0000;
        }

        .terms-content-section {
          padding: 80px 6%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .terms-grid {
          display: grid;
          grid-template-columns: 1.2fr 2fr;
          gap: 50px;
          align-items: start;
        }

        .terms-sidebar {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 110px;
        }

        .sidebar-title {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.6rem;
          font-weight: 400 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8b0000;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1.5px solid rgba(139, 0, 0, 0.1);
        }

        .sidebar-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(139, 0, 0, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(139, 0, 0, 0.08);
          margin-bottom: 16px;
        }

        .sidebar-badge-icon {
          color: #8b0000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-badge-text h5 {
          font-family: var(--font-outfit), sans-serif !important;
          font-size: 0.85rem;
          font-weight: 700;
          color: #2c2520;
          margin: 0;
          text-transform: uppercase;
        }

        .sidebar-badge-text p {
          font-size: 0.78rem;
          color: rgba(44, 37, 32, 0.6);
          margin: 4px 0 0;
        }

        .terms-main {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .policy-statement-card {
          background: #fff;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-left: 5px solid #d4af37;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 15px 40px rgba(212, 175, 55, 0.05);
          position: relative;
          overflow: hidden;
        }

        .policy-statement-card::after {
          content: '“';
          position: absolute;
          top: -20px;
          right: 20px;
          font-size: 150px;
          font-family: 'Georgia', serif;
          color: rgba(212, 175, 55, 0.06);
          line-height: 1;
        }

        .policy-statement-title {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #7c5a2a;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .policy-statement-text {
          font-size: 1.12rem;
          line-height: 1.8;
          color: #2c2520;
          font-weight: 500;
          margin: 0;
          font-style: italic;
        }

        .details-card {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
        }

        .details-card h2 {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 2.2rem;
          text-transform: uppercase;
          color: #2c2520;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding-bottom: 10px;
        }

        .details-card p {
          font-size: 0.98rem;
          line-height: 1.75;
          color: rgba(44, 37, 32, 0.75);
          margin-bottom: 24px;
        }

        .points-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .point-item {
          display: flex;
          gap: 16px;
          align-items: start;
        }

        .point-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(139, 0, 0, 0.06);
          color: #8b0000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.95rem;
        }

        .point-content h4 {
          font-family: var(--font-outfit), sans-serif !important;
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #2c2520;
          margin: 0 0 6px;
          letter-spacing: 0.5px;
        }

        .point-content p {
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(44, 37, 32, 0.65);
          margin: 0;
        }

        @media (max-width: 900px) {
          .terms-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .terms-sidebar {
            position: relative;
            top: 0;
          }
          .terms-hero {
            padding: 130px 6% 60px;
          }
          .terms-content-section {
            padding: 50px 6%;
          }
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

        <div className="mobile-header-actions">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <Image src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" width={135} height={45} style={{ height: "45px", width: "auto" }} />
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
              <BookNowButton href="/guesthouse#rooms-suites" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "block", textAlign: "center", marginTop: "4px" }} />
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="terms-hero">
          <div className="breadcrumb">
            <Link href="/"><Home size={13} /> Home</Link>
            <ChevronRight size={12} />
            <span>Terms of Service</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Agreement and conditions of stay at Braj Nidhi.
          </motion.p>
        </section>

        <section className="terms-content-section">
          <div className="terms-grid">
            <motion.div
              className="terms-sidebar"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="sidebar-title">Key Conditions</h3>
              <div className="sidebar-badge">
                <div className="sidebar-badge-icon">
                  <Scale size={22} />
                </div>
                <div className="sidebar-badge-text">
                  <h5>Lawful Conduct</h5>
                  <p>Comply with all guest rules & local regulations</p>
                </div>
              </div>
              <div className="sidebar-badge">
                <div className="sidebar-badge-icon">
                  <FileText size={22} />
                </div>
                <div className="sidebar-badge-text">
                  <h5>Flexible Tariffs</h5>
                  <p>tariff adjustments without notice</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="terms-main"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              <div className="policy-statement-card">
                <div className="policy-statement-title">
                  <Scale size={14} />
                  <span>Terms & Conditions Statement</span>
                </div>
                <p className="policy-statement-text">
                  By accessing or using the Braj Nidhi website and services, guests agree to comply with all applicable rules, policies, and lawful conduct. All bookings are subject to availability and confirmation. Braj Nidhi reserves the right to modify room tariffs, services, policies, or website content without prior notice. Any misuse of property, inappropriate behavior, or violation of guest policies may result in cancellation of stay without refund.
                </p>
              </div>

              <div className="details-card">
                <h2>Stay Guidelines</h2>
                <p>
                  To ensure a peaceful and spiritually aligned sanctuary for all of our guests, we enforce standard terms of stay:
                </p>
                <div className="points-list">
                  <div className="point-item">
                    <div className="point-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="point-content">
                      <h4>Website & Service Use</h4>
                      <p>Guests agree to access the site and place reservations under complete compliance with our guest rules, digital terms, and local laws.</p>
                    </div>
                  </div>

                  <div className="point-item">
                    <div className="point-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="point-content">
                      <h4>Reservations & Confirmations</h4>
                      <p>All bookings placed online or offline are subject to room availability, confirmation by our reception team, and verified payment authorization.</p>
                    </div>
                  </div>

                  <div className="point-item">
                    <div className="point-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="point-content">
                      <h4>Property Safeguards & Conduct</h4>
                      <p>Any misuse of rooms/venues, inappropriate behavioral conduct, or violation of strict guest policies (such as vegetarian protocols) will lead to instant checkout cancellation without refunds.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
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
          <div className="footer-col">
            <h3>Stay & Book</h3>
            <Link href="/booking">Book Your Stay</Link>
            <Link href="/weddings">Wedding Packages</Link>
            <Link href="/corporate">Corporate Stays</Link>
            <a href="#">Refund Policy</a>
          </div>
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
