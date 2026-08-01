"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useLivePrices } from '@/hooks/useLivePrices';

const FloatingWidgets = dynamic(() => import('@/components/FloatingWidgets'), { ssr: false });
const BookNowButton = dynamic(() => import('@/components/BookNowButton'), { ssr: false });
const SectionLinkButton = dynamic(() => import('@/components/SectionLinkButton'), { ssr: false });
const PremiumDoubleCalendar = dynamic(() => import('@/components/PremiumDoubleCalendar'), { ssr: false });
const RoomBookingModal = dynamic(() => import('@/components/RoomBookingModal'), { ssr: false });


// Self-contained Hero Slideshow Component to prevent top-level page re-renders
const imagePositions: Record<string, string> = {
  "m1.webp": "center 30%",
};

const HeroSlideshow = ({ images, mobileImages }: { images: string[]; mobileImages?: string[] }) => {
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeImages = isMobile && mobileImages && mobileImages.length > 0 ? mobileImages : images;

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIndex((prev) => (prev + 1) % activeImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeImages.length]);

  const currentImage = activeImages[heroBgIndex] || activeImages[0];

  return (
    <>
      {activeImages.map((currentImage, i) => {
        const isActive = heroBgIndex === i;
        const isPrev = (heroBgIndex - 1 + activeImages.length) % activeImages.length === i;
        return (
          <motion.div
            key={currentImage}
            className="hero-slider-bg"
            initial={false}
            animate={{ 
              opacity: isActive ? 1 : (isPrev ? 1 : 0),
              scale: isActive ? 1 : 1.05,
              zIndex: isActive ? 2 : (isPrev ? 1 : 0)
            }}
            transition={{ 
              opacity: { duration: 1.8, ease: "easeInOut" },
              scale: { duration: 15, ease: "easeOut" }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: isActive ? 'auto' : 'none'
            }}
          >
            <Image 
              src={`/${currentImage}`}
              alt="Braj Nidhi Hero"
              fill
              priority={i === 0}
              sizes="100vw"
              quality={95}
              style={{
                objectFit: 'cover',
                objectPosition: imagePositions[currentImage] ?? 'center'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(10, 14, 20, 0.45), rgba(10, 14, 20, 0.75))',
              zIndex: 1
            }} />
          </motion.div>
        );
      })}
    </>
  );
};

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
          <motion.div
            key={img}
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
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: isActive ? 'auto' : 'none' }}
          >
            <Image 
              src={`/${img}`}
              alt={alt}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </motion.div>
        );
      })}
    </>
  );
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarInitialSelection, setCalendarInitialSelection] = useState<'in' | 'out'>('in');

  // Room booking modal
  const [roomModal, setRoomModal] = useState<{ open: boolean; roomType: 'deluxe2'|'deluxe3'|'deluxe4'; roomName: string; price: number }>({
    open: false, roomType: 'deluxe2', roomName: '', price: 0
  });
  /**
   * Price comes from livePrices by type so no caller can pass a stale figure.
   * livePrices is declared further down (it depends on bookingData); this body
   * only runs on click, by which time it is initialised.
   */
  const openRoomModal = (roomType: 'deluxe2'|'deluxe3'|'deluxe4', roomName: string) => {
    setRoomModal({ open: true, roomType, roomName, price: livePrices[roomType] });
  };

  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d} ${months[dateObj.getMonth()]} '${dateObj.getFullYear().toString().slice(-2)}`;
    } catch (e) {
      return dateStr;
    }
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Slideshow image arrays
  const deluxe2Images = ["d1.webp", "d2.webp", "d3.webp", "d4.webp"];
  const deluxe3Images = ["t1.webp", "t2.webp", "t3.webp", "t4.webp"];
  const deluxe4Images = ["f1.webp", "f2.webp", "f3.webp"];
  const heroImages = [
    "m1.webp",
    "m2.webp",
    "m3.webp",
    "h11.webp",
    "DSC09672.webp",
    "DSC02591.webp",
    "DSC06003-HDR.webp",
    "DSC05818-HDR.webp",
    "DSC05963-HDR.webp",
    "weekend.webp",
    "m11.webp",
    "m12.webp"
  ];
  const mobileHeroImages = ["m1.webp", "m2.webp", "m3.webp", "m11.webp", "m12.webp"];

  // Removed aggressive preloading to fix enormous network payloads and LCP issue.
  // Next.js <Image> with priority={true} on the first slide handles LCP optimally.

  // Room prices intentionally live only in livePrices (ERP-backed) — a static map
  // here previously shadowed the live rates.

  const roomOccupancy: Record<string, string> = {
    'Deluxe 2 – Twin Bedded Room': '2 guests',
    'Deluxe 3 – 3 Bedded Room': '3 guests',
    'Deluxe 4 – 4 Bedded Room': '4 guests'
  };

  const getGuestCount = (guestsStr: string) => {
    const adults = parseInt(guestsStr.match(/(\d+)\s*Adult/)?.[1] || '0');
    const children = parseInt(guestsStr.match(/(\d+)\s*Child/)?.[1] || '0');
    const total = adults + children;
    return `${total} guest${total > 1 ? 's' : ''}`;
  };

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1 Room, 2 Guests',
    roomCounts: {
      deluxe2: 1,
      deluxe3: 0,
      deluxe4: 0
    },
    pets: false,
    eventType: 'Corporate Offsite'
  });

  // Nightly rates from the ERP. Once the guest picks dates in the hero search
  // widget the lookup follows them, so cards show the rate for that stay.
  const { prices: livePrices } = useLivePrices(
    bookingData.checkIn,
    bookingData.checkOut,
    { pollMs: 60_000 },
  );

  const [tempRoomCounts, setTempRoomCounts] = useState({
    deluxe2: 1,
    deluxe3: 0,
    deluxe4: 0
  });
  const [tempPets, setTempPets] = useState(false);

  useEffect(() => {
    if (openDropdown === 'guests') {
      setTempRoomCounts(bookingData.roomCounts || { deluxe2: 1, deluxe3: 0, deluxe4: 0 });
      setTempPets(bookingData.pets);
    }
  }, [openDropdown]);

  const handleApplyGuests = () => {
    const totalRooms = tempRoomCounts.deluxe2 + tempRoomCounts.deluxe3 + tempRoomCounts.deluxe4;
    const totalGuests = (tempRoomCounts.deluxe2 * 2) + (tempRoomCounts.deluxe3 * 3) + (tempRoomCounts.deluxe4 * 4);
    
    // Ensure at least 1 room is selected if they try to apply 0 rooms
    if (totalRooms === 0) {
      tempRoomCounts.deluxe2 = 1;
    }
    
    const finalRooms = tempRoomCounts.deluxe2 + tempRoomCounts.deluxe3 + tempRoomCounts.deluxe4;
    const finalGuests = (tempRoomCounts.deluxe2 * 2) + (tempRoomCounts.deluxe3 * 3) + (tempRoomCounts.deluxe4 * 4);
    
    const guestsLabel = `${finalRooms} Room${finalRooms > 1 ? 's' : ''}, ${finalGuests} Guest${finalGuests > 1 ? 's' : ''}`;
    
    setBookingData(prev => ({
      ...prev,
      roomCounts: { ...tempRoomCounts },
      pets: tempPets,
      guests: guestsLabel
    }));
    setOpenDropdown(null);
  };

  const handleBookingChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const CustomSelect = ({ label, value, options, field }: { label: string, value: string, options: string[], field: string }) => (
    <div className="custom-select-container">
      <label>{label}</label>
      <div 
        className={"custom-select-trigger " + (openDropdown === field ? "active" : "")} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '4px' }}
        onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '4px', display: 'block', maxWidth: 'calc(100% - 16px)' }}>{value}</span>
        <i className="fas fa-chevron-down" style={{ flexShrink: 0, fontSize: '0.8rem' }}></i>
      </div>
      {openDropdown === field && (
        <div className="custom-options">
          {options.map(opt => (
            <div key={opt} className={"custom-option " + (value === opt ? "selected" : "")} onClick={() => handleBookingChange(field, opt)}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Check-in / check-out are intentionally left empty until the guest picks them.
    // Pre-filling today + 2 made the search button navigate straight through with
    // dates nobody chose, so availability was checked against assumed criteria.

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let gallerySwiper: any;
    let testimonialsSwiper: any;
    let checkInterval: any;
    let resumeAutoplayFn: any;

    const initSwiper = () => {
      if (typeof window !== 'undefined' && (window as any).Swiper) {
        try {
          gallerySwiper = new (window as any).Swiper('.gallery-slider', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            autoplay: { delay: 2000, disableOnInteraction: false },
            coverflowEffect: { rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: true },
            navigation: { nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' },
            observer: true,
            observeParents: true,
          });
          
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
    };

    if (typeof window !== 'undefined') {
      if ((window as any).Swiper) {
        initSwiper();
      } else {
        checkInterval = setInterval(() => {
          if ((window as any).Swiper) {
            clearInterval(checkInterval);
            initSwiper();
          }
        }, 100);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      try {
        const sliderEl = document.querySelector('.testimonials-slider');
        if (sliderEl && resumeAutoplayFn) {
          sliderEl.removeEventListener('touchstart', resumeAutoplayFn);
          sliderEl.removeEventListener('touchend', resumeAutoplayFn);
          sliderEl.removeEventListener('touchcancel', resumeAutoplayFn);
        }
        if (gallerySwiper && typeof gallerySwiper.destroy === 'function') gallerySwiper.destroy(true, false);
        if (testimonialsSwiper && typeof testimonialsSwiper.destroy === 'function') testimonialsSwiper.destroy(true, false);
      } catch (e) {
        console.error("Error destroying Swiper:", e);
      }
    };
  }, []);

  useEffect(() => {
    // Stats observer
    const statsContainer = document.querySelector('.stats-container');
    const counters = document.querySelectorAll('.counter');
    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated && statsContainer) {
                statsContainer.classList.add('animate-up');
                counters.forEach(counter => {
                    const targetAttr = counter.getAttribute('data-target');
                    if (!targetAttr) return;
                    const target = +targetAttr;
                    const isDecimal = counter.getAttribute('data-decimal') === 'true';
                    const updateCount = () => {
                        const count = +((counter as HTMLElement).innerText);
                        const inc = target / 50; 
                        if(count < target) {
                            if (isDecimal) (counter as HTMLElement).innerText = (count + inc).toFixed(1);
                            else (counter as HTMLElement).innerText = Math.ceil(count + inc).toString();
                            setTimeout(updateCount, 30);
                        } else {
                            (counter as HTMLElement).innerText = target.toString();
                        }
                    };
                    updateCount();
                });
                animated = true;
            }
        });
    }, { threshold: 0.3 });
    if (statsContainer) observer.observe(statsContainer);
  }, []);

  const requestReservation = () => {
    let roomsText = [];
    let totalPrice = 0;
    
    // Quoted from the live ERP rates, so the figure matches what the cards show.
    if (bookingData.roomCounts.deluxe2 > 0) {
      roomsText.push(`${bookingData.roomCounts.deluxe2}x Deluxe 2`);
      totalPrice += bookingData.roomCounts.deluxe2 * livePrices.deluxe2;
    }
    if (bookingData.roomCounts.deluxe3 > 0) {
      roomsText.push(`${bookingData.roomCounts.deluxe3}x Deluxe 3`);
      totalPrice += bookingData.roomCounts.deluxe3 * livePrices.deluxe3;
    }
    if (bookingData.roomCounts.deluxe4 > 0) {
      roomsText.push(`${bookingData.roomCounts.deluxe4}x Deluxe 4`);
      totalPrice += bookingData.roomCounts.deluxe4 * livePrices.deluxe4;
    }

    const roomDetails = roomsText.length > 0 ? roomsText.join(', ') : 'None';

    alert(`Reservation Requested!

Rooms: ${roomDetails}
Price: ₹${totalPrice.toLocaleString()}/night
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut}
Guests: ${bookingData.guests}
Pets: ${bookingData.pets ? 'Yes' : 'No'}
Event: ${bookingData.eventType}`);
  };

  const toggleFAQ = (e: any) => {
    const currentItem = e.currentTarget.parentElement;
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== currentItem) item.classList.remove('active');
    });
    currentItem.classList.toggle('active');
  };



  return (
    <div className="index-page">
      
    {/*  Krishna Feather & Flute SVG Definitions  */}
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
                {/*  Flute Body  */}
                <path d="M10,75 L90,45" stroke="#DAA520" strokeWidth="12" strokeLinecap="round"/>
                <path d="M12,73 L88,44" stroke="#F0E68C" strokeWidth="6" strokeLinecap="round"/>
                
                {/*  Red Details / Bindings  */}
                <line x1="20" y1="76" x2="25" y2="63" stroke="#DC143C" strokeWidth="3"/>
                <line x1="23" y1="75" x2="28" y2="62" stroke="#DC143C" strokeWidth="3"/>
                
                <line x1="75" y1="56" x2="80" y2="43" stroke="#DC143C" strokeWidth="3"/>
                <line x1="78" y1="55" x2="83" y2="42" stroke="#DC143C" strokeWidth="3"/>

                {/*  Flute Holes  */}
                <circle cx="40" cy="62" r="2.5" fill="#3e2723"/>
                <circle cx="50" cy="59" r="2.5" fill="#3e2723"/>
                <circle cx="60" cy="56" r="2.5" fill="#3e2723"/>
                <circle cx="70" cy="53" r="2.5" fill="#3e2723"/>
                
                {/*  Tassel Strings  */}
                <path d="M23,75 Q15,90 30,95" fill="none" stroke="#FFD700" strokeWidth="2"/>
                <path d="M27,74 Q35,90 30,95" fill="none" stroke="#FFD700" strokeWidth="2"/>
                
                {/*  Use Feather  */}
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" width={135} height={45} style={{ height: "45px", width: "auto" }} />
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
        <h1 className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Braj Nidhi Guesthouse</h1>
        <section className="hero" style={{ position: 'relative' }}>
            <div className="hero-slider-container">
                <HeroSlideshow images={heroImages} mobileImages={mobileHeroImages} />
            </div>

            {/* Luxury Yacht Style Horizontal Booking widget */}
            <div className="luxury-search-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 'auto', marginBottom: '0px', zIndex: 10 }}>
                <div className="search-label-above" style={{ margin: '0 0 15px 0', textAlign: 'center' }}>FIND NOW YOUR LUXURY SUITES</div>
                <div className="luxury-search-bar" style={{ maxWidth: '720px', margin: '0 auto' }}>

                    {/* Check-In block */}
                    <div className="search-block mmt-date-trigger" style={{ position: 'relative' }}>
                        <div
                            className={`block-trigger-wrapper${isCalendarOpen && calendarInitialSelection === 'in' ? ' cal-active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}
                            onClick={() => {
                              setOpenDropdown(null);
                              if (isCalendarOpen && calendarInitialSelection === 'in') {
                                setIsCalendarOpen(false);
                              } else {
                                setCalendarInitialSelection('in');
                                setIsCalendarOpen(true);
                              }
                            }}
                        >
                            <div className="block-icon gold-icon">
                                <i className="far fa-calendar-alt"></i>
                            </div>
                            <div className="block-info">
                                <span className="block-label">Check-In</span>
                                <span className="block-value" style={{ fontWeight: 700 }}>{formatDateFriendly(bookingData.checkIn)}</span>
                            </div>
                            <i className="fas fa-chevron-down block-chevron"></i>
                        </div>

                        <PremiumDoubleCalendar
                          checkIn={bookingData.checkIn}
                          checkOut={bookingData.checkOut}
                          isOpen={isCalendarOpen}
                          initialSelection={calendarInitialSelection}
                          onChange={(start, end) => {
                            setBookingData(prev => ({ ...prev, checkIn: start, checkOut: end }));
                          }}
                          onClose={() => setIsCalendarOpen(false)}
                        />
                    </div>

                    {/* Check-Out block */}
                    <div
                        className="search-block"
                        style={{ position: 'relative' }}
                        onClick={() => {
                          setOpenDropdown(null);
                          if (isCalendarOpen && calendarInitialSelection === 'out') {
                            setIsCalendarOpen(false);
                          } else {
                            setCalendarInitialSelection('out');
                            setIsCalendarOpen(true);
                          }
                        }}
                    >
                        <div className={`block-trigger-wrapper${isCalendarOpen && calendarInitialSelection === 'out' ? ' cal-active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                            <div className="block-icon gold-icon">
                                <i className="far fa-calendar-alt"></i>
                            </div>
                            <div className="block-info">
                                <span className="block-label">Check-Out</span>
                                <span className="block-value" style={{ fontWeight: 700 }}>{formatDateFriendly(bookingData.checkOut)}</span>
                            </div>
                            <i className="fas fa-chevron-down block-chevron"></i>
                        </div>
                    </div>

                    {/* Guests block */}
                    <div
                      className="search-block"
                      onClick={() => { setIsCalendarOpen(false); setOpenDropdown(openDropdown === 'guests' ? null : 'guests'); }}
                    >
                        <div className="block-icon gold-icon">
                            <i className="fas fa-user-friends"></i>
                        </div>
                        <div className="block-info">
                            <span className="block-label">Rooms & Guests</span>
                            <span className="block-value">{bookingData.guests}</span>
                        </div>
                        <i className="fas fa-chevron-down block-chevron"></i>

                        {openDropdown === 'guests' && (
                            <div className="luxury-dropdown-options" onClick={(e) => e.stopPropagation()} style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 15px)',
                                right: 0,
                                width: '380px',
                                maxWidth: '90vw',
                                backgroundColor: '#ffffff',
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                boxShadow: '0 15px 45px rgba(0, 0, 0, 0.12)',
                                padding: '24px',
                                zIndex: 1000,
                                animation: 'fadeInUpMini 0.3s ease forwards',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                maxHeight: '60vh',
                                overflowY: 'auto'
                            }}>
                                {/* Deluxe 2 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #efe8df' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#2c2520' }}>Deluxe 2</span>
                                        <span style={{ fontSize: '12px', color: '#8c8272' }}>Twin Bedded Room (2 Guests)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #efe8df', borderRadius: '30px', padding: '6px 12px', gap: '20px', width: '110px', justifyContent: 'space-between' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe2: Math.max(0, prev.deluxe2 - 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &minus;
                                        </button>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#2c2520' }}>{tempRoomCounts.deluxe2}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe2: Math.min(10, prev.deluxe2 + 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &#43;
                                        </button>
                                    </div>
                                </div>

                                {/* Deluxe 3 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #efe8df' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#2c2520' }}>Deluxe 3</span>
                                        <span style={{ fontSize: '12px', color: '#8c8272' }}>3 Bedded Room (3 Guests)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #efe8df', borderRadius: '30px', padding: '6px 12px', gap: '20px', width: '110px', justifyContent: 'space-between' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe3: Math.max(0, prev.deluxe3 - 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &minus;
                                        </button>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#2c2520' }}>{tempRoomCounts.deluxe3}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe3: Math.min(10, prev.deluxe3 + 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &#43;
                                        </button>
                                    </div>
                                </div>

                                {/* Deluxe 4 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#2c2520' }}>Deluxe 4</span>
                                        <span style={{ fontSize: '12px', color: '#8c8272' }}>4 Bedded Room (4 Guests)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #efe8df', borderRadius: '30px', padding: '6px 12px', gap: '20px', width: '110px', justifyContent: 'space-between' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe4: Math.max(0, prev.deluxe4 - 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &minus;
                                        </button>
                                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#2c2520' }}>{tempRoomCounts.deluxe4}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setTempRoomCounts(prev => ({ ...prev, deluxe4: Math.min(10, prev.deluxe4 + 1) }))}
                                            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#2c2520', fontWeight: 500, padding: 0 }}
                                        >
                                            &#43;
                                        </button>
                                    </div>
                                </div>

                                {/* Apply Row */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #efe8df', paddingTop: '16px' }}>
                                    <button 
                                        type="button"
                                        onClick={handleApplyGuests}
                                        style={{
                                            backgroundColor: '#186dec',
                                            color: '#ffffff',
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            padding: '10px 24px',
                                            borderRadius: '30px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(24, 109, 236, 0.25)',
                                            textTransform: 'uppercase',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="btn-apply-guests"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button block */}
                    <div className="search-action-block" style={{ paddingLeft: '8px', borderLeft: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Link
                          href={(!bookingData.checkIn || !bookingData.checkOut) ? '#' : `/rooms-combo?checkin=${bookingData.checkIn}&checkout=${bookingData.checkOut}&rooms=${
                            bookingData.roomCounts.deluxe2 + bookingData.roomCounts.deluxe3 + bookingData.roomCounts.deluxe4
                          }&adults=${
                            (bookingData.roomCounts.deluxe2 * 2) + (bookingData.roomCounts.deluxe3 * 3) + (bookingData.roomCounts.deluxe4 * 4)
                          }&children=0&guests=${encodeURIComponent(bookingData.guests)}&deluxe2=${bookingData.roomCounts.deluxe2}&deluxe3=${bookingData.roomCounts.deluxe3}&deluxe4=${bookingData.roomCounts.deluxe4}`}
                          onClick={(e) => {
                            if (!bookingData.checkIn || !bookingData.checkOut) {
                              e.preventDefault();
                              setCalendarInitialSelection('in');
                              setIsCalendarOpen(true);
                            }
                          }}
                          className="search-circle-button"
                          aria-label="Search Suites"
                        >
                            <i className="fas fa-search"></i>
                        </Link>
                    </div>

                </div>
            </div>
        </section>

        <section className="banner-section">
            <div className="scrolling-banner">
                <div className="banner-track" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: 'max-content', maxWidth: 'none' }}>
                    <div className="scrolling-banner-content" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '56px', paddingRight: '56px', maxWidth: 'none', flexShrink: 0 }}>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>DIVINE HOSPITALITY</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>LUXURY SUITES</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>WEDDINGS & CELEBRATIONS</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>CORPORATE OFFSITES</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>PREMIUM AV HALL</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>SATTVIC DINING</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>SPIRITUAL RETREATS</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>VRINDAVAN EXPERIENCE</div>
                    </div>
                    <div className="scrolling-banner-content" aria-hidden="true" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '56px', paddingRight: '56px', maxWidth: 'none', flexShrink: 0 }}>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>DIVINE HOSPITALITY</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>LUXURY SUITES</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>WEDDINGS & CELEBRATIONS</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>CORPORATE OFFSITES</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>PREMIUM AV HALL</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>SATTVIC DINING</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>SPIRITUAL RETREATS</div>
                        <div className="logo-item" style={{ whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 'none' }}>VRINDAVAN EXPERIENCE</div>
                    </div>
                </div>
            </div>
        </section>


        <section className="split-section" id="rooms">
            <div className="split-container reverse">
                <div className="content-box">
                    <svg className="animated-flute" viewBox="-10 -20 120 120"><use href="#krishna-flute-feather"  /></svg>
                    <h2>Luxury Guestrooms & Divine Suites</h2><p>Experience a refined stay within the sacred atmosphere of Braj Nidhi. Thoughtfully designed rooms, elegant interiors, and peaceful surroundings come together to offer a truly elevated hospitality experience in the heart of Vrindavan.<br /><br />Whether you are visiting for darshan, weddings, spiritual retreats, or family gatherings, every stay is crafted with warmth, comfort, and timeless elegance.</p>
                    <SectionLinkButton href="/guesthouse">Explore Rooms</SectionLinkButton>
                </div>
                <div className="image-grid">
                    <img loading="lazy" decoding="async" src="/z.webp" alt="Luxury Suite Room View 1" className="main-img" />
                    <img loading="lazy" decoding="async" src="/351.webp" alt="Luxury Suite Room View 2" className="secondary-img" />
                </div>
            </div>
        </section>

        <section className="split-section" id="weddings" style={{"background":"#ffffff"}}>
            <div className="split-container">
                <div className="content-box">
                    <svg className="animated-flute" viewBox="-10 -20 120 120"><use href="#krishna-flute-feather"  /></svg>
                    <h2>Weddings & Grand Celebrations</h2><p>Celebrate your most special moments amidst the divine elegance of Braj Nidhi. From intimate wedding ceremonies to luxurious grand celebrations, our majestic venues, premium hospitality, and serene spiritual atmosphere create experiences that feel truly timeless.<br /><br />With beautifully designed spaces, exceptional accommodations, curated sattvic dining, and personalized event planning, every celebration at Braj Nidhi becomes a cherished memory for generations.</p>
                    <SectionLinkButton href="/weddings">Plan Your Wedding</SectionLinkButton>
                </div>
                <div className="image-grid">
                    <img loading="lazy" decoding="async" src="DSC02591.webp" alt="Wedding Hall" className="main-img" />
                    <img loading="lazy" decoding="async" src="DSC06003-HDR.webp" alt="Wedding Decor" className="secondary-img" />
                </div>
            </div>
        </section>

        <section className="split-section" id="corporate" style={{"background":"#f4f6f8"}}>
            <div className="split-container reverse">
                <div className="content-box">
                    <svg className="animated-flute" viewBox="-10 -20 120 120"><use href="#krishna-flute-feather"  /></svg>
                    <h2>Corporate Retreats & Premium AV Hall</h2><p>Host conferences, meetings, leadership retreats, and corporate gatherings in one of Vrindavan’s finest AV venues. Equipped with advanced sound systems, professional setup, elegant interiors, and seamless event support, Braj Nidhi offers a premium experience designed for impactful events.<br /><br />Blending modern facilities with the peaceful atmosphere of Braj, it’s the perfect destination for productive meetings, meaningful retreats, and elevated corporate experiences.</p>
                    <SectionLinkButton href="/corporate">Book Corporate Hall</SectionLinkButton>
                </div>
                <div className="image-grid">
                    <img loading="lazy" decoding="async" src="DSC09652.webp" alt="Premium AV Hall" className="main-img" />
                    <img loading="lazy" decoding="async" src="DSC09672.webp" alt="Corporate Collaborative Space" className="secondary-img" />
                </div>
            </div>
        </section>

        <section className="stats-section">
            <div className="stats-container">
                {/*  God Krishna Ornament with Music Animation  */}
                <div className="krishna-ornament-wrapper">
                    <img loading="lazy" decoding="async" src="kk.webp" alt="God Krishna Playing Flute" className="krishna-image" />
                    <div className="music-notes">
                        <i className="fas fa-music note-1"></i>
                        <i className="fas fa-music note-2"></i>
                        <i className="fas fa-music note-3"></i>
                    </div>
                </div>
                
                <div className="stat-item">
                    <h2 className="counter" data-target="10">0</h2><span>K+</span>
                    <p>Happy Guests</p>
                </div>
                <div className="stat-item">
                    <h2 className="counter" data-target="4.9" data-decimal="true">0</h2>
                    <p>Customer Rating</p>
                </div>
                <div className="stat-item">
                    <h2 className="counter" data-target="18">0</h2>
                    <p>Event Spaces</p>
                </div>
                <div className="stat-item">
                    <h2 className="counter" data-target="20">0</h2><span>+</span>
                    <p>Years of Excellence</p>
                </div>
            </div>
        </section>

        <section className="room-types-section">
            <div className="section-header">
                <h2 className="divine-header">
                    <span className="krishna-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                    <span className="divine-text">ROOMS AND SUITES</span>
                    <span className="krishna-feather right-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                </h2>
            </div>
            <div className="room-grid">
                {/* Card 1 */}
                <div className="room-card new-style">
                    <RoomCardSlideshow images={deluxe2Images} alt="Deluxe 2" interval={4000} />
                    <div className="card-gradient"></div>
                    <div className="room-content">
                        <h3>Deluxe 2 – Twin Bedded Room</h3>
                        <div className="room-amenities">
                            <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                            <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                            <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                        </div>
                        <button className="btn-availability" style={{ display: "block", width: "100%", textAlign: "center", border: "none", cursor: "pointer" }} onClick={() => openRoomModal('deluxe2', 'Deluxe 2 – Twin Bedded Room')}>Book for ₹{livePrices.deluxe2.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="room-card new-style">
                    <RoomCardSlideshow images={deluxe3Images} alt="Deluxe 3" interval={4500} />
                    <div className="card-gradient"></div>
                    <div className="room-content">
                        <h3>Deluxe 3 – 3 Bedded Room</h3>
                        <div className="room-amenities">
                            <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                            <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                            <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                            <span><i className="fas fa-place-of-worship"></i> Temple Access</span>
                        </div>
                        <button className="btn-availability" style={{ display: "block", width: "100%", textAlign: "center", border: "none", cursor: "pointer" }} onClick={() => openRoomModal('deluxe3', 'Deluxe 3 – 3 Bedded Room')}>Book for ₹{livePrices.deluxe3.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="room-card new-style">
                    <RoomCardSlideshow images={deluxe4Images} alt="Deluxe 4" interval={5000} />
                    <div className="card-gradient"></div>
                    <div className="room-content">
                        <h3>Deluxe 4 – 4 Bedded Room</h3>
                        <div className="room-amenities">
                            <span><i className="fas fa-wifi"></i> Free Wi-Fi Access</span>
                            <span><i className="fas fa-concierge-bell"></i> 24/7 Room Service</span>
                            <span><i className="fas fa-pump-soap"></i> Premium Grooming Kit</span>
                            <span><i className="fas fa-place-of-worship"></i> Temple Access</span>
                            <span><i className="fas fa-tree"></i> Vrindavan Chandrodaya Mandir Park Access</span>
                        </div>
                        <button className="btn-availability" style={{ display: "block", width: "100%", textAlign: "center", border: "none", cursor: "pointer" }} onClick={() => openRoomModal('deluxe4', 'Deluxe 4 – 4 Bedded Room')}>Book for ₹{livePrices.deluxe4.toLocaleString('en-IN')} <i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </section>

        {/*  Offers and Packages Section  */}
        <section className="offers-section">
            <div className="section-header">
                <h2 className="divine-header">
                    <span className="krishna-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                    <span className="divine-text">Special Offers & Packages</span>
                    <span className="krishna-feather right-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                </h2>
                <p>Unlock exclusive experiences and divine memories with our curated stays.</p>
            </div>
            <div className="offers-grid">
                <div className="offer-card immersive">
                    <Image src="/royal.webp" alt="Spiritual Retreat" fill style={{ objectFit: 'cover' }} className="offer-bg-img" />
                    <div className="offer-gradient-blur"></div>
                    
                    <div className="offer-content">
                        <h3>Spiritual Retreat</h3>
                        <p className="offer-subtitle">3-Day Experience</p>
                        
                        <div className="offer-inline-tags">
                            <span><i className="fas fa-tag"></i> from <strong>₹14,999</strong></span>
                            <span><i className="fas fa-om"></i> VIP Darshan</span>
                        </div>
                        
                        <a href="/braj-yatra" className="btn-offer-full" style={{"display":"block","textAlign":"center","textDecoration":"none"}}>Claim Offer</a>
                    </div>
                </div>

                {/*  Offer Card 2  */}
                <div className="offer-card immersive">
                    <Image src="/0e8512e05fcc4674c32b279cd6aa7031.jpg.webp" alt="Royal Wedding" fill style={{ objectFit: 'cover' }} className="offer-bg-img" />
                    <div className="offer-gradient-blur"></div>
                    
                    <div className="offer-content">
                        <h3>Royal Wedding</h3>
                        <p className="offer-subtitle">Heritage Venue</p>
                        
                        <div className="offer-inline-tags">
                            <span><i className="fas fa-tag"></i> <strong>Custom Pricing</strong></span>
                            <span><i className="fas fa-users"></i> 50 Guests</span>
                        </div>
                        
                        <a href="/weddings" className="btn-offer-full" style={{"display":"block","textAlign":"center","textDecoration":"none"}}>Enquire Now</a>
                    </div>
                </div>

                {/*  Offer Card 3  */}
                <div className="offer-card immersive">
                    <Image src="/weekend.webp" alt="Weekend Serenity" fill style={{ objectFit: 'cover' }} className="offer-bg-img" />
                    <div className="offer-gradient-blur"></div>
                    
                    <div className="offer-content">
                        <h3>Weekend Serenity</h3>
                        <p className="offer-subtitle">2-Day Getaway</p>
                        
                        <div className="offer-inline-tags">
                            <span><i className="fas fa-tag"></i> from <strong>₹9,500</strong></span>
                            <span><i className="fas fa-bed"></i> Luxury Room</span>
                        </div>
                        
                        <a href="/guesthouse" className="btn-offer-full" style={{"display":"block","textAlign":"center","textDecoration":"none","marginTop":"15px"}}>Book This Package</a>
                    </div>
                </div>
            </div>
        </section>

        {/* About Hotel Section */}
        <section className="about-hotel-section">
            <div className="about-hotel-container">
                <div className="about-hotel-title-wrapper">
                    <h2 className="about-hotel-title">BRAJ NIDHI GUESTHOUSE</h2>
                </div>
                <div className="about-hotel-content">
                    <div className="about-hotel-text">
                        <p>Situated about 25 minutes' walk from the Gaudiya Vaishnava Krishna Balaram Temple Complex, Braj Nidhi Guesthouse offers a peaceful sanctuary with a range of modern amenities. The guesthouse features cars for rent, as well as Wi-Fi in public areas.</p>
                        <p>The magnificent Prem Mandir is just a 5-minute walk (500m) away, and the historic ISKCON Temple is only 1.2 km from this Vrindavan stay. Other key spiritual landmarks nearby include the revered Banke Bihari Temple (7.7 km, a 20-minute ride) and the sacred forest of Nidhivan (3.5 km). You will find the Braj Nidhi Guesthouse approximately 12 km from Mathura Railway Station and 160 km from Delhi International Airport.</p>
                        <p>Offering a multi-channel TV, the rooms come with air conditioning to ensure a comfortable stay. Also, there is a personal safe, a minibar fridge and coffee/tea making facilities provided. Bathroom amenities include a modern shower and separate toilet, along with premium comforts.</p>
                        <p>The Guesthouse features a daily continental breakfast. You can visit our in-house restaurant for breakfast and eat authentic vegetarian dishes. Offering city views, an Indian restaurant is located onsite. There are also various dining options serving multiple cuisines approximately a 5-minute walk away.</p>
                    </div>
                    <div className="about-hotel-amenities">
                        <div className="amenity-card">
                            <i className="fa-solid fa-wifi"></i>
                            <span>Free Wi-Fi in rooms</span>
                        </div>
                        <div className="amenity-card">
                            <i className="fa-solid fa-place-of-worship"></i>
                            <span>Mandir Access</span>
                        </div>
                        <div className="amenity-card">
                            <i className="fa-solid fa-clock"></i>
                            <span>24-hour reception</span>
                        </div>
                        <div className="amenity-card">
                            <i className="fa-solid fa-bell-concierge"></i>
                            <span>Express check-in/ -out</span>
                        </div>
                        <div className="amenity-card">
                            <i className="fa-solid fa-utensils"></i>
                            <span>Restaurant</span>
                        </div>
                        <div className="amenity-card">
                            <i className="fa-solid fa-briefcase"></i>
                            <span>Meeting/ Banquet facilities</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Gallery Section  */}
        <section className="gallery-section">
            <div className="gallery-header">
                <h2>&mdash; GALLERY</h2>
            </div>
            <div className="gallery-slider swiper">
                <div className="swiper-wrapper">
                    <div className="swiper-slide">
                        <Image src="/m1.webp" alt="Vrindavan Chandrodaya Mandir" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/m2.webp" alt="Gallery View M2" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/m3.webp" alt="Gallery View M3" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/hero.webp" alt="Braj Nidhi Hero View" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/DSC09672.webp" alt="Gallery View 1" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/DSC09652.webp" alt="Gallery View 2" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/DSC02591.webp" alt="Gallery View 3" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/DSC06003-HDR.webp" alt="Gallery View 4" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/DSC05963-HDR.webp" alt="Gallery View 5" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/d3.webp" alt="Gallery View 6" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/351.webp" alt="Gallery View 7" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="swiper-slide">
                        <Image src="/352.webp" alt="Gallery View 8" fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>
                {/*  Navigation Buttons  */}
                <div className="gallery-nav">
                    <div className="swiper-button-prev-custom"><i className="fas fa-arrow-left"></i></div>
                    <div className="swiper-button-next-custom"><i className="fas fa-arrow-right"></i></div>
                </div>
            </div>
        </section>

        {/*  Amenities Auto-Scrolling Marquee  */}
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
                {/*  Duplicate for seamless loop  */}
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

        {/*  Testimonials Section  */}
        <section className="testimonials-section">
            <div className="section-header center-header">
                <div className="rating-badge">
                    <i className="fas fa-star"></i> Rated 4.8/5 by over 10,000 guests
                </div>
                <h2>Words of praise from others<br />about our presence.</h2>
            </div>
            
            <div className="testimonials-slider swiper">
                <div className="swiper-wrapper">
                {/*  Card 1  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"Exceeded our expectations with impeccable service that brought our spiritual journey to life - a truly remarkable stay."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Anjali+Sharma&background=6b8f5e&color=fff&size=150" alt="Anjali Sharma" />
                        <div>
                            <h3>Anjali Sharma</h3>
                            <span>Family Trip</span>
                        </div>
                    </div>
                </div>

                {/*  Card 2  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"Their ability to capture the spiritual essence in every detail is unparalleled - an invaluable cultural experience."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Rajesh+Kumar&background=d4af37&color=fff&size=150" alt="Rajesh Kumar" />
                        <div>
                            <h3>Rajesh Kumar</h3>
                            <span>Spiritual Retreat</span>
                        </div>
                    </div>
                </div>

                {/*  Card 3  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"Gracious hosts who listen, understand, and craft captivating experiences - a team that truly understands our needs."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Kavita+Singh&background=6b8f5e&color=fff&size=150" alt="Kavita Singh" />
                        <div>
                            <h3>Kavita Singh</h3>
                            <span>Weekend Getaway</span>
                        </div>
                    </div>
                </div>

                {/*  Card 4  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"A refreshing and peaceful environment that consistently delivers exceptional comfort - highly recommended for any visit."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Vikram+Verma&background=d4af37&color=fff&size=150" alt="Vikram Verma" />
                        <div>
                            <h3>Vikram Verma</h3>
                            <span>Solo Traveler</span>
                        </div>
                    </div>
                </div>

                {/*  Card 5  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"From concept to execution, their hospitality knows no bounds - a game-changer for our family vacation."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Priya+Patel&background=6b8f5e&color=fff&size=150" alt="Priya Patel" />
                        <div>
                            <h3>Priya Patel</h3>
                            <span>Family Vacation</span>
                        </div>
                    </div>
                </div>

                {/*  Card 6  */}
                <div className="swiper-slide testimonial-card">
                    <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
                    <p className="testimonial-text">"A truly spiritual experience. The view of the temple from my room was breathtaking, and the hospitality was exceptional."</p>
                    <div className="testimonial-user">
                        <img loading="lazy" decoding="async" src="https://ui-avatars.com/api/?name=Amit+Desai&background=d4af37&color=fff&size=150" alt="Amit Desai" />
                        <div>
                            <h3>Amit Desai</h3>
                            <span>Pilgrimage</span>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>


        {/*  FAQ Section  */}
        <section className="faq-section">
            <div className="faq-container">
                <div className="faq-left">
                    <h2>Frequently Asked<br />Questions</h2>
                    <p>We're here to help you plan your perfect stay in the heart of Vrindavan.</p>
                </div>
                <div className="faq-right">
                    <div className="faq-item">
                        <div className="faq-question" onClick={toggleFAQ}>
                            <span>What are the check-in and check-out timings?</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Standard Check-in is at 2:00 PM and Check-out is at 11:00 AM. Early check-in or late check-out is subject to availability.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-question" onClick={toggleFAQ}>
                            <span>Is the guesthouse near the Bankey Bihari Temple?</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Yes, Bankey Bihari Temple is located approximately 7.7 km from the guesthouse, making it a comfortable 20-minute ride.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-question" onClick={toggleFAQ}>
                            <span>Do you provide pure vegetarian food?</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Absolutely. Braj Nidhi is a pure Satvik vegetarian establishment. We serve traditional Braj cuisine prepared with the highest standards of hygiene.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-question" onClick={toggleFAQ}>
                            <span>Is parking available at the guesthouse?</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>Yes, we have a dedicated, secure parking area for guests traveling with their own vehicles at no additional cost.</p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <div className="faq-question" onClick={toggleFAQ}>
                            <span>How can I book a room?</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        <div className="faq-answer">
                            <p>You can book directly through our 'Reserve Now' buttons on this website or reach out to us at +91 70377 94300 for group bookings and weddings.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>



        {/*  Nearby Attractions Section  */}
        <section className="attractions-section">
            <div className="section-header">
                <h2 className="divine-header">
                    <span className="krishna-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                    <span className="divine-text">Nearby Attractions</span>
                    <span className="krishna-feather right-feather"><svg viewBox="0 0 100 100"><use href="#krishna-flute-feather"  /></svg></span>
                </h2>
                <p>Discover the divine landmarks and heritage sites around Braj Nidhi. <span className="click-hint">(Click any card to flip for location)</span></p>
            </div>
            <div className="attractions-grid">
                {/*  Attraction 1  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/Radha Vallabh Dwar.webp" alt="Radha Vallabh Temple" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">2.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Radha Vallabh Temple</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.9</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Gotam Nagar, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6974793!3d27.5815647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736fc201c10711%3A0xbcc1c54b2ce8f41e!2sShri%20Bankey%20Bihari%20Ji%20Temple%2C%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 2  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/Prem Mandir.webp" alt="Prem Mandir" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">0.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Prem Mandir</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 5.0</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Chattikara Road, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6774793!3d27.5615647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPrem%20Mandir!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 3  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/keshi ghat.webp" alt="Keshi Ghat" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">3.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Keshi Ghat</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.8</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Banks of Yamuna, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6874793!3d27.5715647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sISKCON%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 4  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/nidhivan.webp" alt="Nidhivan" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">3.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Nidhivan</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.7</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Goshala Nagar, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6984793!3d27.5825647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNidhivan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 5  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/radha-raman-temple.webp" alt="Radha Raman Temple" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">3.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Radha Raman Temple</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.9</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Pancayatana, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6994793!3d27.5835647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRadha%20Raman%20Temple!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 6  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/neem-karoli-baba.webp" alt="Neem Karoli Ashram" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">1.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Neem Karoli Ashram</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.9</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Mathura Road, Vrindavan</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6914793!3d27.5845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNeem%20Karoli%20Baba%20Ashram!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 7  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/raman-reti.webp" alt="Raman Reti" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">15.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Raman Reti</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.8</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Gokul, Uttar Pradesh</span>
                                </div>
                                <div className="flip-hint-text">
                                    <i className="fas fa-sync-alt"></i> Click for Map
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.7214793!3d27.4845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRaman%20Reti!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 8  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/nandgaon-holi.webp" alt="Shri Nand Baba Temple" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">32.0 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Shri Nand Baba Temple</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.9</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Nandgaon, Mathura</span>
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.4214793!3d27.7845647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sShri%20Nand%20Baba%20Temple!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 9  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/vishram-ghat.webp" alt="Vishram Ghat Mathura" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">12.5 km</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Vishram Ghat Mathura</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 4.9</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Mathura</span>
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6814793!3d27.5045647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVishram%20Ghat!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>

                {/*  Attraction 10  */}
                <div className="attraction-card" onClick={(e) => e.currentTarget.classList.toggle('flipped')}>
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img loading="lazy" decoding="async" src="/banke-bihari-mandir.webp" alt="Shri Banke Bihari Mandir" className="attraction-bg" />
                            <div className="card-overlay-gradient"></div>
                            <div className="distance-pill">2.5 km (10 min ride)</div>
                            <div className="attraction-content">
                                <div className="title-row">
                                    <h3>Shri Banke Bihari Mandir</h3>
                                    <span className="rating-pill"><i className="fas fa-star" style={{"color":"#ffd700"}}></i> 5.0</span>
                                </div>
                                <div className="location-line">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Bihari Pura, Vrindavan</span>
                                </div>
                            </div>
                        </div>
                        <div className="flip-card-back">
                            <iframe title="Embedded Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8665045058414!2d77.6974793!3d27.5815647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736fc201c10711%3A0xbcc1c54b2ce8f41e!2sShri%20Bankey%20Bihari%20Ji%20Temple%2C%20Vrindavan!5e0!3m2!1sen!2sin!4v1714486500000!5m2!1sen!2sin" width="100%" height="100%" style={{"border":"0"}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            <div className="flip-back-hint"><i className="fas fa-undo"></i> Click to flip back</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/*  CTA Section  */}
        <section className="cta-section" id="contact">
            <div className="cta-card">
                <div className="cta-content">
                    <span className="cta-badge">Get Started Today</span>
                    <h2>Your Divine Journey Starts With<br />a Peaceful Stay</h2>
                    <p>Connect with our hospitality team to find the perfect room for your pilgrimage.<br />We're here to help!</p>
                    <a href="#contact" className="cta-btn">Reserve Your Stay</a>
                </div>
            </div>
        </section>
    </main>

    {/*  Footer  */}
    <footer className="site-footer">
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
                <a href="/booking">Book Your Stay</a>
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
