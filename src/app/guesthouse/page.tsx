
"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingWidgets from '@/components/FloatingWidgets';
import BookNowButton from '@/components/BookNowButton';
import RoomBookingModal from '@/components/RoomBookingModal';
import { useLivePrices } from '@/hooks/useLivePrices';

// Self-contained Room Card Slideshow to isolate slide re-renders
const RoomCardSlideshow = ({ images, alt, interval = 4000 }: { images: string[]; alt: string; interval?: number }) => {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <>
      {images.map((img, i) => {
        const isActive = imgIndex === i;
        const isPrev = (imgIndex - 1 + images.length) % images.length === i;
        return (
          <motion.img
            key={img}
            src={img}
            alt={alt}
            className="room-bg-img"
            initial={false}
            animate={{ 
              opacity: isActive ? 1 : (isPrev ? 1 : 0),
              scale: isActive ? 1.07 : 1.0,
              zIndex: isActive ? 2 : (isPrev ? 1 : 0)
            }}
            transition={{
              opacity: { duration: 1.4, ease: 'easeInOut' },
              scale: { duration: 8, ease: 'linear' }
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: isActive ? 'auto' : 'none' }}
          />
        );
      })}
    </>
  );
};

export default function Guesthouse() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Room booking modal
  const [roomModal, setRoomModal] = useState<{ open: boolean; roomType: 'deluxe2'|'deluxe3'|'deluxe4'; roomName: string; price: number }>({
    open: false, roomType: 'deluxe2', roomName: '', price: 0
  });
  // Nightly rates from the ERP (today's rate here, since this page has no date
  // picker). Room cards read these instead of hardcoded numbers.
  const { prices: livePrices } = useLivePrices(undefined, undefined, { pollMs: 60_000 });

  /** Price is taken from livePrices by type, so callers can't pass a stale figure. */
  const openRoomModal = (roomType: 'deluxe2'|'deluxe3'|'deluxe4', roomName: string) => {
    setRoomModal({ open: true, roomType, roomName, price: livePrices[roomType] });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Slideshow image arrays
  const deluxe2Images = ["d1.webp", "d2.webp", "d3.webp", "d4.webp"];
  const deluxe3Images = ["t1.webp", "t2.webp", "t3.webp", "t4.webp"];
  const deluxe4Images = ["f1.webp", "f2.webp", "f3.webp"];
  const [showSuiteCards, setShowSuiteCards] = useState(false);

  // Hero section image slider
  const heroImages = ["/z.webp", "/DSC05963-HDR.webp", "/d3.webp"];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroIndex, heroImages.length]);

  const handleNextHero = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  };

  const handlePrevHero = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for the sticky header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Promo Section 1 image slider
  const promoImages = [
    "/radha-raman-temple.webp",
    "/download%20(1).webp",
    "/keshi%20ghat.webp",
    "/nidhivan.webp",
    "/Radha%20Vallabh%20Dwar.webp",
    "/raman-reti.webp",
    "/neem-karoli-baba.webp",
    "/banke-bihari-mandir.webp"
  ];
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promoImages.length]);

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

  return (
    <div className="guesthouse-page">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cause:wght@100..900&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Override global index-page header style for guesthouse to be black initially */
        .index-page .guesthouse-page header:not(.scrolled) .logo,
        .index-page .guesthouse-page header:not(.scrolled) .logo span,
        .index-page .guesthouse-page header:not(.scrolled) nav ul li a,
        .index-page .guesthouse-page header:not(.scrolled) .user-name {
            color: #1a1a1a !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .btn-login {
            color: #1a1a1a !important;
            border-color: #1a1a1a !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .btn-login:hover {
            background: rgba(0, 0, 0, 0.05) !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .btn-book {
            border-color: #1a1a1a !important;
            color: #fff !important;
            background: #1a1a1a !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .btn-book:hover {
            background: #333333 !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .user-label {
            color: rgba(26, 26, 26, 0.6) !important;
        }
        .index-page .guesthouse-page header:not(.scrolled) .user-profile-badge {
            border-color: rgba(26, 26, 26, 0.4) !important;
            color: #1a1a1a !important;
        }

        .guesthouse-hero {
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
            font-family: var(--font-bebas-neue), cursive;
            font-size: 3rem;
            font-weight: 700;
            color: #1a1a1a;
            background-color: #ffffff;
            display: inline-block;
            align-self: center;
            padding: 14px 34px;
            text-transform: uppercase;
            text-align: center;
            line-height: 1;
            margin-bottom: -25px;
            position: relative;
            z-index: 2;
            letter-spacing: 0.18em;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }

        .hero-main-img-wrap {
            position: relative;
            width: 100%;
            height: 520px;
            max-height: 560px;
            z-index: 1;
            overflow: hidden;
        }

        .hero-main-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .hero-orange-banner {
            position: absolute;
            bottom: 0;
            left: 0;
            background: #e95d35;
            color: #fff;
            padding: 15px 30px;
            font-weight: bold;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.1rem;
            letter-spacing: 1px;
            z-index: 6;
        }

        .hero-slider-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            color: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .hero-slider-arrow:hover {
            background: #ffffff;
            color: #e95d35;
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 8px 25px rgba(233, 93, 53, 0.3);
        }

        .hero-slider-arrow:active {
            transform: translateY(-50%) scale(0.95);
        }

        .hero-slider-arrow.left {
            left: 20px;
        }

        .hero-slider-arrow.right {
            right: 20px;
        }

        .hero-slider-dots {
            position: absolute;
            bottom: 20px;
            right: 30px;
            display: flex;
            gap: 8px;
            z-index: 10;
        }

        .hero-slider-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .hero-slider-dot.active {
            background: #ffffff;
            width: 24px;
            border-radius: 4px;
        }

        .hero-bento-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
        }

        .bento-box {
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .bento-green {
            background: #9fe173;
            color: #1a1a1a;
            position: relative;
            overflow: hidden;
        }
        
        .bento-green h3 {
            font-size: 1.8rem;
            font-weight: 900;
            line-height: 1.2;
            text-transform: uppercase;
            margin: 0;
            font-family: 'Arial Black', sans-serif;
        }
        
        .bento-green svg {
            position: absolute;
            bottom: -10px;
            right: 0;
            width: 100%;
            height: 800px;
            opacity: 0.5;
        }

        .bento-pink {
            background: #edd2cc;
            color: #1a1a1a;
            cursor: pointer;
        }

        .bento-pink:focus {
            outline: 2px solid #3b1d6b;
            outline-offset: 4px;
        }

        .suite-toggle-note {
            margin-top: 12px;
            font-size: 0.9rem;
            opacity: 0.88;
            color: #3b1d6b;
            font-weight: 700;
        }

        .bento-beige {
            background: #e8dac4;
            color: #1a1a1a;
        }

        .bento-icon {
            font-size: 2rem;
            margin-bottom: 20px;
        }

        .bento-box h4 {
            font-size: 1rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 15px;
            font-family: 'Arial Black', sans-serif;
        }

        .bento-box p {
            font-size: 0.95rem;
            line-height: 1.5;
            margin: 0;
        }

        .bento-yellow {
            background: #fbc434;
            color: #1a1a1a;
            position: relative;
            z-index: 3;
            margin-top: -120px;
            padding-top: 80px;
        }

        .bento-yellow h3 {
            font-size: 1.8rem;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 15px;
            font-family: 'Arial Black', sans-serif;
            line-height: 1.1;
        }

        .bento-yellow p {
            margin-bottom: 30px;
        }

        .featured-rooms-section {
            background: #ffffff;
            padding: 70px 0 60px;
        }

        .featured-rooms-inner {
            width: 100%;
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .featured-rooms-header {
            text-align: center;
            margin-bottom: 35px;
        }

        .featured-rooms-header h2 {
            font-size: 2.8rem;
            font-weight: 900;
            letter-spacing: 2px;
            margin-bottom: 16px;
            text-transform: uppercase;
            color: #3b1d6b;
        }

        .featured-rooms-header p {
            max-width: 760px;
            margin: 0 auto 18px;
            color: #393939;
            font-size: 1rem;
            line-height: 1.8;
            opacity: 0.92;
        }

        .featured-rooms-header a {
            color: #3b1d6b;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .featured-rooms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 18px;
            justify-content: center;
        }

        .featured-room-card {
            max-width: 300px;
            border-radius: 24px;
            overflow: hidden;
            background: #f7f4ee;
            box-shadow: 0 18px 40px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            text-decoration: none;
            color: inherit;
            margin: 0 auto;
        }

        .featured-room-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 28px 55px rgba(0,0,0,0.12);
        }

        .featured-room-img-wrap {
            width: 100%;
            aspect-ratio: 4 / 3;
            overflow: hidden;
            background: #e6e2d8;
        }

        .featured-room-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.35s ease;
        }

        .featured-room-card:hover .featured-room-img-wrap img {
            transform: scale(1.05);
        }

        .featured-room-title {
            padding: 18px 16px 22px;
            font-size: 1rem;
            font-weight: 700;
            font-family: 'Cause', sans-serif;
            text-align: center;
            color: #1a1a1a;
            line-height: 1.3;
            background: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .suite-preview-section {
            margin-top: 28px;
            padding: 30px 0 0;
            border-top: 1px solid rgba(0,0,0,0.06);
        }

        .suite-preview-header {
            text-align: center;
            margin-bottom: 22px;
        }

        .suite-preview-header h3 {
            font-size: 1.9rem;
            font-weight: 900;
            margin-bottom: 10px;
            color: #3b1d6b;
        }

        .suite-preview-header p {
            color: #4f4f4f;
            opacity: 0.92;
            margin: 0 auto;
            max-width: 720px;
            line-height: 1.7;
        }

        .suite-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 18px;
            justify-content: center;
        }

        .suite-card .featured-room-title {
            background: #f4f0e8;
        }

        .featured-room-title span {
            display: block;
            font-weight: 500;
            color: #6d6d6d;
            margin-top: 6px;
            font-size: 0.92rem;
        }

        .bento-btn {
            display: inline-block;
            border: 2px solid #1a1a1a;
            color: #1a1a1a;
            text-transform: uppercase;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 12px 20px;
            text-decoration: none;
            transition: all 0.3s;
            width: fit-content;
        }
        
        .bento-btn:hover {
            background: #1a1a1a;
            color: #fbc434;
        }

        @media (max-width: 1024px) {
            .hero-bento-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .bento-yellow {
                margin-top: 0;
                grid-column: span 2;
            }
            .hero-title-large {
                font-size: 8vw;
                margin-bottom: -4vw;
            }
        }

        @media (max-width: 600px) {
            .guesthouse-hero {
                padding: 90px 0 30px 0;
            }
            .hero-bento-container {
                padding: 0 12px;
            }
            .bento-box {
                padding: 25px 20px;
            }
            .hero-bento-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            .bento-yellow {
                grid-column: span 1;
            }
            .hero-title-large {
                font-size: 7.5vw;
                margin-bottom: -15px;
                padding: 10px 20px;
                line-height: 1.1;
                z-index: 2;
                position: relative;
            }
            .hero-main-img-wrap {
                min-height: 320px;
                border-radius: 16px;
            }
            .hero-slider-arrow {
                display: none;
            }
            .hero-slider-dots {
                display: none;
            }
            .hero-orange-banner {
                width: 100%;
                justify-content: center;
                padding: 15px;
                font-size: 1rem;
            }
        }

        .amenities-section {
            padding: 40px 5%;
            background: #fafafa;
        }

        .amenities-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            background: transparent;
            margin-top: 10px;
            border: none;
        }

        .amenity-item {
            text-align: left;
            padding: 30px 25px;
            background: #fdfaf7;
            border: 1px solid rgba(59, 18, 18, 0.08);
            border-radius: 16px;
            transition: all 0.4s ease;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .amenity-item:hover {
            background: #3b1212;
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(59, 18, 18, 0.2);
        }

        .amenity-icon {
            font-size: 2rem;
            color: #3b1212;
            margin-bottom: 15px;
            transition: 0.4s ease;
        }

        .amenity-title {
            font-size: 1.1rem;
            font-weight: 800;
            color: #3b1212;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: 'Arial Black', sans-serif;
            transition: 0.4s ease;
        }

        .amenity-item p {
            color: #666666;
            font-size: 0.95rem;
            line-height: 1.6;
            transition: 0.4s ease;
            margin: 0;
        }

        .amenity-item:hover .amenity-icon,
        .amenity-item:hover .amenity-title { color: #d4af37; }
        .amenity-item:hover p {
            color: #ffffff;
        }



        /* --- New Promotional Sections --- */
        .promo-section-1 {
            background: #faf8f5;
            padding: 100px 5%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5%;
            flex-wrap: wrap;
        }
        .promo-col-left {
            flex: 1;
            min-width: 300px;
        }
        .promo-col-left p.lead-text {
            font-size: 1.4rem;
            font-weight: 800;
            line-height: 1.5;
            color: #1a1a1a;
            margin-bottom: 40px;
        }
        .promo-links {
            display: flex;
            gap: 30px;
            margin-bottom: 60px;
        }
        .promo-link {
            font-size: 0.85rem;
            font-weight: 800;
            color: #1a1a1a;
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 5px;
            letter-spacing: 1px;
        }
        .promo-tour-card {
            border: 2px solid #1a1a1a;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            max-width: 350px;
            background: #fff;
        }
        .promo-tour-img {
            width: 80px;
            height: 800px;
            object-fit: cover;
        }
        .promo-tour-text {
            font-size: 1.1rem;
            font-weight: 800;
            text-transform: uppercase;
            line-height: 1.2;
            color: #1a1a1a;
        }
        .promo-col-center {
            flex: 1;
            min-width: 300px;
            position: relative;
            aspect-ratio: 4 / 5;
            max-height: 600px;
            overflow: hidden;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(0,0,0,0.15);
            background: #faf8f5;
        }
        .promo-slider-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .promo-col-right {
            flex: 1;
            min-width: 300px;
        }
        .promo-col-right h2 {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1.1;
            color: #1a1a1a;
            text-transform: uppercase;
            margin-bottom: 30px;
            font-family: 'Arial Black', sans-serif;
        }
        .promo-col-right .sub-title {
            font-size: 0.9rem;
            font-weight: 800;
            color: #e95d35;
            text-transform: uppercase;
            margin-left: 10px;
            display: inline-block;
            transform: translateY(-15px);
        }
        .promo-col-right p {
            font-size: 1.1rem;
            color: #444;
            line-height: 1.8;
            margin-bottom: 40px;
            font-weight: 500;
        }
        .btn-text-arrow {
            font-size: 0.9rem;
            font-weight: 800;
            color: #1a1a1a;
            text-transform: uppercase;
            text-decoration: none;
            letter-spacing: 1px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        
        .promo-section-2 {
            background: #faf8f5;
            padding: 60px 5%;
            display: flex;
            align-items: center;
            gap: 60px;
            flex-wrap: wrap;
        }
        .promo2-col-left {
            flex: 1;
            min-width: 300px;
        }
        .promo2-col-left .sub-title {
            font-size: 1rem;
            font-weight: 800;
            color: #e95d35;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .promo2-col-left h2 {
            font-size: 3rem;
            font-weight: 900;
            line-height: 1.1;
            color: #1a1a1a;
            text-transform: uppercase;
            margin-bottom: 30px;
            font-family: 'Arial Black', sans-serif;
        }
        .promo2-col-left p {
            font-size: 1.1rem;
            color: #1a1a1a;
            line-height: 1.8;
            margin-bottom: 40px;
            font-weight: 600;
        }
        .promo2-col-left .btn-outline {
            border: 2px solid #1a1a1a;
            padding: 15px 30px;
            font-size: 0.9rem;
            font-weight: 800;
            color: #1a1a1a;
            text-transform: uppercase;
            text-decoration: none;
            letter-spacing: 1px;
            display: inline-block;
            transition: all 0.3s;
        }
        .promo2-col-left .btn-outline:hover {
            background: #1a1a1a;
            color: #fff;
        }
        .promo2-col-right {
            flex: 1;
            min-width: 300px;
            position: relative;
        }
        .promo2-col-right > img {
            width: 100%;
            height: 420px;
            object-fit: cover;
            display: block;
            border-radius: 12px;
        }
        .promo2-price-badge {
            position: absolute;
            bottom: -30px;
            left: -30px;
            background: #fff;
            border: 2px solid #1a1a1a;
            padding: 30px;
            width: 280px;
            z-index: 2;
        }
        .promo2-price-badge .price-top {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
        }
        .promo2-price-badge .price-num {
            font-size: 3.5rem;
            font-weight: 900;
            color: #1a1a1a;
            line-height: 1;
            font-family: 'Arial Black', sans-serif;
        }
        .promo2-price-badge .price-text {
            font-size: 0.85rem;
            font-weight: 800;
            color: #1a1a1a;
            text-transform: uppercase;
            line-height: 1.2;
        }
        .promo2-price-badge .price-bottom {
            font-size: 0.9rem;
            font-weight: 800;
            color: #1a1a1a;
            text-transform: uppercase;
            line-height: 1.4;
        }
        @media (max-width: 900px) {
            .promo-section-1, .promo-section-2 {
                flex-direction: column;
                gap: 30px;
            }
            .promo-col-center {
                width: 100%;
                height: 350px;
                aspect-ratio: auto;
            }
            .promo2-price-badge {
                bottom: 10px;
                left: 10px;
            }
        }

        /* Amenities Banner moved to banner.css */


        /* New Listing Layout Styles */
        .listing-container {
            max-width: 1380px;
            margin: 0 auto;
            padding: 20px 20px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 0;
        }

        /* Sidebar Filters — Refined Luxury Design */
        .filter-sidebar {
            background: linear-gradient(160deg, #fdf8f0 0%, #faf3e8 100%);
            padding: 28px 24px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(59, 18, 18, 0.1), 0 2px 8px rgba(59, 18, 18, 0.06);
            height: fit-content;
            border: 1px solid rgba(212, 175, 55, 0.25);
            position: sticky;
            top: 90px;
            color: #3b1212;
        }

        .filter-sidebar::before {
            content: '';
            display: block;
            height: 800px;
            background: linear-gradient(90deg, #3b1212, #d4af37, #3b1212);
            border-radius: 3px 3px 0 0;
            margin: -28px -24px 24px -24px;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
        }

        .filter-sidebar h3 {
            font-size: 1.45rem;
            color: #3b1212;
            margin: 0 0 22px 0;
            font-weight: 700;
            font-family: Georgia, serif;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .filter-sidebar h3::after {
            content: '';
            flex: 1;
            height: 800px;
            background: linear-gradient(90deg, rgba(212,175,55,0.5), transparent);
        }

        .filter-group {
            margin-bottom: 18px;
        }

        .filter-group label {
            display: block;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #8b6914;
            margin-bottom: 7px;
            font-weight: 700;
            font-family: sans-serif;
        }

        .filter-input-wrap {
            position: relative;
            background: #ffffff;
            border: 1.5px solid rgba(59, 18, 18, 0.12);
            border-radius: 10px;
            padding: 11px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.25s ease;
        }
        
        .filter-input-wrap:hover {
            border-color: rgba(212, 175, 55, 0.5);
            box-shadow: 0 2px 8px rgba(59, 18, 18, 0.06);
        }

        .filter-input-wrap:focus-within {
            border-color: #d4af37;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
        }

        .filter-input-wrap input,
        .filter-input-wrap select {
            border: none;
            background: transparent;
            font-size: 0.9rem;
            color: #3b1212;
            width: 100%;
            outline: none;
            font-family: sans-serif;
            appearance: none;
            -webkit-appearance: none;
            padding-right: 30px;
            font-weight: 500;
        }

        .filter-input-wrap input::placeholder {
            color: rgba(59, 18, 18, 0.35);
            font-weight: 400;
        }
        
        .filter-input-wrap i {
            color: #d4af37;
            font-size: 0.95rem;
            pointer-events: none;
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
        }

        .filter-input-wrap input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }

        /* Divider between sections */
        .filter-divider {
            height: 800px;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
            margin: 16px 0;
        }

        /* Date input — show native picker */
        .filter-input-wrap input[type="date"] {
            color-scheme: light;
            cursor: pointer;
        }

        /* Guest counter stepper */
        .guest-counter-wrap {
            background: transparent;
            padding: 4px 0;
        }

        .guest-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: #ffffff;
            border: 1.5px solid rgba(59, 18, 18, 0.12);
            border-radius: 10px;
            margin-bottom: 10px;
            transition: border-color 0.2s;
        }

        .guest-row:last-child {
            margin-bottom: 0;
        }

        .guest-row:hover {
            border-color: rgba(212, 175, 55, 0.5);
        }

        .guest-row-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #3b1212;
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        .guest-row-label small {
            font-size: 0.7rem;
            font-weight: 400;
            color: rgba(59,18,18,0.5);
        }

        .guest-stepper {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .guest-btn {
            width: 28px;
            height: 800px;
            border-radius: 50%;
            border: 1.5px solid #3b1212;
            background: transparent;
            color: #3b1212;
            font-size: 1.1rem;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            font-weight: 700;
            padding: 0;
        }

        .guest-btn:hover {
            background: #3b1212;
            color: #d4af37;
        }

        .guest-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .guest-btn:disabled:hover {
            background: transparent;
            color: #3b1212;
        }

        .guest-count {
            font-size: 1rem;
            font-weight: 700;
            color: #3b1212;
            min-width: 18px;
            text-align: center;
        }

        /* Custom Checkbox Styling */
        .checkbox-group {
            margin-top: 4px;
            margin-bottom: 16px;
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            color: #4a1a1a;
            font-size: 0.85rem;
            text-transform: none;
            letter-spacing: 0;
            font-weight: 400;
            transition: color 0.2s;
        }

        .checkbox-group label:hover {
            color: #3b1212;
        }

        .checkbox-group input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            width: 17px;
            height: 800px;
            background: #ffffff;
            border: 1.5px solid rgba(59, 18, 18, 0.2);
            border-radius: 4px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .checkbox-group input[type="checkbox"]:checked {
            background: #3b1212;
            border-color: #3b1212;
        }

        .checkbox-group input[type="checkbox"]:checked::after {
            content: '✔';
            position: absolute;
            color: #d4af37;
            font-size: 10px;
            font-weight: bold;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .btn-apply {
            width: 100%;
            padding: 13px;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #3b1212 0%, #5a1a1a 100%);
            color: #d4af37;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 15px rgba(59, 18, 18, 0.25);
            position: relative;
            overflow: hidden;
        }

        .btn-apply::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #5a1a1a, #8b2a2a);
            transition: left 0.3s ease;
            z-index: 0;
        }

        .btn-apply:hover::before {
            left: 0;
        }

        .btn-apply:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(59, 18, 18, 0.35);
            color: #f0cc5a;
        }

        .btn-apply span {
            position: relative;
            z-index: 1;
        }


        /* Main Content area */


        .property-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 28px;
            width: 100%;
        }

        @media (max-width: 900px) {
            .listing-container {
                grid-template-columns: 1fr;
            }
        }

        .room-card {
            position: relative;
            height: 700px;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.22);
            transition: transform 0.45s ease, box-shadow 0.45s ease;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.04);
        }

        .room-card:hover {
            transform: translateY(-12px);
            box-shadow: 0 28px 60px rgba(0,0,0,0.28);
        }

        .room-bg-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
            transition: transform 0.8s ease;
            image-rendering: auto;
            filter: none;
            backface-visibility: hidden;
            -webkit-transform: translateZ(0);
        }

        .room-card:hover .room-bg-img {
            transform: scale(1.03);
        }

        .card-gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.03) 100%);
            z-index: 1;
        }

        .room-content {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 44px;
            z-index: 2;
            color: #fff;
            background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%);
        }

        .room-content h3 {
            font-size: 2.35rem;
            font-weight: 800;
            margin-bottom: 14px;
            font-family: 'Cause', sans-serif;
            letter-spacing: 0.18em;
            color: #f7e5b8;
            line-height: 1.05;
            text-transform: uppercase;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
        }

        .room-location {
            font-size: 0.95rem;
            opacity: 0.88;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: rgba(255,255,255,0.85);
        }

        .room-amenities {
            display: flex;
            gap: 14px;
            margin-bottom: 32px;
            flex-wrap: wrap;
        }

        .room-amenities span {
            font-size: 0.92rem;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #fff;
            background: rgba(255,255,255,0.12);
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.22);
            backdrop-filter: blur(8px);
        }

        .btn-availability {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            padding: 16px 34px;
            color: #fff;
            background: rgba(255,255,255,0.16);
            backdrop-filter: blur(18px);
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 999px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.16em;
            font-size: 0.95rem;
            box-shadow: 0 10px 35px rgba(0,0,0,0.18);
            transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
            text-decoration: none;
        }

        .btn-availability:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,0.22);
            box-shadow: 0 14px 45px rgba(0,0,0,0.24);
        }

        .favorite-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            width: 45px;
            height: 800px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.3);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3;
            cursor: pointer;
            transition: all 0.3s;
        }

        .favorite-btn:hover {
            background: #fff;
            color: #2d0a0a;
        }
    ` }} />
      
    {/* SVG Definitions (Copied from index.html) */}
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
            <BookNowButton href="#rooms-suites" />
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

    {/* Mobile Menu Drawer */}
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
            <BookNowButton href="#rooms-suites" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', textAlign: 'center', marginTop: '4px' }} />
          </div>
        </div>
      </div>
    )}

    <main>
        <section className="guesthouse-hero">
            <div className="hero-bento-container">
                <div className="hero-title-large">Luxury Guestrooms & Divine Suites</div>
                
                <div className="hero-main-img-wrap">
                    {heroImages.map((img, i) => {
                        const isActive = heroIndex === i;
                        const isPrev = (heroIndex - 1 + heroImages.length) % heroImages.length === i;
                        return (
                            <motion.img
                                key={img}
                                src={img}
                                alt="Luxury Resort View"
                                initial={false}
                                animate={{ 
                                    opacity: isActive ? 1 : (isPrev ? 1 : 0),
                                    scale: isActive ? 1 : 1.02,
                                    zIndex: isActive ? 2 : (isPrev ? 1 : 0)
                                }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    pointerEvents: isActive ? 'auto' : 'none'
                                }}
                            />
                        );
                    })}

                    {/* Circular Navigation Arrows */}
                    <button
                        type="button"
                        className="hero-slider-arrow left"
                        onClick={handlePrevHero}
                        aria-label="Previous Slide"
                        style={{ border: 'none' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        type="button"
                        className="hero-slider-arrow right"
                        onClick={handleNextHero}
                        aria-label="Next Slide"
                        style={{ border: 'none' }}
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Active Slide Indicators / Dots */}
                    <div className="hero-slider-dots">
                        {heroImages.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`hero-slider-dot${heroIndex === i ? ' active' : ''}`}
                                onClick={() => setHeroIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                style={{ border: 'none', padding: 0 }}
                            />
                        ))}
                    </div>

                    <div className="hero-orange-banner">
                        FIND ROOMS FOR A STAY <i className="fas fa-binoculars"></i>
                    </div>
                </div>

                <div className="hero-bento-grid">
                    <div className="bento-box bento-green">
                        <h3>VRINDAVAN.<br />SPIRITUAL.<br />LUXURY.</h3>
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,15 Q20,0 50,15 T100,15 M0,20 Q20,5 50,20 T100,20 M0,25 Q20,10 50,25 T100,25" fill="none" stroke="#6aa147" strokeWidth="2"/>
                        </svg>
                    </div>

                    <div
                        className="bento-box bento-pink"
                        onClick={() => setShowSuiteCards(!showSuiteCards)}
                        role="button"
                        tabIndex={0}
                    >
                        <i className="far fa-heart bento-icon"></i>
                        <h4>YOUR DIVINE CELEBRATION</h4>
                        <p>We love orchestrating your spiritual and wedding events</p>
                        <p className="suite-toggle-note">Click here to reveal Deluxe Suite cards.</p>
                    </div>

                    <div className="bento-box bento-beige">
                        <i className="fas fa-spa bento-icon"></i>
                        <h4>CULTURAL & DEVOTIONAL ACTIVITIES</h4>
                        <p>Rejuvenate your senses with traditional holistic therapies</p>
                    </div>

                    <div className="bento-box bento-yellow">
                        <h3>VRINDAVAN TEMPLE GUIDE</h3>
                        <p>Plan your Darshan with our exclusive guide to Vrindavan's divine sites.</p>
                        <a href="#" className="bento-btn">VIEW TEMPLE GUIDE <i className="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        </section>

        <section id="rooms-suites" className="featured-rooms-section">
            <div className="featured-rooms-inner">
                <div className="featured-rooms-header">
                    <h2>ROOMS AND SUITES</h2>
                    <p>Braj Nidhi offers elegant rooms and suites designed for calm, mindful stays in Vrindavan. Each space is thoughtfully planned with modern comforts and a peaceful spiritual ambience.</p>
                </div>
                <div className="featured-rooms-grid">
                    <a 
                        href="#deluxe2-detail" 
                        className="featured-room-card"
                        onClick={(e) => scrollToSection('deluxe2-detail', e)}
                    >
                        <div className="featured-room-img-wrap">
                            <img loading="lazy" decoding="async" src="d1.webp" alt="Deluxe 2 – Twin Bedded Room" />
                        </div>
                        <div className="featured-room-title">Deluxe 2 – Twin Bedded Room</div>
                    </a>
                    <a 
                        href="#deluxe3-detail" 
                        className="featured-room-card"
                        onClick={(e) => scrollToSection('deluxe3-detail', e)}
                    >
                        <div className="featured-room-img-wrap">
                            <img loading="lazy" decoding="async" src="t1.webp" alt="Deluxe 3 – 3 Bedded Room" />
                        </div>
                        <div className="featured-room-title">Deluxe 3 – 3 Bedded Room</div>
                    </a>
                    <a 
                        href="#deluxe4-detail" 
                        className="featured-room-card"
                        onClick={(e) => scrollToSection('deluxe4-detail', e)}
                    >
                        <div className="featured-room-img-wrap">
                            <img loading="lazy" decoding="async" src="f1.webp" alt="Deluxe 4 – 4 Bedded Room" />
                        </div>
                        <div className="featured-room-title">Deluxe 4 – 4 Bedded Room</div>
                    </a>
                </div>
                {showSuiteCards && (
                    <div className="suite-preview-section">
                        <div className="suite-preview-header">
                            <h3>Deluxe Suite Picks</h3>
                            <p>Discover premium suite options curated for a luxurious Vrindavan stay.</p>
                        </div>
                        <div className="suite-cards-grid">
                            <a 
                                href="#deluxe4-detail" 
                                className="featured-room-card suite-card"
                                onClick={(e) => scrollToSection('deluxe4-detail', e)}
                            >
                                <div className="featured-room-img-wrap">
                                    <img loading="lazy" decoding="async" src="DSC05963-HDR.webp" alt="Deluxe Suite" />
                                </div>
                                <div className="featured-room-title">Deluxe Suite</div>
                            </a>
                            <a 
                                href="#deluxe4-detail" 
                                className="featured-room-card suite-card"
                                onClick={(e) => scrollToSection('deluxe4-detail', e)}
                            >
                                <div className="featured-room-img-wrap">
                                    <img loading="lazy" decoding="async" src="d31.webp" alt="Heritage Suite" />
                                </div>
                                <div className="featured-room-title">Heritage Suite</div>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* Room Types Section (New Sidebar Layout) */}
        <section className="room-types-section" style={{"background":"#fdfbf7"}}>
            <div className="listing-container">
                {/* Main Listing */}
                <div className="listing-main">
                    <div className="property-list">
                        {/* Card 1 */}
                        <div id="deluxe2-detail" className="room-card new-style">
                            <RoomCardSlideshow images={deluxe2Images} alt="Deluxe 2" interval={4000} />
                            <div className="card-gradient"></div>
                            <div className="room-content">
                                <h3>Deluxe 2 – Twin Bedded Room</h3>
                                <p className="room-location" style={{color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginBottom: "15px"}}>Ideal for 2 Adults</p>
                                <div className="room-amenities">
                                    <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                                    <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                                    <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                                </div>
                                <button className="btn-availability" style={{ border: "none", cursor: "pointer", width: "100%" }} onClick={() => openRoomModal('deluxe2', 'Deluxe 2 – Twin Bedded Room')}>Book for ₹{livePrices.deluxe2.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div id="deluxe3-detail" className="room-card new-style">
                            <RoomCardSlideshow images={deluxe3Images} alt="Deluxe 3" interval={4500} />
                            <div className="card-gradient"></div>
                            <div className="room-content">
                                <h3>Deluxe 3 – 3 Bedded Room</h3>
                                <p className="room-location" style={{color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginBottom: "15px"}}>Ideal for 2 Adults + 1 Child OR 3 Adults</p>
                                <div className="room-amenities">
                                    <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                                    <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                                    <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                                    <span><i className="fas fa-place-of-worship"></i> Temple Access</span>
                                </div>
                                <button className="btn-availability" style={{ border: "none", cursor: "pointer", width: "100%" }} onClick={() => openRoomModal('deluxe3', 'Deluxe 3 – 3 Bedded Room')}>Book for ₹{livePrices.deluxe3.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div id="deluxe4-detail" className="room-card new-style">
                            <RoomCardSlideshow images={deluxe4Images} alt="Deluxe 4" interval={5000} />
                            <div className="card-gradient"></div>
                            <div className="room-content">
                                <h3>Deluxe 4 – 4 Bedded Room</h3>
                                <p className="room-location" style={{color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginBottom: "15px"}}>Ideal for 3 Adults + 1 Child OR 4 Adults</p>
                                <div className="room-amenities">
                                    <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                                    <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                                    <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                                    <span><i className="fas fa-place-of-worship"></i> Temple Access</span>
                                    <span><i className="fas fa-tree"></i> Vrindavan Chandrodaya Mandir Park Access</span>
                                </div>
                                <button className="btn-availability" style={{ border: "none", cursor: "pointer", width: "100%" }} onClick={() => openRoomModal('deluxe4', 'Deluxe 4 – 4 Bedded Room')}>Book for ₹{livePrices.deluxe4.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Amenities Section */}
        <section className="amenities-section">
            <div className="section-header">
                <div className="hero-title-large" style={{"marginBottom":"15px","boxShadow":"none","border":"2px solid #3b1212","color":"#3b1212","fontSize":"1.8rem","padding":"12px 35px"}}>PREMIUM AMENITIES</div>
                <p style={{"color":"#3b1212","maxWidth":"600px","margin":"0 auto","fontSize":"1rem","fontWeight":"600","opacity":"0.8"}}>Everything you need for a comfortable and spiritually uplifting stay.</p>
            </div>
            <div className="amenities-grid">
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-wifi"></i></div>
                    <div className="amenity-title">HIGH-SPEED WI-FI</div>
                    <p>Stay connected with seamless high-speed internet access across the entire Braj Nidhi premises.</p>
                </div>
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-leaf"></i></div>
                    <div className="amenity-title">PURE SATTVIC DINING</div>
                    <p>Experience freshly prepared sattvic meals crafted with devotion, purity, and authentic flavors of Braj.</p>
                </div>
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-om"></i></div>
                    <div className="amenity-title">RECREATION & SPIRITUAL EXPERIENCES</div>
                    <p>Experience the essence of Braj with soulful kirtans, a peaceful visit to the gaushala, and a guided visit to Akshaya Patra — the world’s largest kitchen.</p>
                </div>
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-parking"></i></div>
                    <div className="amenity-title">SPACIOUS PARKING FACILITY</div>
                    <p>Convenient and secure parking available for guests, weddings, retreats, and corporate events.</p>
                </div>
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-place-of-worship"></i></div>
                    <div className="amenity-title">DIVINE TEMPLE EXPERIENCE</div>
                    <p>Enjoy easy access to Vrindavan’s sacred temples and immerse yourself in the timeless spiritual energy of Braj.</p>
                </div>
                <div className="amenity-item">
                    <div className="amenity-icon"><i className="fas fa-concierge-bell"></i></div>
                    <div className="amenity-title">PREMIUM HOSPITALITY</div>
                    <p>From comfortable stays to personalized assistance, every experience at Braj Nidhi is designed with warmth and care.</p>
                </div>
            </div>
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

        {/* Promo Section 1 */}
        <section className="promo-section-1">
            <div className="promo-col-left">
                <p className="lead-text">We let ourselves be inspired by the divine heritage as well as by the contemporary comforts of the city.</p>
                <div className="promo-links">
                    <a href="#" className="promo-link">FREE WIFI <i className="fas fa-chevron-right"></i></a>
                    <a href="#" className="promo-link">BREAKFAST <i className="fas fa-chevron-right"></i></a>
                </div>
                <motion.div className="promo-tour-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="promo-tour-text">TEMPLE TOUR GUIDE</div>
                    <motion.i className="fas fa-cube" style={{"fontSize":"1.5rem","marginLeft":"auto","color":"#1a1a1a"}} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
                </motion.div>
            </div>
            
            <div className="promo-col-center">
                {promoImages.map((img, i) => {
                    const isActive = promoIndex === i;
                    const isPrev = (promoIndex - 1 + promoImages.length) % promoImages.length === i;
                    return (
                        <motion.img
                            key={img}
                            src={img}
                            alt="Divine Temple of Vrindavan, Mathura, Nandgaon, Barsana"
                            className="promo-slider-img"
                            initial={false}
                            animate={{ 
                                opacity: isActive ? 1 : (isPrev ? 1 : 0),
                                scale: isActive ? 1 : 1.05,
                                zIndex: isActive ? 2 : (isPrev ? 1 : 0)
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                        />
                    );
                })}
            </div>

            <div className="promo-col-right">
                <h2>SERVICES WE PROVIDE</h2>
                <p>Braj Nidhi offers premium spiritual stays, elegant event spaces, corporate retreat facilities, sattvic dining experiences, and soulful hospitality — thoughtfully curated for pilgrims, families, international travelers, and event guests seeking the true essence of Braj.</p>
                <motion.a href="#" className="btn-text-arrow" whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>EXPLORE SERVICES <i className="fas fa-arrow-right"></i></motion.a>
            </div>
        </section>

        {/* Promo Section 2 */}
        <section className="promo-section-2">
            <div className="promo2-col-left">
                <div className="sub-title">Wake Up to the Peace of Braj</div>
                <h2>Experience soulful stays surrounded by the divine atmosphere of Vrindavan.</h2><p>From elegant rooms to premium heritage suites, every space at Braj Nidhi is designed to offer comfort, tranquility, and timeless hospitality.</p>
                <a href="#" className="btn-outline">SEE ALL ROOMS <i className="fas fa-arrow-right"></i></a>
            </div>
            
            <div className="promo2-col-right">
                <img loading="lazy" decoding="async" src="z.webp" alt="Deluxe Room" />
                <div className="promo2-price-badge">
                    <div className="price-top">
                        <span className="price-num">3.5</span>
                        <span className="price-text">K ₹<br />PER ROOM</span>
                        <motion.i className="fas fa-cube" style={{"fontSize":"1.5rem","marginLeft":"auto","color":"#1a1a1a"}} animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
                    </div>
                    <div className="price-bottom">
                        START FROM 3,500 ₹ PER NIGHT.
                    </div>
                </div>
            </div>
        </section>
    </main>

    {/* Footer */}
    <footer className="site-footer" id="contact">
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
                <a href="/#contact">Contact Us</a>
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


    
    {/* Global Floating Features */}
    <FloatingWidgets />
    
    <RoomBookingModal
      isOpen={roomModal.open}
      onClose={() => setRoomModal(m => ({ ...m, open: false }))}
      roomType={roomModal.roomType}
      roomName={roomModal.roomName}
      price={roomModal.price}
    />

    

    

    
    

    </div>
  );
}


