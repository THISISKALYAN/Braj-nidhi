"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  BedDouble, Users, Calendar, Star, MapPin, ShieldCheck, Wifi, Coffee,
  Leaf, ArrowRight, Check, Clock, Info, Menu, X, ChevronDown, ChevronUp, Moon
} from 'lucide-react';
import dynamic from 'next/dynamic';

const BookNowButton = dynamic(() => import('@/components/BookNowButton'), { ssr: false });
const RoomUnavailablePopup = dynamic(() => import('@/components/RoomUnavailablePopup'), { ssr: false });

interface RoomOption {
  key: 'deluxe2' | 'deluxe3' | 'deluxe4';
  title: string;
  shortName: string;
  beds: string;
  maxGuests: number;
  pricePerNight: number;
  mrpPrice: number;
  image: string;
  sqft: string;
  amenities: string[];
  tag: string;
}

const ROOMS: RoomOption[] = [
  {
    key: 'deluxe2',
    title: 'Deluxe 2 – Twin Bedded Room',
    shortName: 'Deluxe 2',
    beds: 'Twin Beds',
    maxGuests: 2,
    pricePerNight: 3500,
    mrpPrice: 5000,
    image: '/DSC05818-HDR.webp',
    sqft: '280 sq.ft',
    amenities: ['Free Wi-Fi Access', '24/7 Room Service', 'Premium Grooming Kit'],
    tag: 'Best Value'
  },
  {
    key: 'deluxe3',
    title: 'Deluxe 3 – 3 Bedded Room',
    shortName: 'Deluxe 3',
    beds: '3 Single Beds',
    maxGuests: 3,
    pricePerNight: 4500,
    mrpPrice: 6500,
    image: '/d3.webp',
    sqft: '340 sq.ft',
    amenities: ['Free Wi-Fi Access', '24/7 Room Service', 'Premium Grooming Kit', 'Temple Access'],
    tag: 'Most Popular'
  },
  {
    key: 'deluxe4',
    title: 'Deluxe 4 – 4 Bedded Room',
    shortName: 'Deluxe 4',
    beds: '4-Poster Beds',
    maxGuests: 4,
    pricePerNight: 5500,
    mrpPrice: 7200,
    image: '/DSC05963-HDR.webp',
    sqft: '420 sq.ft',
    amenities: ['Free Wi-Fi Access', '24/7 Room Service', 'Premium Grooming Kit', 'Temple Access', 'Vrindavan Chandrodaya Mandir Park Access'],
    tag: 'Premium Suite'
  }
];

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[m - 1]} '${String(y).slice(-2)}`;
  } catch { return dateStr; }
}

function getNights(checkIn: string, checkOut: string): number {
  try {
    const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  } catch { return 1; }
}

function RoomsComboContent() {
  const searchParams = useSearchParams();
  const checkIn  = searchParams.get('checkin')  || '';
  const checkOut = searchParams.get('checkout') || '';
  const roomsCount = Math.max(1, parseInt(searchParams.get('rooms')    || '1'));
  const adults     = Math.max(1, parseInt(searchParams.get('adults')   || '2'));
  const children   = Math.max(0, parseInt(searchParams.get('children') || '0'));
  const guestsStr  = searchParams.get('guests') || `${adults} Adults`;
  const nights     = getNights(checkIn, checkOut);
  const totalGuests = adults + children;

  const [roomSelections, setRoomSelections] = useState<Record<string, number>>({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>('deluxe2');
  const [scrolled, setScrolled] = useState(false);
  const [cameFromGuesthouse, setCameFromGuesthouse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromParam = searchParams.get('from');
    if (fromParam === 'guesthouse') { setCameFromGuesthouse(true); return; }
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.host === window.location.host && ref.pathname.startsWith('/guesthouse')) {
        setCameFromGuesthouse(true);
      }
    } catch { /* ignore */ }
  }, [searchParams]);

  // ── ERP availability per room type ──────────────────────────────────────────
  const [roomAvail, setRoomAvail] = useState<Record<string, number | null>>({
    deluxe2: null, deluxe3: null, deluxe4: null,
  });
  const [availLoading, setAvailLoading] = useState(true);
  const [soldOutPopup, setSoldOutPopup] = useState<{ room: RoomOption } | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const GALLERY_PHOTOS = [
    { src: '/d1.webp', caption: 'Deluxe 2 – Twin Bedded Room' },
    { src: '/d2.webp', caption: 'Deluxe 2 – Room View' },
    { src: '/d3.webp', caption: 'Deluxe 2 – Room Interior' },
    { src: '/d4.webp', caption: 'Deluxe 2 – Room Details' },
    { src: '/t1.webp', caption: 'Deluxe 3 – Triple Room' },
    { src: '/t2.webp', caption: 'Deluxe 3 – Room View' },
    { src: '/t3.webp', caption: 'Deluxe 3 – Room Interior' },
    { src: '/t4.webp', caption: 'Deluxe 3 – Room Details' },
    { src: '/f1.webp', caption: 'Deluxe 4 – 4 Bedded Room' },
    { src: '/f2.webp', caption: 'Deluxe 4 – Room View' },
    { src: '/f3.webp', caption: 'Deluxe 4 – Room Details' },
  ];

  const fetchAvailability = useCallback(async (isInitial = false) => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      if (isInitial) setAvailLoading(false);
      return;
    }
    if (isInitial) setAvailLoading(true);

    const types: Array<'deluxe2' | 'deluxe3' | 'deluxe4'> = ['deluxe2', 'deluxe3', 'deluxe4'];
    try {
      const results = await Promise.all(
        types.map(rt =>
          fetch(`/api/availability?roomType=${rt}&from=${checkIn}&to=${checkOut}&rooms=${roomsCount}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (!data?.availability) return { rt, min: null };
              const vals = Object.values(data.availability as Record<string, number>);
              return { rt, min: vals.length ? Math.min(...vals) : 0 };
            })
            .catch(() => ({ rt, min: null }))
        )
      );
      const map: Record<string, number | null> = {};
      for (const { rt, min } of results) map[rt] = min;
      setRoomAvail(prev => {
        const changed = types.some(rt => prev[rt] !== map[rt]);
        return changed ? map : prev;
      });
    } finally {
      setAvailLoading(false);
    }
  }, [checkIn, checkOut, roomsCount]);

  useEffect(() => {
    fetchAvailability(true);
    const id = setInterval(() => fetchAvailability(false), 20_000);
    return () => clearInterval(id);
  }, [fetchAvailability]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const bookingUrl = () => {
    const parts = Object.entries(roomSelections).filter(([_, q]) => q > 0).map(([k, q]) => `${k}=${q}`);
    const rQuery = parts.length > 0 ? '&' + parts.join('&') : '';
    return `/booking?checkin=${checkIn}&checkout=${checkOut}&adults=${adults}&children=${children}&guests=${encodeURIComponent(guestsStr)}${rQuery}`;
  };

  return (
    <div className="rcp">
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;}
        .rcp{background:#f4f0e8;min-height:100vh;font-family:var(--font-outfit),sans-serif;color:#111;padding-top:88px;}
        .rcp *{font-family:var(--font-outfit),sans-serif;}
        .rcp h1,.rcp h2,.rcp h3,.rcp h4{font-family:var(--font-bebas-neue),cursive!important;font-weight:400!important;letter-spacing:.5px;color:#111;}

        /* ── Header: solid white when not scrolled, normal pill when scrolled ── */
        .rcp #main-header:not(.scrolled) {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(229,231,235,0.85);
        }
        /* Restore Bebas Neue for nav links (overridden by .rcp * rule) */
        .rcp #main-header nav ul li a {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.25rem !important;
          font-weight: 400 !important;
          letter-spacing: 0.05em !important;
          color: #1a1a1a !important;
        }
        .rcp #main-header nav ul li a:hover { color: #C89B3C !important; }
        .rcp #main-header:not(.scrolled) .mobile-menu-btn { color: #1a1a1a !important; }
        /* Login/Join button: visible on white header background */
        .rcp #main-header:not(.scrolled) .btn-login {
          color: #111 !important;
          border: 1px solid rgba(0,0,0,0.22) !important;
          background: rgba(0,0,0,0.04) !important;
          box-shadow: none !important;
        }

        /* ── Breadcrumb ── */
        .rcp-crumb{background:#fff;border-bottom:1px solid #e5e7eb;padding:10px 5%;display:flex;align-items:center;flex-wrap:nowrap;gap:8px;font-size:15px;color:#6B7280;white-space:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
        .rcp-crumb::-webkit-scrollbar{display:none;}
        .rcp-crumb a{color:#6B7280;text-decoration:none;flex-shrink:0;}
        .rcp-crumb a:hover{color:#C89B3C;}
        .rcp-crumb .cur{color:#C89B3C;font-weight:600;flex-shrink:0;}
        .rcp-crumb-sep{color:#9CA3AF;flex-shrink:0;line-height:1;display:inline-flex;align-items:center;}
        @media (max-width:640px){
          .rcp-crumb{font-size:13px;gap:6px;padding:10px 16px;}
        }

        /* ── Search summary strip ── */
        .rcp-search-strip{background:#fff;border-bottom:1px solid #e5e7eb;padding:10px 5%;display:flex;align-items:center;gap:28px;flex-wrap:wrap;}
        .rcp-strip-item{display:flex;align-items:center;gap:9px;font-size:16px;color:#374151;}
        .rcp-strip-item svg{color:#C89B3C;flex-shrink:0;}
        .rcp-strip-item strong{color:#111;font-weight:700;}
        .rcp-strip-sep{width:1px;height:24px;background:#e5e7eb;}
        .rcp-strip-edit{font-size:15px;color:#1d6de5;font-weight:600;cursor:pointer;text-decoration:none;margin-left:auto;}
        .rcp-strip-edit:hover{text-decoration:underline;}

        /* ── Body ── */
        .rcp-body{max-width:1440px;margin:0 auto;padding:30px 28px 80px;display:grid;grid-template-columns:1fr 420px;gap:28px;align-items:start;}

        /* ── Hotel card ── */
        .rcp-hotel-card{background:#fff;border-radius:18px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.06);margin-bottom:24px;}
        .rcp-hotel-head{padding:26px 30px 20px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
        .rcp-hotel-name h1{font-size:34px;color:#111;margin:0 0 8px;}
        .rcp-hotel-stars{display:flex;align-items:center;gap:4px;margin-bottom:8px;}
        .rcp-hotel-loc{display:flex;align-items:center;gap:6px;font-size:15px;color:#6B7280;}
        .rcp-hotel-loc svg{color:#C89B3C;}
        .rcp-rating-box{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
        .rcp-score{width:52px;height:52px;background:linear-gradient(135deg,#1d6de5,#1557c0);border-radius:10px 10px 10px 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:800;}
        .rcp-rating-lbl{font-size:14px;font-weight:700;color:#1d6de5;}
        .rcp-rating-cnt{font-size:13px;color:#9CA3AF;}
        .rcp-photos{display:grid;grid-template-columns:1.7fr 1fr;grid-template-rows:250px 250px;gap:4px;margin:0 30px 30px;border-radius:14px;overflow:hidden;}
        .rcp-photo-main{grid-row:1/3;overflow:hidden;position:relative;}
        .rcp-photo-main img,.rcp-photo-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .rcp-photo-main:hover img,.rcp-photo-thumb:hover img{transform:scale(1.04);}
        .rcp-photo-thumb{overflow:hidden;position:relative;}
        .rcp-photo-pill{position:absolute;bottom:14px;right:14px;background:rgba(0,0,0,.65);color:#fff;font-size:13px;font-weight:600;padding:6px 14px;border-radius:18px;backdrop-filter:blur(6px);cursor:pointer;}

        /* ── Rooms section ── */
        .rcp-rooms-label{font-size:15px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.6px;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;}

        /* ── Room card ── */
        .rcp-room-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.05);transition:border-color .25s,box-shadow .25s;}
        .rcp-room-card:hover{border-color:#C89B3C;box-shadow:0 8px 24px rgba(200,155,60,.12);}
        .rcp-room-card.selected{border-color:#1d6de5;box-shadow:0 6px 20px rgba(29,109,229,.14);}

        .rcp-room-header{display:flex;align-items:center;justify-content:space-between;padding:20px 26px;cursor:pointer;gap:16px;}
        .rcp-room-header-left{display:flex;align-items:center;gap:18px;}
        .rcp-room-thumb{width:100px;height:76px;border-radius:10px;overflow:hidden;flex-shrink:0;}
        .rcp-room-thumb img{width:100%;height:100%;object-fit:cover;}
        .rcp-room-name h3{font-size:21px;color:#111;margin:0 0 6px;}
        .rcp-room-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .rcp-meta-pill{background:#f4f0e8;border-radius:20px;padding:4px 13px;font-size:13px;font-weight:600;color:#6B7280;}
        .rcp-tag{font-size:13px;font-weight:700;padding:4px 13px;border-radius:20px;}
        .rcp-tag.green{background:#dcfce7;color:#166534;}
        .rcp-tag.gold{background:#fef3c7;color:#92400e;}
        .rcp-tag.blue{background:#dbeafe;color:#1e40af;}
        .rcp-room-header-right{display:flex;align-items:center;gap:18px;flex-shrink:0;}
        .rcp-price-block{text-align:right;}
        .rcp-price-mrp{font-size:14px;color:#9CA3AF;text-decoration:line-through;}
        .rcp-price-main{font-size:26px;font-weight:800;color:#111;}
        .rcp-price-night{font-size:13px;color:#6B7280;}
        .rcp-price-save{font-size:13px;font-weight:700;color:#16a34a;margin-top:2px;}
        .rcp-chevron{color:#9CA3AF;transition:transform .3s;}
        .rcp-chevron.open{transform:rotate(180deg);}

        /* ── Room expanded body ── */
        .rcp-room-body{border-top:1px solid #f3f4f6;padding:26px;}
        .rcp-room-body-grid{display:grid;grid-template-columns:280px 1fr;gap:26px;align-items:start;}
        .rcp-room-img{width:100%;height:210px;border-radius:12px;overflow:hidden;}
        .rcp-room-img img{width:100%;height:100%;object-fit:cover;}
        .rcp-room-amenities{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}
        .rcp-amenity{display:flex;align-items:center;gap:10px;font-size:15px;color:#374151;}
        .rcp-amenity svg{color:#16a34a;flex-shrink:0;}
        .rcp-free-cancel{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#16a34a;margin-bottom:18px;}
        .rcp-free-cancel svg{flex-shrink:0;}
        .rcp-room-actions{display:flex;align-items:center;gap:14px;margin-top:6px;}
        .btn-select-room{padding:14px 34px;background:linear-gradient(135deg,#1d6de5,#1557c0);color:#fff;font-size:16px;font-weight:700;font-family:var(--font-outfit),sans-serif;border:none;border-radius:10px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:9px;transition:all .25s;}
        .btn-select-room:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(29,109,229,.32);}
        .rcp-room-card.selected .btn-select-room{background:linear-gradient(135deg,#16a34a,#15803d);}
        .rcp-room-card.selected .btn-select-room:hover{box-shadow:0 10px 24px rgba(22,163,74,.32);}
        .btn-view-details{padding:14px 24px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;font-size:15px;font-weight:600;color:#374151;cursor:pointer;transition:all .2s;}
        .btn-view-details:hover{border-color:#C89B3C;color:#C89B3C;}

        /* ── Right sidebar ── */
        .rcp-sidebar{position:sticky;top:112px;}
        .rcp-side-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,.06);padding:28px;margin-bottom:18px;}
        .rcp-side-card h4{font-family:var(--font-bebas-neue),cursive!important;font-size:22px;color:#111;margin:0 0 20px;font-weight:400!important;letter-spacing:.4px;}

        .rcp-dates-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
        .rcp-date-box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;}
        .rcp-date-box .lbl{font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;}
        .rcp-date-box .val{font-size:16px;font-weight:800;color:#111;}
        .rcp-nights-box{background:#fef3c7;border:1px solid rgba(200,155,60,.3);border-radius:10px;padding:12px 14px;text-align:center;flex-shrink:0;}
        .rcp-nights-box .num{font-size:22px;font-weight:900;color:#C89B3C;}
        .rcp-nights-box .lbl{font-size:12px;color:#92400e;font-weight:600;}

        .rcp-guests-row{display:flex;align-items:center;gap:10px;padding:13px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:18px;}
        .rcp-guests-row svg{color:#C89B3C;}
        .rcp-guests-info .main{font-size:16px;font-weight:700;color:#111;}
        .rcp-guests-info .sub{font-size:13px;color:#6B7280;}

        .rcp-selected-summary{background:#f0f7ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:18px;margin-bottom:18px;}
        .rcp-sel-label{font-size:13px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;}
        .rcp-sel-name{font-size:17px;font-weight:800;color:#111;margin-bottom:5px;}
        .rcp-sel-price{font-size:26px;font-weight:900;color:#1d6de5;}
        .rcp-sel-sub{font-size:13px;color:#6B7280;margin-top:3px;}
        .rcp-sel-total{font-size:15px;color:#374151;margin-top:10px;padding-top:10px;border-top:1px solid #bfdbfe;}
        .rcp-sel-total strong{color:#111;}
        .btn-book-now{width:100%;padding:17px;background:linear-gradient(135deg,#1d6de5,#1557c0);color:#fff;font-size:17px;font-weight:700;font-family:var(--font-outfit),sans-serif;border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;transition:all .25s;margin-bottom:12px;}
        .btn-book-now:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(29,109,229,.38);}
        .rcp-secure{display:flex;align-items:center;gap:7px;font-size:14px;color:#6B7280;justify-content:center;}
        .rcp-secure svg{color:#16a34a;}
        .rcp-no-select{text-align:center;padding:20px;font-size:15px;color:#9CA3AF;border:1.5px dashed #e5e7eb;border-radius:12px;margin-bottom:16px;}

        .rcp-policy-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:22px 26px;}
        .rcp-policy-card h4{font-family:var(--font-bebas-neue),cursive!important;font-size:20px;color:#111;margin:0 0 16px;font-weight:400!important;}
        .rcp-policy-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;font-size:15px;color:#374151;}
        .rcp-policy-item svg{color:#C89B3C;flex-shrink:0;margin-top:2px;}

        /* Responsive */
        @media(max-width:1100px){
          .rcp-body{grid-template-columns:1fr 380px;}
        }
        @media(max-width:900px){
          .rcp-body{grid-template-columns:1fr;}
          .rcp-sidebar{position:static;}
          .rcp-photos{grid-template-rows:220px 160px;}
        }
        @media(max-width:600px){
          .rcp-body{padding:16px 14px 50px;}
          .rcp-hotel-head{flex-direction:column;}
          .rcp-photos{grid-template-columns:1fr;grid-template-rows:260px;}
          .rcp-photo-thumb{display:none;}
          .rcp-photo-main{grid-row:1/2;}
          .rcp-room-body-grid{grid-template-columns:1fr;}
          .rcp-room-img{height:220px;}
          .rcp-search-strip{gap:14px;}
          /* Room card header — compact on mobile */
          .rcp-room-header{padding:12px 14px;gap:8px;}
          .rcp-room-header-left{gap:10px;}
          .rcp-room-thumb{width:70px;height:54px;}
          .rcp-room-name h3{font-size:15px;margin-bottom:4px;}
          .rcp-room-header-right{gap:8px;}
          .rcp-price-mrp{font-size:12px;}
          .rcp-price-main{font-size:20px;}
          .rcp-price-label{font-size:11px;}
          .rcp-discount{font-size:11px;}
          /* Action buttons */
          .rcp-room-actions{flex-direction:column;gap:8px;}
          .btn-select-room,.btn-view-details{width:100%;justify-content:center;padding:12px 16px;font-size:14px;}
          /* Amenities + body padding */
          .rcp-room-body{padding:14px;}
          .rcp-amenity-item{font-size:13px;}
        }
        @media(max-width:400px){
          .rcp-room-name h3{font-size:13px;}
          .rcp-price-main{font-size:18px;}
          .rcp-room-thumb{width:58px;height:46px;}
        }
      `}} />

      {/* Header */}
      <header id="main-header" className={scrolled ? 'scrolled' : ''}>
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" style={{ height: '45px', width: 'auto' }} />
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

      {/* ── Breadcrumb ── */}
      <nav className="rcp-crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="rcp-crumb-sep">›</span>
        {cameFromGuesthouse && (
          <>
            <Link href="/guesthouse">Guesthouse</Link>
            <span className="rcp-crumb-sep">›</span>
          </>
        )}
        <span className="cur">Select Your Room</span>
      </nav>

      {/* ── Search summary strip ── */}
      <div className="rcp-search-strip">
        <div className="rcp-strip-item">
          <Calendar size={15}/>
          <span><strong>{checkIn ? formatDate(checkIn) : '—'}</strong> → <strong>{checkOut ? formatDate(checkOut) : '—'}</strong></span>
        </div>
        <div className="rcp-strip-sep"/>
        <div className="rcp-strip-item">
          <Moon size={15}/>
          <span><strong>{nights}</strong> Night{nights > 1 ? 's' : ''}</span>
        </div>
        <div className="rcp-strip-sep"/>
        <div className="rcp-strip-item">
          <Users size={15}/>
          <span><strong>{roomsCount}</strong> Room{roomsCount > 1 ? 's' : ''}, <strong>{totalGuests}</strong> Guest{totalGuests > 1 ? 's' : ''}</span>
        </div>
        <Link href="/" className="rcp-strip-edit">Modify Search ›</Link>
      </div>

      {/* ── Body ── */}
      <div className="rcp-body">

        {/* ─── Left column ─── */}
        <div>

          {/* Rooms section */}
          <div className="rcp-rooms-label">Available Rooms & Suites — Select to Continue</div>

          {ROOMS.map((room) => {
            const discountPct = Math.round((1 - room.pricePerNight / room.mrpPrice) * 100);
            const isExpanded  = expandedRoom === room.key;
            const isSelected  = (roomSelections[room.key] || 0) > 0;
            const avail = roomAvail[room.key];
            const isSoldOut = avail !== null && avail < roomsCount;

            return (
              <div key={room.key} className={`rcp-room-card${isSelected ? ' selected' : ''}`} style={isSoldOut ? { opacity: 0.7 } : undefined}>

                {/* Collapsible header row */}
                <div className="rcp-room-header" onClick={() => setExpandedRoom(isExpanded ? null : room.key)}>
                  <div className="rcp-room-header-left">
                    <div className="rcp-room-thumb">
                      <img loading="lazy" decoding="async" src={room.image} alt={room.shortName} />
                    </div>
                    <div className="rcp-room-name">
                      <h3>{room.shortName}</h3>
                      <div className="rcp-room-meta">
                        <span className="rcp-meta-pill">{room.beds}</span>
                        <span className="rcp-meta-pill">{room.sqft}</span>
                        <span className="rcp-meta-pill">Up to {room.maxGuests} guests</span>
                        <span className={`rcp-tag ${room.key === 'deluxe2' ? 'green' : room.key === 'deluxe3' ? 'gold' : 'blue'}`}>
                          {room.tag}
                        </span>
                        {/* ERP availability badge */}
                        {!availLoading && avail !== null && (
                          isSoldOut ? (
                            <span style={{
                              background:'#fef2f2',color:'#b91c1c',fontSize:'12px',fontWeight:700,
                              padding:'4px 12px',borderRadius:'20px',border:'1px solid #fca5a5',
                            }}>Sold Out</span>
                          ) : (
                            <span style={{
                              background: avail <= 2 ? '#fff7ed' : '#f0fdf4',
                              color: avail <= 2 ? '#c2410c' : '#166534',
                              fontSize:'12px',fontWeight:700,
                              padding:'4px 12px',borderRadius:'20px',
                              border: `1px solid ${avail <= 2 ? '#fdba74' : '#bbf7d0'}`,
                            }}>{avail} room{avail !== 1 ? 's' : ''} available</span>
                          )
                        )}
                        {availLoading && (
                          <span style={{
                            background:'#f3f4f6',color:'#9ca3af',fontSize:'11px',fontWeight:600,
                            padding:'4px 12px',borderRadius:'20px',
                          }}>Checking...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rcp-room-header-right">
                    <div className="rcp-price-block">
                      <div className="rcp-price-mrp">₹{room.mrpPrice.toLocaleString('en-IN')}</div>
                      <div className="rcp-price-main">₹{room.pricePerNight.toLocaleString('en-IN')}</div>
                      <div className="rcp-price-night">Per Room / Night</div>
                      <div className="rcp-price-save">{discountPct}% off MRP</div>
                    </div>
                    <div className={`rcp-chevron${isExpanded ? ' open' : ''}`}>
                      {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="rcp-room-body">
                    <div className="rcp-room-body-grid">
                      <div className="rcp-room-img">
                        <img loading="lazy" decoding="async" src={room.image} alt={room.title} />
                      </div>
                      <div>
                        <div className="rcp-room-amenities">
                          {room.amenities.map((a, i) => (
                            <div key={i} className="rcp-amenity">
                              <Check size={14}/>
                              {a}
                            </div>
                          ))}
                        </div>
                        <div className="rcp-free-cancel">
                          <ShieldCheck size={15}/>
                          Free Cancellation up to 48 hrs before check-in
                        </div>
                        {/* Availability detail in expanded body */}
                        {!availLoading && avail !== null && (
                          <div style={{
                            display:'flex',alignItems:'center',gap:'8px',
                            marginBottom:'14px',fontSize:'14px',fontWeight:700,
                            color: isSoldOut ? '#b91c1c' : avail <= 2 ? '#c2410c' : '#166534',
                          }}>
                            {isSoldOut
                              ? `No rooms available for your dates`
                              : `${avail} room${avail !== 1 ? 's' : ''} available for ${nights} night${nights > 1 ? 's' : ''}`}
                          </div>
                        )}
                          <div className="rcp-room-actions">
                            {isSoldOut ? (
                              <button
                                className="btn-select-room"
                                style={{ background:'#d1d5db', cursor:'not-allowed' }}
                                onClick={(e) => { e.stopPropagation(); setSoldOutPopup({ room }); }}
                              >
                                Sold Out
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {roomSelections[room.key] > 0 ? (
                                  <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                                    <button 
                                      onClick={() => setRoomSelections(prev => ({ ...prev, [room.key]: prev[room.key] - 1 }))}
                                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >-</button>
                                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                      {roomSelections[room.key]}
                                    </span>
                                    <button 
                                      onClick={() => {
                                        if (avail === null || roomSelections[room.key] < avail) {
                                          setRoomSelections(prev => ({ ...prev, [room.key]: prev[room.key] + 1 }));
                                        } else {
                                          setSoldOutPopup({ room });
                                        }
                                      }}
                                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >+</button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-select-room"
                                    onClick={() => {
                                      setRoomSelections(prev => ({ ...prev, [room.key]: 1 }));
                                    }}
                                  >
                                    Add to Booking <ArrowRight size={15}/>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Hotel card */}
          <div className="rcp-hotel-card">
            <div className="rcp-hotel-head">
              <div className="rcp-hotel-name">
                <h1>Braj Nidhi Guesthouse</h1>
                <div className="rcp-hotel-stars">
                  {[1,2,3,4].map(i => <Star key={i} size={14} fill="#f59e0b" stroke="none"/>)}
                  <Star size={14} stroke="#f59e0b" fill="none"/>
                </div>
                <div className="rcp-hotel-loc">
                  <MapPin size={13}/>
                  Bhaktivedanata Swami Marg, Vrindavan · near Chandrodaya Mandir
                </div>
              </div>
              <div className="rcp-rating-box">
                <div className="rcp-score">4.8</div>
                <div className="rcp-rating-lbl">Excellent</div>
                <div className="rcp-rating-cnt">2,400+ ratings</div>
              </div>
            </div>
            <div className="rcp-photos">
              <div className="rcp-photo-main">
                <img loading="lazy" decoding="async" src="/hero.webp" alt="Braj Nidhi Guesthouse" />
              </div>
              <div className="rcp-photo-thumb">
                <img loading="lazy" decoding="async" src="/DSC05963-HDR.webp" alt="Deluxe Room" />
              </div>
              <div className="rcp-photo-thumb">
                <img loading="lazy" decoding="async" src="/DSC05818-HDR.webp" alt="Room view" />
                <span className="rcp-photo-pill" onClick={() => { setGalleryIdx(0); setGalleryOpen(true); }}>View All Photos</span>
              </div>
            </div>
          </div>

          {/* Property info strip */}
          <div style={{background:'#fff',borderRadius:'12px',padding:'14px 18px',border:'1px solid #e5e7eb',display:'flex',alignItems:'center',gap:'9px',fontSize:'13px',color:'#374151',marginTop:'6px'}}>
            <Clock size={14} style={{color:'#C89B3C',flexShrink:0}}/>
            <span><strong style={{color:'#111'}}>Check-in:</strong> 2:00 PM &nbsp;·&nbsp; <strong style={{color:'#111'}}>Check-out:</strong> 11:00 AM &nbsp;·&nbsp; <Leaf size={12} style={{color:'#16a34a',display:'inline',verticalAlign:'middle'}}/> Pure Sattvic Vegetarian Property</span>
          </div>
        </div>

        {/* ─── Right sidebar ─── */}
        <div className="rcp-sidebar">
          <div className="rcp-side-card" id="rcp-sidebar-card">
            <h4>Your Stay Details</h4>

            {/* Dates */}
            <div className="rcp-dates-row">
              <div className="rcp-date-box">
                <div className="lbl">Check-in</div>
                <div className="val">{checkIn ? formatDate(checkIn) : '—'}</div>
              </div>
              <div className="rcp-nights-box">
                <div className="num">{nights}</div>
                <div className="lbl">Night{nights>1?'s':''}</div>
              </div>
              <div className="rcp-date-box">
                <div className="lbl">Check-out</div>
                <div className="val">{checkOut ? formatDate(checkOut) : '—'}</div>
              </div>
            </div>

            {/* Guests */}
            <div className="rcp-guests-row">
              <Users size={16}/>
              <div className="rcp-guests-info">
                <div className="main">{roomsCount} Room{roomsCount>1?'s':''}, {totalGuests} Guest{totalGuests>1?'s':''}</div>
                <div className="sub">Braj Nidhi Guesthouse, Vrindavan</div>
              </div>
            </div>

            {/* Live availability summary */}
            {!availLoading && (
              <div style={{
                background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,
                padding:'14px 16px',marginBottom:18,
              }}>
                <div style={{fontSize:12,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>
                  Room Availability
                </div>
                {ROOMS.map(r => {
                  const a = roomAvail[r.key];
                  const soldOut = a !== null && a < roomsCount;
                  return (
                    <div key={r.key} style={{
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'6px 0',
                      borderTop: r.key !== 'deluxe2' ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <span style={{fontSize:14,fontWeight:600,color:'#374151'}}>{r.shortName}</span>
                      {a === null ? (
                        <span style={{fontSize:13,color:'#9ca3af'}}>—</span>
                      ) : soldOut ? (
                        <span style={{fontSize:13,fontWeight:700,color:'#b91c1c'}}>Sold Out</span>
                      ) : (
                        <span style={{
                          fontSize:13,fontWeight:700,
                          color: a <= 2 ? '#c2410c' : '#166534',
                        }}>{a} room{a !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected room or prompt */}
            {Object.keys(roomSelections).some(k => roomSelections[k] > 0) ? (
              <div className="rcp-selected-summary">
                <div className="rcp-sel-label">Selected Rooms</div>
                {Object.entries(roomSelections)
                  .filter(([k, v]) => v > 0)
                  .map(([k, v]) => {
                    const room = ROOMS.find(r => r.key === k);
                    if (!room) return null;
                    return (
                      <div key={k} style={{ marginBottom: '8px' }}>
                        <div className="rcp-sel-name">{room.title}</div>
                        <div className="rcp-sel-price" style={{ fontSize: '14px' }}>
                          ₹{room.pricePerNight.toLocaleString('en-IN')} × {v} room{v > 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                })}
                <div className="rcp-sel-total" style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  Total for {nights} night{nights > 1 ? 's' : ''}:{' '}
                  <strong>
                    ₹{Object.entries(roomSelections)
                        .filter(([k, v]) => v > 0)
                        .reduce((sum, [k, v]) => {
                          const r = ROOMS.find(x => x.key === k);
                          return sum + (r ? r.pricePerNight * nights * v : 0);
                        }, 0)
                        .toLocaleString('en-IN')}
                  </strong>
                  <span style={{fontSize:'11px',color:'#9CA3AF',marginLeft:'4px'}}>+ taxes</span>
                </div>
              </div>
            ) : (
              <div className="rcp-no-select">
                ← Add rooms to see pricing & proceed
              </div>
            )}

            {Object.keys(roomSelections).some(k => roomSelections[k] > 0) ? (
              <Link href={bookingUrl()} className="btn-book-now">
                Proceed to Book <ArrowRight size={16}/>
              </Link>
            ) : (
              <div style={{width:'100%',padding:'15px',background:'#e5e7eb',color:'#9CA3AF',fontSize:'15px',fontWeight:700,borderRadius:'10px',textAlign:'center',marginBottom:'10px',cursor:'not-allowed'}}>
                Proceed to Book
              </div>
            )}
            <div className="rcp-secure">
              <ShieldCheck size={13}/>
              Secure checkout · Instant confirmation
            </div>
          </div>

          {/* Policies */}
          <div className="rcp-policy-card">
            <h4>Property Policies</h4>
            <div className="rcp-policy-item"><Clock size={14}/><span>Check-in 2:00 PM · Check-out 11:00 AM</span></div>
            <div className="rcp-policy-item"><Leaf size={14}/><span>Pure Sattvic vegetarian — no meat, alcohol or tobacco</span></div>
            <div className="rcp-policy-item"><ShieldCheck size={14}/><span>Free cancellation up to 48 hrs before arrival</span></div>
            <div className="rcp-policy-item"><Wifi size={14}/><span>Complimentary high-speed Wi-Fi in all rooms</span></div>
            <div className="rcp-policy-item"><Info size={14}/><span>Prices inclusive of 5% GST</span></div>
          </div>
        </div>

      </div>

      {/* Photo gallery lightbox */}
      {galleryOpen && (
        <div
          onClick={() => setGalleryOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}
        >
          {/* Close */}
          <button onClick={() => setGalleryOpen(false)} style={{position:'absolute',top:18,right:22,background:'none',border:'none',color:'#fff',fontSize:32,cursor:'pointer',lineHeight:1}}>×</button>

          {/* Counter */}
          <div style={{position:'absolute',top:22,left:'50%',transform:'translateX(-50%)',color:'rgba(255,255,255,.7)',fontSize:14,fontFamily:'Outfit,sans-serif'}}>
            {galleryIdx + 1} / {GALLERY_PHOTOS.length}
          </div>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length); }}
            style={{position:'absolute',left:16,background:'rgba(255,255,255,.12)',border:'none',color:'#fff',fontSize:28,width:48,height:48,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
          >‹</button>

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{maxWidth:'88vw',maxHeight:'82vh',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <img loading="lazy" decoding="async" src={GALLERY_PHOTOS[galleryIdx].src}
              alt={GALLERY_PHOTOS[galleryIdx].caption}
              style={{maxWidth:'100%',maxHeight:'74vh',objectFit:'contain',borderRadius:10,boxShadow:'0 8px 40px rgba(0,0,0,.6)'}} />
            <div style={{color:'rgba(255,255,255,.75)',fontSize:14,fontFamily:'Outfit,sans-serif',textAlign:'center'}}>{GALLERY_PHOTOS[galleryIdx].caption}</div>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i + 1) % GALLERY_PHOTOS.length); }}
            style={{position:'absolute',right:16,background:'rgba(255,255,255,.12)',border:'none',color:'#fff',fontSize:28,width:48,height:48,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
          >›</button>

          {/* Thumbnails strip */}
          <div onClick={e => e.stopPropagation()} style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',display:'flex',gap:8,padding:'8px 12px',background:'rgba(0,0,0,.5)',borderRadius:12,backdropFilter:'blur(6px)'}}>
            {GALLERY_PHOTOS.map((p, i) => (
              <img loading="lazy" decoding="async" key={i}
                src={p.src}
                alt={p.caption}
                onClick={() => setGalleryIdx(i)}
                style={{width:56,height:40,objectFit:'cover',borderRadius:6,cursor:'pointer',border: i === galleryIdx ? '2px solid #C89B3C' : '2px solid transparent',opacity: i === galleryIdx ? 1 : 0.6,transition:'opacity .2s,border-color .2s'}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sold-out popup */}
      <RoomUnavailablePopup
        isOpen={!!soldOutPopup}
        onClose={() => setSoldOutPopup(null)}
        roomName={soldOutPopup?.room.title ?? ''}
        requested={roomsCount}
        available={Math.max(0, roomAvail[soldOutPopup?.room.key ?? 'deluxe2'] ?? 0)}
        checkIn={checkIn}
        checkOut={checkOut}
        onTryOtherDates={() => { setSoldOutPopup(null); window.location.href = '/'; }}
        onSelectOtherRoom={() => setSoldOutPopup(null)}
      />

    </div>
  );
}

export default function RoomsComboPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f4f0e8',fontFamily:'Outfit,sans-serif'}}>
        <div style={{textAlign:'center',color:'#C89B3C'}}>
          <div style={{fontSize:28,marginBottom:10}}>✦</div>
          <div style={{fontWeight:700}}>Finding available rooms…</div>
        </div>
      </div>
    }>
      <RoomsComboContent/>
    </Suspense>
  );
}
