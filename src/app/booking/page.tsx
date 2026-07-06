"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Percent, 
  Check, 
  MapPin, 
  Compass, 
  Car, 
  CheckCircle2, 
  Sparkles, 
  Lock,
  ArrowRight,
  Info,
  Menu,
  X,
  Settings,
  Star,
  Leaf,
  BedDouble,
  Coffee,
  Wifi,
  CalendarDays,
  Moon,
  CreditCard,
  IndianRupee
} from 'lucide-react';
import InvoiceReceipt from '@/components/InvoiceReceipt';
import FloatingWidgets from '@/components/FloatingWidgets';
import BookNowButton from '@/components/BookNowButton';
import RoomUnavailablePopup from '@/components/RoomUnavailablePopup';

// Types for booking details
interface GuestDetails {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function BookingPage() {
  // Page Steps: 1 = Review, 2 = Payment details, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Room Type Selection
  const [roomSelections, setRoomSelections] = useState<Record<string, number>>({'deluxe2': 1});
  
  // Backwards compatibility for single-room logic in some components
  const roomType = Object.keys(roomSelections).find(k => roomSelections[k] > 0) || 'deluxe2';
  const rooms = Object.values(roomSelections).reduce((a, b) => a + b, 0) || 1;
  const setRoomType = (type: string) => setRoomSelections({ [type]: rooms });
  const setRooms = (n: number) => {
    const firstKey = Object.keys(roomSelections).find(k => roomSelections[k] > 0) || 'deluxe2';
    setRoomSelections({ [firstKey]: n });
  };
  
  // Interactive Dates
  const [checkIn, setCheckIn] = useState<string>('2026-05-18');
  const [checkOut, setCheckOut] = useState<string>('2026-05-20');
  
  // Interactive Dates

  // Guests
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  
  // Add-ons
  const [darshanGuide, setDarshanGuide] = useState<boolean>(false);
  const [airportCab, setAirportCab] = useState<boolean>(false);
  


  // Login State
  const [headerScrolled, setHeaderScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Guest Details Form State
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const razorpayScriptRef = useRef<boolean>(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (currentStep !== 3) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const colors = ['#FF342B', '#FFD700', '#C89B3C', '#16a34a', '#3b82f6', '#FF6B6B', '#a855f7', '#f97316'];
    const pieces = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.15,
    }));
    const start = Date.now();
    let frame: number;
    const animate = () => {
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (elapsed > 4500) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      const fade = elapsed > 3000 ? 1 - (elapsed - 3000) / 1500 : 1;
      ctx.globalAlpha = fade;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.04;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frame); };
  }, [currentStep]);

  // Payment State
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentStepText, setPaymentStepText] = useState<string>('');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string>('');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
  const [reservationError, setReservationError] = useState<{ paymentId: string; message: string } | null>(null);

  // ERP Live API Connection States
  const [reservationId, setReservationId] = useState<string>('');
  const [erpAmount, setErpAmount] = useState<number | null>(null);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'sandbox' | 'live' | 'error'>('live');
  const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
  const [availableRoomsList, setAvailableRoomsList] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    deluxe2: 3500,
    deluxe3: 4500,
    deluxe4: 5500
  });

  // ── Real-time ERP availability check ───────────────────────────────────────
  const [availMinForRange, setAvailMinForRange] = useState<number | null>(null);
  const [availChecking, setAvailChecking] = useState<boolean>(false);
  const [soldOutPopup, setSoldOutPopup] = useState<boolean>(false);
  const lastAvailKey = useRef<string>('');

  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return;
    const key = `${roomType}|${checkIn}|${checkOut}|${rooms}`;
    if (lastAvailKey.current === key) return;
    lastAvailKey.current = key;

    setAvailChecking(true);
    const ctrl = new AbortController();
    fetch(
      `/api/availability?roomType=${roomType}&from=${checkIn}&to=${checkOut}&rooms=${rooms}`,
      { signal: ctrl.signal },
    )
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.availability) return;
        const values = Object.values(data.availability as Record<string, number>);
        const min = values.length ? Math.min(...values) : 0;
        setAvailMinForRange(min);
        if (min < rooms) setSoldOutPopup(true);
      })
      .catch(() => { /* network error — keep prior state */ })
      .finally(() => setAvailChecking(false));

    return () => ctrl.abort();
  }, [roomType, checkIn, checkOut, rooms]);

  const isInsufficient =
    availMinForRange !== null && availMinForRange < rooms;

  // Quick special request badges
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [showModify, setShowModify] = useState(false);
  const [openCalendar, setOpenCalendar] = useState<'checkin' | 'checkout' | null>(null);
  const [calViewDate, setCalViewDate] = useState(new Date());
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [savedGuests, setSavedGuests] = useState<{title: string; firstName: string; lastName: string; isChild: boolean}[]>([]);
  const [newGuestTitle, setNewGuestTitle] = useState('Mr');
  const [newGuestFirstName, setNewGuestFirstName] = useState('');
  const [newGuestLastName, setNewGuestLastName] = useState('');
  const [newGuestIsChild, setNewGuestIsChild] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const requestBadges = ["Late Check-out (2 hrs)", "Spiritual Literature in Room", "Quiet Room", "Extra Bedding", "Temple Prasadam Delivery"];

  const getRoomPrice = (type: string): number => {
    switch (type) {
      case 'deluxe3': return 4500;
      case 'deluxe4': return 5500;
      case 'deluxe2':
      default:
        return 3500;
    }
  };

  const getRoomTitle = (type: string): string => {
    switch (type) {
      case 'deluxe3': return "Deluxe 3 – 3 Bedded Room";
      case 'deluxe4': return "Deluxe 4 – 4 Bedded Room";
      case 'deluxe2':
      default:
        return "Deluxe 2 – Twin Bedded Room";
    }
  };

  const getRoomImage = (type: string): string => {
    switch (type) {
      case 'deluxe3': return "/d3.webp";
      case 'deluxe4': return "/DSC05963-HDR.webp";
      case 'deluxe2':
      default:
        return "/DSC05818-HDR.webp";
    }
  };

  // Recalculate nights count based on CheckIn and CheckOut
  const getNights = (): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = getNights();

  const checkInTime  = checkIn  ? new Date(`${checkIn}T14:00:00`).toLocaleTimeString('en-US',  { hour: 'numeric', minute: '2-digit', hour12: true }) : '2:00 PM';
  const checkOutTime = checkOut ? new Date(`${checkOut}T11:00:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '11:00 AM';

  // Price calculations - displayed prices are GST-inclusive (5%)
  const gstRate = 0.05;
  const roomCost = Object.entries(roomSelections).reduce((sum, [type, count]) => {
    const price = livePrices[type] || getRoomPrice(type);
    return sum + (price * nights * count);
  }, 0);
  const pricePerNight = livePrices[roomType] || getRoomPrice(roomType);

  // Add-ons Cost
  const darshanCost = darshanGuide ? 1500 : 0;
  const cabCost = airportCab ? 2500 : 0;

  // Discounts
  const memberDiscount = 0;
  const totalInclGst = roomCost + darshanCost + cabCost - memberDiscount;
  const taxableAmount = Math.round(totalInclGst / (1 + gstRate));
  const gstAmount = totalInclGst - taxableAmount;
  const finalTotal = totalInclGst;

  // Dynamic ERP total override
  const payableTotal = erpAmount !== null ? erpAmount : finalTotal;

  // Load URL query parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeFromQuery = () => {
      const params = new URLSearchParams(window.location.search);
      
      // 1. Room Type Selection
      const selections: Record<string, number> = {};
      ['deluxe2', 'deluxe3', 'deluxe4'].forEach(key => {
        const val = params.get(key);
        if (val && !isNaN(Number(val)) && Number(val) > 0) {
          selections[key] = Number(val);
        }
      });
      
      if (Object.keys(selections).length > 0) {
        setRoomSelections(selections);
      } else {
        const paramRoom = params.get('roomType') || params.get('room') || params.get('room_type') || params.get('hotelId');
        const paramRooms = params.get('rooms');
        const qty = (paramRooms && !isNaN(Number(paramRooms))) ? Math.max(1, Number(paramRooms)) : 1;
        
        if (paramRoom) {
          const roomLower = paramRoom.toLowerCase();
          if (roomLower.includes('royal') || roomLower.includes('deluxe4') || roomLower.includes('deluxe-4') || roomLower.includes('family')) setRoomSelections({'deluxe4': qty});
          else if (roomLower.includes('deluxe3') || roomLower.includes('deluxe-3') || roomLower.includes('triple')) setRoomSelections({'deluxe3': qty});
          else setRoomSelections({'deluxe2': qty});
        }
      }

      // Helper to parse date
      const parseDateParam = (val: string | null): string | null => {
        if (!val) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        if (/^\d{8}$/.test(val)) {
          const mm = val.substring(0, 2);
          const dd = val.substring(2, 4);
          const yyyy = val.substring(4, 8);
          return `${yyyy}-${mm}-${dd}`;
        }
        return null;
      };

      // 2. Dates
      const paramCheckIn = params.get('checkin') || params.get('checkIn') || params.get('check_in');
      const parsedCheckIn = parseDateParam(paramCheckIn);

      const paramCheckOut = params.get('checkout') || params.get('checkOut') || params.get('check_out');
      const parsedCheckOut = parseDateParam(paramCheckOut);

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 2);

      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      setCheckIn(parsedCheckIn || formatDate(today));
      setCheckOut(parsedCheckOut || formatDate(tomorrow));

      // 4. Guests
      const paramAdults = params.get('adults');
      if (paramAdults && !isNaN(Number(paramAdults))) {
        setAdults(Math.max(1, Number(paramAdults)));
      }
      const paramChildren = params.get('children');
      if (paramChildren && !isNaN(Number(paramChildren))) {
        setChildren(Math.max(0, Number(paramChildren)));
      }

      // Support guests string parameter (e.g. guests=2 Adults, 1 Child)
      const paramGuests = params.get('guests');
      if (paramGuests) {
        const adultsMatch = paramGuests.match(/(\d+)\s*Adult/i);
        const childrenMatch = paramGuests.match(/(\d+)\s*Child/i);
        if (adultsMatch) {
          setAdults(Math.max(1, Number(adultsMatch[1])));
        }
        if (childrenMatch) {
          setChildren(Math.max(0, Number(childrenMatch[1])));
        }
      }

      // MMT Format e.g., roomStayQualifier=2e0e
      const rsq = params.get('roomStayQualifier') || params.get('rsc');
      if (rsq) {
        const match = rsq.match(/^(\d+)e(\d+)e?/);
        if (match) {
          setAdults(Math.max(1, Number(match[1])));
          setChildren(Math.max(0, Number(match[2])));
        }
      }

    };

    window.requestAnimationFrame(initializeFromQuery);
  }, []);

  // Sync scroll class for transparent/solid header
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to fetch live rooms search from ERP
  const searchRoomsApi = async (currentCheckIn: string, currentCheckOut: string, guestCount: number) => {
    try {
      setIsSearching(true);
      setApiErrorMsg('');

      const response = await fetch('/api/booking/search_rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: "BRAJ-NIDHI-GUEST-HOUSE-VRN",
          check_in_date: currentCheckIn,
          check_out_date: currentCheckOut,
          guests: guestCount,
          rooms: 1,
          booking_type: "Walk-In",
          hold_type: "BN-BN-VCM Web Site-0001-0001"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search rooms');
      }

      const data = await response.json();
      setApiConnectionStatus('live');
      
      if (data.availableRooms && Array.isArray(data.availableRooms)) {
        setAvailableRoomsList(data.availableRooms);

        // Website displays canonical per-night rates (deluxe2: 3500, deluxe3: 4500, deluxe4: 5500).
        // ERP returns its own per-stay/tax-adjusted amounts which differ from the website rate card,
        // so we intentionally do NOT overwrite livePrices here — that caused the displayed
        // ₹3,500/night to be silently replaced by an ERP figure (e.g. 6666.66) on the fare summary.

        // Auto-select first available room type if current selection becomes sold out
        const hasDeluxe2 = data.availableRooms.some((r: any) => erpToWebsiteType(r.roomTypeId) === 'deluxe2');
        const hasDeluxe3 = data.availableRooms.some((r: any) => erpToWebsiteType(r.roomTypeId) === 'deluxe3');
        const hasDeluxe4 = data.availableRooms.some((r: any) => erpToWebsiteType(r.roomTypeId) === 'deluxe4');

        if (roomType === 'deluxe2' && !hasDeluxe2) {
          if (hasDeluxe3) setRoomSelections({ 'deluxe3': rooms });
          else if (hasDeluxe4) setRoomSelections({ 'deluxe4': rooms });
        } else if (roomType === 'deluxe3' && !hasDeluxe3) {
          if (hasDeluxe2) setRoomSelections({ 'deluxe2': rooms });
          else if (hasDeluxe4) setRoomSelections({ 'deluxe4': rooms });
        } else if (roomType === 'deluxe4' && !hasDeluxe4) {
          if (hasDeluxe2) setRoomSelections({ 'deluxe2': rooms });
          else if (hasDeluxe3) setRoomSelections({ 'deluxe3': rooms });
        }
      }
    } catch (err: any) {
      console.error('ERP searchRoomsApi error:', err);
      setApiConnectionStatus('error');
      setApiErrorMsg(err.message || 'ERP request failed. Running in offline sandbox.');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to check room availability on live ERP API responses
  const erpToWebsiteType = (erpId: string): 'deluxe2' | 'deluxe3' | 'deluxe4' | null => {
    const id = (erpId || '').toUpperCase();
    if (id === 'BN-DELUXE-2') return 'deluxe2';
    if (id === 'BN-DELUXE-3') return 'deluxe3';
    if (id === 'BN-DELUXE-4') return 'deluxe4';
    return null;
  };

  const isCategoryAvailable = (type: 'deluxe2' | 'deluxe3' | 'deluxe4'): boolean => {
    if (apiConnectionStatus !== 'live') return true;
    if (availableRoomsList.length === 0) return false;
    return availableRoomsList.some((room: any) => erpToWebsiteType(room.roomTypeId) === type);
  };

  // Trigger API search rooms when inputs change + poll every 20s
  useEffect(() => {
    searchRoomsApi(checkIn, checkOut, adults + children);
    const id = setInterval(() => {
      searchRoomsApi(checkIn, checkOut, adults + children);
    }, 20_000);
    return () => clearInterval(id);
  }, [checkIn, checkOut, adults, children]);


  const handleRequestBadgeToggle = (badge: string) => {
    if (specialRequests.includes(badge)) {
      setSpecialRequests(prev => prev.filter(b => b !== badge));
    } else {
      setSpecialRequests(prev => [...prev, badge]);
    }
  };

  const CAL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const getCalDays = (year: number, month: number) => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells: { d: number; type: 'prev'|'cur'|'next' }[] = [];
    for (let i = firstDow - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, type: 'prev' });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ d, type: 'cur' });
    while (cells.length < 42) cells.push({ d: cells.length - daysInMonth - firstDow + 1, type: 'next' });
    return cells;
  };

  const handleCalSelect = (year: number, month: number, day: number) => {
    const val = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if (openCalendar === 'checkin') {
      setCheckIn(val);
      if (checkOut <= val) {
        const nd = new Date(year, month, day + 1);
        setCheckOut(`${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}-${String(nd.getDate()).padStart(2,'0')}`);
      }
      setOpenCalendar('checkout');
      setCalViewDate(new Date(year, month, day));
    } else {
      setCheckOut(val);
      setOpenCalendar(null);
    }
  };

  const handleAddGuest = () => {
    if (!newGuestFirstName.trim() || !newGuestLastName.trim()) return;
    setSavedGuests(prev => [...prev, { title: newGuestTitle, firstName: newGuestFirstName, lastName: newGuestLastName, isChild: newGuestIsChild }]);
    setNewGuestFirstName('');
    setNewGuestLastName('');
    setNewGuestIsChild(false);
    setNewGuestTitle('Mr');
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (razorpayScriptRef.current || (window as any).Razorpay) {
        razorpayScriptRef.current = true;
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { razorpayScriptRef.current = true; resolve(true); };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Single Pay Now handler — creates ERP reservation then opens Razorpay immediately
  const proceedToPayment = async () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      alert('Please fill out all required guest information fields before proceeding.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(guestDetails.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^(?:\+91|91)?[6789]\d{9}$/;
    if (!phoneRegex.test(guestDetails.phone.replace(/[\s-]/g, ''))) {
      alert('Please enter a valid Indian mobile number.');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    if (checkIn < todayStr) {
      alert('Backdated reservations are not allowed. Please select a valid check-in date.');
      return;
    }

    // Re-check availability right before charging — date/inventory could have changed.
    try {
      const r = await fetch(
        `/api/availability?roomType=${roomType}&from=${checkIn}&to=${checkOut}&rooms=${rooms}`,
      );
      if (r.ok) {
        const data = await r.json();
        const values = Object.values((data.availability ?? {}) as Record<string, number>);
        const min = values.length ? Math.min(...values) : 0;
        setAvailMinForRange(min);
        if (min < rooms) {
          setSoldOutPopup(true);
          return;
        }
      }
    } catch { /* let booking attempt continue if check itself failed */ }

    setPaymentLoading(true);
    setPaymentStepText('Securing your room...');
    setReservationError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Use a temporary order reference before payment completes — never generate fake reservation IDs
    const tempOrderRef = 'PAY-REQ-' + Math.floor(100000 + Math.random() * 900000);
    const amount = payableTotal;

    // Always use the canonical ERP room type IDs — override with live ERP value if available
    const erpRoomTypeMap: Record<string, string> = {
      deluxe2: 'BN-DELUXE-2',
      deluxe3: 'BN-DELUXE-3',
      deluxe4: 'BN-DELUXE-4',
    };
    let targetRoomType = erpRoomTypeMap[roomType] || 'BN-DELUXE-2';
    if (availableRoomsList.length > 0) {
      const found = availableRoomsList.find((r: any) => erpToWebsiteType(r.roomTypeId) === roomType);
      if (found?.roomTypeId) targetRoomType = found.roomTypeId;
    }

    // Load Razorpay and open checkout
    try {
      setPaymentStepText('Opening payment gateway...');
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay. Check your internet connection.');

      setPaymentStepText('Creating secure order...');
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', reservation_id: tempOrderRef }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create payment order');

      setPaymentLoading(false);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Braj Nidhi Guesthouse',
        description: `Stay Booking - ${getRoomTitle(roomType)}`,
        image: '/logo.png',
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            setPaymentLoading(true);
            setPaymentStepText('Verifying payment signature...');

            // 1. Verify Razorpay signature WITHOUT passing bookingDetails so confirmation notifications are NOT sent prematurely
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.error || 'Payment cryptographic verification failed.');
            }

            // 2. Create reservation in ERP — fail hard if ERP returns an error or dummy ID
            setPaymentStepText('Creating reservation in ERP...');
            const guestName = `${guestDetails.firstName} ${guestDetails.lastName}`.trim();
            const additionalGuestsPayload = savedGuests.map(g => ({
              guest_name: `${g.firstName} ${g.lastName}`.trim(),
              is_child: g.isChild ? 1 : 0,
            }));

            const erpRes = await fetch('/api/booking/create_reservation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                property: "BRAJ-NIDHI-GUEST-HOUSE-VRN",
                check_in_date: checkIn,
                check_out_date: checkOut,
                booking_type: "Walk-In",
                hold_type: "BN-BN-VCM Web Site-0001-0001",
                amount: payableTotal,
                total_amount: payableTotal,
                taxable_amount: taxableAmount,
                gst_amount: gstAmount,
                gst_rate: 5,
                tax_rate: 5,
                guest: {
                  name: guestName,
                  email: guestDetails.email,
                  phone: guestDetails.phone,
                },
                rooms: Object.entries(roomSelections).filter(([_, qty]) => qty > 0).map(([rt, qty]) => {
                  const roomPrice = livePrices[rt] || getRoomPrice(rt);
                  const roomTotal = roomPrice * nights * qty;
                  const roomTaxable = Math.round(roomTotal / (1 + gstRate));
                  const roomGst = roomTotal - roomTaxable;
                  return {
                    room_type: erpRoomTypeMap[rt] || 'BN-DELUXE-2',
                    qty,
                    rate: roomPrice,
                    amount: roomTotal,
                    taxable_amount: roomTaxable,
                    gst_amount: roomGst,
                    gst_rate: 5,
                    tax_rate: 5,
                    adults: Math.max(1, Math.floor(adults / rooms)),
                    children: Math.floor(children / rooms)
                  };
                }),
                additional_guests: additionalGuestsPayload,
                gateway_payment_id: response.razorpay_payment_id,
                gateway_order_id: response.razorpay_order_id,
              })
            });
            const erpResult = await erpRes.json();
            if (!erpRes.ok || erpResult.error || erpResult.exception) {
              const errDetail = erpResult.error || erpResult.exception || erpResult.message || 'Hotel server rejected reservation request';
              throw new Error(typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail));
            }

            const confirmedResId = erpResult.reservationId || erpResult.reservation_id || erpResult.name;
            if (!confirmedResId || typeof confirmedResId !== 'string' || confirmedResId.startsWith('MOCK-') || confirmedResId.trim() === '') {
              throw new Error('Hotel ERP server did not return a valid confirmed Reservation ID.');
            }

            let erpAmountConfirmed = amount; // Use exact amount paid on Razorpay (inclusive of GST)

            // 3. Confirm payment with ERP
            setPaymentStepText('Sending payment details to ERP...');
            try {
              const confirmRes = await fetch('/api/booking/confirm_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reservation_id: confirmedResId,
                  amount: erpAmountConfirmed,
                  total_amount: erpAmountConfirmed,
                  taxable_amount: taxableAmount,
                  gst_amount: gstAmount,
                  gst_rate: 5,
                  tax_rate: 5,
                  mode_of_payment: 'Bank Transfer',
                  gateway_payment_id: response.razorpay_payment_id,
                  gateway_order_id: response.razorpay_order_id,
                  gateway_signature: response.razorpay_signature,
                  payment_status: 'Captured',
                }),
              });
              const confirmData = await confirmRes.json();
              if (!confirmRes.ok) console.error('ERP confirm_payment failed:', confirmData);
              const ref = confirmData.bookingReference || confirmData.bookingRef || confirmData.reservationId || confirmData.name || confirmedResId;
              setBookingRef(ref);
            } catch (err: any) {
              console.error('ERP confirm_payment error:', err);
              setBookingRef(confirmedResId);
            }

            setRazorpayPaymentId(response.razorpay_payment_id);
            setRazorpayOrderId(response.razorpay_order_id);
            setReservationId(confirmedResId);

            // 4. Save local booking record to update website availability
            try {
              setPaymentStepText('Updating availability...');
              await fetch('/api/availability/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomType,
                  checkIn,
                  checkOut,
                  rooms,
                  adults,
                  children,
                  guestName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
                  guestEmail: guestDetails.email,
                  guestPhone: guestDetails.phone,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  erpReservationId: confirmedResId,
                }),
              });
            } catch (err: any) {
              console.error('Local booking save error:', err);
            }

            // 5. Now that reservation is confirmed in ERP, trigger confirmation email & WhatsApp notifications
            setPaymentStepText('Sending booking confirmations...');
            try {
              await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingDetails: {
                    guestName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
                    guestEmail: guestDetails.email,
                    guestPhone: guestDetails.phone,
                    roomType,
                    roomName: getRoomTitle(roomType),
                    checkIn,
                    checkOut,
                    nights,
                    rooms,
                    adults,
                    children,
                    total: payableTotal,
                    bookingRef: confirmedResId,
                    paymentId: response.razorpay_payment_id,
                  },
                }),
              });
            } catch (err: any) {
              console.error('Notification send error:', err);
            }

            setPaymentLoading(false);
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err: any) {
            console.error('Reservation processing failure after payment:', err);
            setPaymentLoading(false);
            setPaymentStepText('');
            setReservationError({
              paymentId: response?.razorpay_payment_id || 'Unknown',
              message: err.message || 'Failed to create reservation in hotel database',
            });
          }
        },
        prefill: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
          email: guestDetails.email,
          contact: guestDetails.phone,
        },
        theme: { color: '#C89B3C' },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentStepText('');
            setCurrentStep(1);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setPaymentLoading(false);
        setCurrentStep(1);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentLoading(false);
      setCurrentStep(1);
      alert(`Payment Error: ${error.message}`);
    }
  };


  return (
    <div className="booking-page-mmt">
      {/* Dynamic Scoped CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .booking-page-mmt {
          background: #f4f6f8;
          color: #000000;
          font-family: var(--font-outfit), sans-serif;
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 0;
        }

        .booking-page-mmt * {
          font-family: var(--font-outfit), sans-serif;
        }
        .booking-page-mmt h1,
        .booking-page-mmt h2,
        .booking-page-mmt h3,
        .booking-page-mmt h4,
        .booking-page-mmt h5,
        .booking-page-mmt h6 {
          font-family: var(--font-bebas-neue), cursive !important;
          font-weight: 400 !important;
          color: #000000;
          letter-spacing: 0.5px;
        }
        .booking-page-mmt p,
        .booking-page-mmt span,
        .booking-page-mmt label,
        .booking-page-mmt li,
        .booking-page-mmt small,
        .booking-page-mmt strong,
        .booking-page-mmt a {
          color: #000000;
        }

        .booking-page-mmt header {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
        }
        .booking-page-mmt header nav ul li a {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.25rem !important;
          font-weight: 400 !important;
          letter-spacing: 0.05em !important;
          color: #000000 !important;
        }
        .booking-page-mmt header .nav-btns .btn-book {
          font-family: var(--font-bebas-neue), cursive !important;
          font-size: 1.25rem !important;
          font-weight: 400 !important;
          letter-spacing: 0.05em !important;
        }

        .booking-header-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 88px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          z-index: 1000;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 5%;
          transition: all 0.3s ease;
        }

        .booking-header-bar.scrolled {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .booking-logo img {
          height: 52px;
          width: auto;
          transition: transform 0.3s;
        }
        .booking-logo img:hover {
          transform: scale(1.04);
        }

        .stepper-container {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 500;
          color: rgba(107, 114, 128, 0.6);
          position: relative;
          transition: all 0.3s;
        }

        .stepper-item.active {
          color: #1d6de5;
          font-weight: 600;
        }

        .stepper-item.completed {
          color: #16a34a;
        }

        .stepper-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          transition: all 0.3s;
          color: #6B7280;
        }

        .stepper-item.active .stepper-circle {
          background: #1d6de5;
          border-color: #1d6de5;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(29, 109, 229, 0.35);
        }

        .stepper-item.completed .stepper-circle {
          background: #16a34a;
          border-color: #16a34a;
          color: #ffffff;
        }

        .stepper-arrow {
          color: rgba(0, 0, 0, 0.12);
        }

        .booking-grid-mmt {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 8fr 4fr;
          gap: 32px;
          align-items: start;
        }

        .hero-banner {
          max-width: 1440px;
          margin: 0 auto 40px;
          padding: 44px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 28px;
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.06);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          align-items: center;
          transition: all 0.4s ease;
        }

        .hero-banner:hover {
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 25px 60px rgba(200, 155, 60, 0.1);
        }

        .hero-copy h1 {
          font-size: 3.6rem;
          line-height: 1.02;
          margin: 0 0 16px;
          color: #000000;
        }

        .hero-copy p {
          font-size: 1.1rem;
          color: #6B7280;
          line-height: 1.7;
          margin: 0 0 26px;
          max-width: 680px;
        }

        .hero-stats {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hero-stat {
          flex: 1;
          min-width: 160px;
          padding: 18px 20px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.16);
          color: #000000;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .hero-stat:hover {
          border-color: rgba(212, 175, 55, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(200, 155, 60, 0.12);
        }

        .hero-stat h3 {
          margin: 0 0 6px;
          font-size: 1.15rem;
          font-weight: 800;
          color: #C89B3C;
        }

        .hero-stat p {
          margin: 0;
          font-size: 0.92rem;
          color: #6B7280;
          line-height: 1.5;
        }

        .mmt-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.3s;
        }

        .mmt-card:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        }

        .card-header-mmt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .card-header-title {
          font-size: 18px;
          font-weight: 700;
          color: #000000;
          font-family: var(--font-outfit), sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-header-title svg {
          color: #1d6de5;
        }

        @keyframes goldBorderPulse {
          0% { border-color: rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(212, 175, 55, 0.05); }
          50% { border-color: rgba(212, 175, 55, 0.8); box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2); }
          100% { border-color: rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(212, 175, 55, 0.05); }
        }

        @keyframes goldShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes sparkleRotate {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(15deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes floatUp {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }

        @keyframes glassShimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.5; }
          100% { opacity: 0; transform: translateX(100%); }
        }

        .login-banner-card {
          background: #fff8e7;
          border: 1.5px solid rgba(245, 158, 11, 0.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }

        .login-banner-card:hover {
          border-color: #f59e0b;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
        }

        .login-banner-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .login-banner-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(212, 175, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4af37;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
        }

        .login-banner-icon svg {
          animation: sparkleRotate 3s infinite ease-in-out;
        }

        .login-banner-text h4 {
          font-size: 17.5px;
          font-weight: 800;
          margin: 0 0 6px;
          color: #000000;
          letter-spacing: 0.2px;
          line-height: 1.3;
        }

        .login-banner-text p {
          font-size: 14.5px;
          color: #6B7280;
          font-weight: 500;
          margin: 0;
          line-height: 1.4;
        }

        .btn-login-mmt {
          height: 40px;
          width: 140px;
          background: #1d6de5;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          font-family: var(--font-outfit), sans-serif;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .btn-login-mmt:hover {
          background: #1557c0;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(29, 109, 229, 0.3);
        }

        .room-review-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }

        .room-review-body {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 0;
        }

        .room-review-photo-wrap {
          position: relative;
          min-height: 270px;
          overflow: hidden;
        }

        .room-review-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .room-best-choice-ribbon {
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(135deg, #C89B3C 0%, #D4AF37 100%);
          color: #000000;
          font-size: 11px;
          font-weight: 800;
          padding: 8px 20px 8px 14px;
          clip-path: polygon(0 0, 100% 0, 88% 100%, 0 100%);
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .room-best-choice-ribbon svg {
          color: #000000;
        }

        .room-garden-view-label {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(255,255,255,0.85);
          border-radius: 30px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .room-review-info {
          padding: 24px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .room-review-title {
          font-size: 26px;
          font-weight: 900;
          color: #000000;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
          font-family: var(--font-bebas-neue), var(--font-outfit), sans-serif;
          line-height: 1.1;
        }

        .room-feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .room-feature-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid rgba(200, 155, 60, 0.15);
          background: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 600;
          color: #000000;
        }

        .room-feature-badge.red {
          border-color: rgba(200,155,60,0.25);
          color: #C89B3C;
        }

        .room-feature-badge.red svg {
          color: #C89B3C;
        }

        .room-feature-badge.green {
          border-color: rgba(22,163,74,0.2);
          background: rgba(22,163,74,0.04);
          color: #16a34a;
        }

        .room-feature-badge.green svg {
          color: #16a34a;
        }

        .date-strip-new {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 14px;
          overflow: hidden;
        }

        .date-box-new {
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: rgba(255,255,255,0.6);
        }

        .date-box-new-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .date-box-new-label svg {
          color: #C89B3C;
        }

        .date-box-new-value {
          font-size: 16px;
          font-weight: 800;
          color: #000000;
          margin: 0;
        }

        .date-nights-center {
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: rgba(200, 155, 60, 0.06);
          border-left: 1px solid rgba(212, 175, 55, 0.12);
          border-right: 1px solid rgba(212, 175, 55, 0.12);
        }

        .date-nights-center .nights-count {
          font-size: 15px;
          font-weight: 800;
          color: #C89B3C;
        }

        .date-nights-center svg {
          color: #C89B3C;
        }

        .room-review-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
          background: rgba(255, 255, 255, 0.4);
          position: relative;
          overflow: hidden;
        }

        .room-review-footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .room-review-footer-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(200, 155, 60, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C89B3C;
          flex-shrink: 0;
        }

        .room-review-footer-text h5 {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          margin: 0 0 2px;
        }

        .room-review-footer-text p {
          font-size: 12px;
          color: #6B7280;
          margin: 0;
        }

        .room-review-header-outer {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .room-review-header-left {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .room-review-header-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(200, 155, 60, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C89B3C;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .room-review-header-text h2 {
          font-size: 28px;
          font-weight: 800;
          color: #000000;
          margin: 0 0 6px;
          line-height: 1.2;
        }

        .room-review-header-text p {
          font-size: 15px;
          color: #6B7280;
          margin: 0;
        }

        .instant-confirm-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          border-radius: 30px;
          border: 1.5px solid rgba(22,163,74,0.4);
          background: rgba(22,163,74,0.05);
          color: #16a34a;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .room-review-body { grid-template-columns: 1fr; }
          .room-review-photo-wrap { min-height: 200px; }
          .room-review-header-outer { flex-direction: column; gap: 14px; }
          .room-feature-grid { grid-template-columns: 1fr; }
          .date-strip-new { grid-template-columns: 1fr; }
        }

        .stay-dates-strip {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          padding: 14px 20px;
        }

        .stay-date-box h5 {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          margin: 0 0 4px;
        }

        .stay-date-box p {
          font-size: 15px;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }

        .stay-duration-circle {
          padding: 6px 12px;
          background: rgba(200, 155, 60, 0.1);
          border: 1px solid rgba(200, 155, 60, 0.25);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #C89B3C;
          text-align: center;
        }

        .suite-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .suite-selector-card {
          border: 1.5px solid rgba(212, 175, 55, 0.12);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .suite-selector-card:hover {
          border-color: rgba(200, 155, 60, 0.35);
          background: rgba(255, 255, 255, 0.85);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(200, 155, 60, 0.08);
        }

        .suite-selector-card.selected {
          border-color: #1d6de5;
          background: rgba(29, 109, 229, 0.04);
          box-shadow: 0 4px 16px rgba(29, 109, 229, 0.12);
        }

        .suite-selector-card.selected::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 35px 35px 0;
          border-color: transparent #1d6de5 transparent transparent;
        }

        .suite-selector-card .selected-check {
          position: absolute;
          top: 4px; right: 4px;
          color: #ffffff;
          z-index: 5;
        }

        .suite-selector-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #000000;
          margin: 0 0 6px;
        }

        .suite-selector-card p {
          font-size: 13px;
          color: #6B7280;
          margin: 0 0 12px;
        }

        .suite-selector-card .price-tag {
          font-size: 18px;
          font-weight: 800;
          color: #1d6de5;
          font-family: var(--font-outfit), sans-serif;
        }

        .form-grid-mmt {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-grid-dual-mmt {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .input-wrapper-mmt {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .input-wrapper-mmt label {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: var(--font-outfit), sans-serif;
        }

        .input-wrapper-mmt input,
        .input-wrapper-mmt select,
        .input-wrapper-mmt textarea {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: var(--font-outfit), sans-serif;
          color: #000000;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }
        .input-wrapper-mmt input:focus,
        .input-wrapper-mmt select:focus,
        .input-wrapper-mmt textarea:focus {
          border-color: #1d6de5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(29, 109, 229, 0.12);
        }

        .special-requests-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .request-badge-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 10px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .request-badge-item:hover {
          border-color: rgba(200, 155, 60, 0.35);
          background: rgba(255, 255, 255, 0.9);
        }
        .request-badge-item.active {
          border-color: #C89B3C;
          background: rgba(200, 155, 60, 0.1);
          color: #C89B3C;
          font-weight: 700;
        }

        .addons-grid-mmt {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .addon-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.2s ease;
        }
        .addon-item-row:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(212, 175, 55, 0.25);
        }
        .addon-text-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .addon-icon-wrapper {
          color: #C89B3C;
          background: rgba(200, 155, 60, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .addon-text h5 {
          font-size: 14px;
          font-weight: 800;
          color: #000000;
          margin: 0 0 3px;
        }
        .addon-text p {
          font-size: 11px;
          color: #6B7280;
          margin: 0;
        }
        .addon-price-action {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .addon-price {
          font-size: 15px;
          font-weight: 800;
          color: #C89B3C;
        }
        .switch-toggle-mmt {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }
        .switch-toggle-mmt input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .switch-slider-mmt {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.1);
          transition: .3s;
          border-radius: 34px;
        }
        .switch-slider-mmt:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: #ffffff;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .switch-toggle-mmt input:checked + .switch-slider-mmt {
          background-color: #16a34a;
        }
        .switch-toggle-mmt input:checked + .switch-slider-mmt:before {
          transform: translateX(22px);
        }

        .mmt-sidebar {
          position: sticky;
          top: 130px;
          align-self: start;
        }

        .summary-card-header {
          border-bottom: 1.5px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .summary-card-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #000000;
          font-family: var(--font-outfit), sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .summary-card-header h3 svg {
          color: #1d6de5;
        }

        .summary-row-mmt {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 12px;
        }

        .summary-row-mmt.discount {
          color: #16a34a;
          font-weight: 700;
        }

        .summary-row-mmt.total {
          border-top: 1.5px solid rgba(0, 0, 0, 0.08);
          margin-top: 16px;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 800;
          color: #000000;
          font-family: var(--font-outfit), sans-serif;
        }
        .summary-row-mmt.total span:last-child {
          color: #1d6de5;
        }

        .promo-input-group input {
          flex: 1;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #000000;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          text-transform: uppercase;
        }

        .btn-apply-promo {
          padding: 10px 18px;
          background: rgba(200, 155, 60, 0.1);
          color: #C89B3C;
          border: 1px solid rgba(200, 155, 60, 0.25);
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-apply-promo:hover {
          background: #C89B3C;
          color: #000000;
        }


        .btn-primary-mmt {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1d6de5, #1557c0);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          font-family: var(--font-outfit), sans-serif;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(29, 109, 229, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.3px;
        }

        .btn-primary-mmt:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(29, 109, 229, 0.4);
        }

        .btn-primary-mmt svg {
          transition: transform 0.25s;
        }

        .btn-primary-mmt:hover svg {
          transform: translateX(4px);
        }

        .success-checkmark-card {
          max-width: 650px;
          margin: 40px auto;
          text-align: center;
          padding: 50px 40px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(200, 155, 60, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
        }

        .success-badge-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(22, 163, 74, 0.08);
          border: 2px solid #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
          margin: 0 auto 25px;
          box-shadow: 0 0 30px rgba(22, 163, 74, 0.15);
        }

        .mmt-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .mmt-modal-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(200, 155, 60, 0.3);
          border-radius: 20px;
          max-width: 440px;
          width: 100%;
          padding: 32px;
          position: relative;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.15);
        }

        .mmt-modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: transparent;
          border: none;
          color: rgba(0, 0, 0, 0.4);
          cursor: pointer;
          font-size: 20px;
          transition: color 0.3s;
        }

        .mmt-modal-close:hover {
          color: #C89B3C;
        }

        .payment-container-split {
          display: flex;
          gap: 24px;
          margin-top: 24px;
          align-items: flex-start;
        }

        .payment-tabs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 240px;
        }

        .payment-tab-btn {
          width: 100%;
          padding: 16px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          color: #6B7280;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .payment-tab-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(200, 155, 60, 0.3);
        }

        .payment-tab-btn.active {
          background: rgba(200, 155, 60, 0.08);
          border: 1.5px solid #C89B3C;
          color: #C89B3C;
          box-shadow: 0 4px 15px rgba(200, 155, 60, 0.12);
        }

        .payment-content-pane {
          flex: 1;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .secure-lock-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: #6B7280;
          margin-top: 16px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
          padding-top: 16px;
        }

        .secure-lock-bar svg {
          color: #16a34a;
        }

        .payment-loading-overlay {
          text-align: center;
          padding: 40px 20px;
        }

        .spinner-payment {
          width: 56px;
          height: 56px;
          border: 4px solid rgba(200, 155, 60, 0.15);
          border-top: 4px solid #C89B3C;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .booking-page-mmt { padding-top: 100px; }
          .hero-banner { padding: 30px; gap: 25px; }
        }

        @media (max-width: 900px) {
          .booking-grid-mmt { grid-template-columns: 1fr; padding: 0 16px; gap: 16px; }
          .mmt-sidebar { position: static; order: -1; }
          .suite-selector-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .booking-page-mmt { padding-top: 90px; padding-bottom: 40px; }
          .booking-page-mmt #main-header { padding: 10px 4% !important; }
          .booking-page-mmt #main-header nav { display: none !important; }
          .booking-page-mmt #main-header .nav-btns { display: none !important; }
          .booking-page-mmt #main-header .mobile-menu-btn { display: flex !important; }
          .hero-banner { grid-template-columns: 1fr; text-align: center; padding: 24px 20px; border-radius: 16px; }
          .hero-banner div:last-child { text-align: center !important; margin-top: 20px; }
          .hero-banner div:last-child img { max-width: 100% !important; }
          .hero-stats { flex-direction: column; gap: 16px; text-align: left; margin-top: 24px; }
          .hero-stat { min-width: 100%; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.06); }
          .hero-stat:last-child { border-bottom: none; }
          .room-review-split { grid-template-columns: 1fr; gap: 16px; }
          .room-review-image { height: 200px; }
          .form-grid-mmt { grid-template-columns: 1fr; gap: 12px; }
        }

        @media (max-width: 600px) {
          .stepper-container { gap: 8px; justify-content: space-between; width: 100%; }
          .stepper-item span:last-child { display: none; }
          .stepper-item.active span:last-child { display: inline-block; font-size: 11px; }
          .stepper-circle { width: 26px !important; height: 26px !important; font-size: 11px !important; }
          .form-grid-dual-mmt { grid-template-columns: 1fr; gap: 12px; }
          .stay-dates-strip { grid-template-columns: 1fr; gap: 12px; text-align: center; }
          .stay-date-box { text-align: center !important; }
          .stay-duration-circle { margin: 0 auto; width: fit-content; }
          .mmt-card { padding: 20px 16px; }
          .special-requests-badges { gap: 8px; }
          .request-badge-item { padding: 8px 12px; font-size: 11px; }
        }

        @media (max-width: 500px) {
          .addon-item-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .addon-price-action { width: 100%; justify-content: space-between; border-top: 1px solid rgba(0, 0, 0, 0.05); padding-top: 8px; }
        }

        @media (max-width: 480px) {
          .payment-tabs { flex-direction: column; gap: 6px; background: transparent; border: none; padding: 0; }
          .payment-tab-btn { background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 8px; width: 100%; }
        }

        /* Dates row — stack to 2×2 grid on very small screens */
        .bk-dates-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr 1fr;
          gap: 0;
          align-items: stretch;
        }
        @media (max-width: 400px) {
          .bk-dates-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px 8px !important;
          }
          .bk-dates-row > div {
            padding: 0 !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb;
          }
          .bk-dates-row > div:nth-child(1),
          .bk-dates-row > div:nth-child(2) {
            border-bottom: 1px solid #e5e7eb;
          }
          .bk-dates-row > div:nth-child(3),
          .bk-dates-row > div:nth-child(4) {
            border-bottom: none;
          }
          /* Hide the nights circle on tiny screens — shown inline in Check-in col */
          .bk-nights-bubble { display: none !important; }
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          animation: fadeInMmt 0.25s ease;
        }

        .mobile-menu-drawer {
          width: 80%;
          max-width: 320px;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.12);
          padding: 30px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: slideInMmt 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          padding-bottom: 20px;
        }

        .mobile-menu-close {
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-nav-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mobile-nav-links ul li a {
          font-size: 18px;
          font-weight: 600;
          color: #000000 !important;
          text-decoration: none !important;
          transition: color 0.3s;
          display: block;
        }

        .mobile-nav-links ul li a:hover {
          color: #C89B3C !important;
        }

        .mobile-menu-footer {
          border-top: 1px solid rgba(212, 175, 55, 0.1);
          padding-top: 24px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mobile-user-profile {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        @keyframes fadeInMmt {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInMmt {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .confirmation-mmt-wrapper { max-width: 1280px; margin: 0 auto; padding: 0 0 60px; }
        .conf-status-header { display: flex; flex-direction: column; gap: 8px; padding-bottom: 30px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); margin-bottom: 30px; }
        .conf-check-circle { width: 56px; height: 56px; border-radius: 50%; background: rgba(22,163,74,0.08); border: 2px solid rgba(22,163,74,0.2); display: flex; align-items: center; justify-content: center; color: #16a34a; margin-bottom: 8px; }
        .conf-status-label { font-size: 22px; color: #16a34a; font-weight: 800; letter-spacing: 0.3px; }
        .conf-status-title { font-size: 42px; font-weight: 800; color: #000000; line-height: 1.1; margin: 0; }
        .conf-action-pills { display: flex; gap: 12px; margin-top: 10px; }
        /* ── Add to Calendar button ── */
        .atc-btn { display: flex; justify-content: center; align-items: center; padding: 9px 12px; gap: 8px; height: 40px; width: 201px; border: none; background: #FF342B; border-radius: 20px; cursor: pointer; }
        .atc-btn .atc-label { line-height: 22px; font-size: 17px; color: #fff; font-family: var(--font-outfit), sans-serif; letter-spacing: 1px; }
        .atc-btn:hover { background: #e52e26; }
        .atc-btn:hover .atc-icon { animation: atc-slope 1s linear infinite; }
        @keyframes atc-slope { 50% { transform: rotate(10deg); } }
        .confirmation-split { display: grid; grid-template-columns: 360px 1fr; gap: 32px; align-items: start; }
        .conf-left-card { background: rgba(255,255,255,0.9); backdrop-filter: blur(16px); border-radius: 18px; border: 1px solid rgba(212,175,55,0.18); overflow: hidden; box-shadow: 0 6px 28px rgba(0,0,0,0.08); position: sticky; top: 100px; }
        .conf-left-image { width: 100%; height: 200px; object-fit: cover; display: block; }
        .conf-left-body { padding: 22px; }
        .conf-room-title-line { display: flex; flex-direction: column; gap: 5px; padding-bottom: 16px; border-bottom: 1px solid rgba(212,175,55,0.1); margin-bottom: 16px; }
        .conf-room-title-line h3 { font-size: 18px; font-weight: 800; color: #000000; margin: 0; font-family: var(--font-bebas-neue), cursive; letter-spacing: 0.5px; }
        .conf-room-title-line span { font-size: 13px; color: #6B7280; font-weight: 500; }
        .conf-price-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(212,175,55,0.1); margin-bottom: 16px; }
        .conf-price-tag { display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 700; color: #000000; }
        .conf-ref-badge { font-size: 12px; background: rgba(200,155,60,0.08); border: 1px solid rgba(200,155,60,0.2); color: #C89B3C; border-radius: 6px; padding: 5px 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; }
        .conf-property-box { display: flex; align-items: center; gap: 12px; padding-top: 4px; }
        .conf-property-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(200,155,60,0.25); }
        .conf-property-details h4 { font-size: 15px; font-weight: 800; color: #000000; margin: 0 0 2px; }
        .conf-property-details span { font-size: 12px; color: #6B7280; }
        .conf-right-side { display: flex; flex-direction: column; gap: 20px; }
        .conf-accordion { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(212,175,55,0.14); border-radius: 16px; overflow: hidden; box-shadow: 0 3px 16px rgba(0,0,0,0.05); }
        .conf-accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 26px; border-bottom: 1px solid rgba(212,175,55,0.1); font-size: 17px; font-weight: 700; color: #000000; }
        .conf-detail-row { display: flex; align-items: center; padding: 18px 26px; border-bottom: 1px solid rgba(212,175,55,0.08); gap: 18px; }
        .conf-detail-row:last-child { border-bottom: none; }
        .conf-detail-icon { width: 38px; display: flex; align-items: center; justify-content: center; color: #C89B3C; flex-shrink: 0; }
        .conf-detail-label { width: 140px; font-size: 15px; color: #6B7280; flex-shrink: 0; }
        .conf-detail-value { flex: 1; font-size: 16px; font-weight: 600; color: #000000; }
        .conf-detail-actions { display: flex; gap: 8px; margin-left: auto; }
        .conf-action-btn { display: flex; align-items: center; gap: 5px; padding: 8px 16px; border: 1px solid rgba(200,155,60,0.2); border-radius: 8px; font-size: 13px; font-weight: 600; color: #6B7280; background: transparent; cursor: pointer; transition: all 0.2s; }
        .conf-action-btn:hover { border-color: #C89B3C; color: #C89B3C; }
        .conf-guest-section-title { padding: 18px 26px 4px; font-size: 13px; font-weight: 800; color: rgba(44,37,32,0.55); letter-spacing: 0.6px; text-transform: uppercase; }
        .conf-guest-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 14px 26px 24px; }
        .conf-guest-card { background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(200,155,60,0.04)); border: 1px solid rgba(200,155,60,0.22); border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(200,155,60,0.06); }
        .conf-guest-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(200,155,60,0.18); }
        .conf-guest-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #C89B3C, #D4AF37); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(200,155,60,0.35); letter-spacing: 0.5px; }
        .conf-guest-info { flex: 1; min-width: 0; }
        .conf-guest-info h5 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: 0.2px; }
        .conf-guest-info span { font-size: 14px; color: #6B7280; font-weight: 500; display: block; }
        .conf-paid-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #16a34a; font-weight: 700; margin-top: 10px; padding: 5px 11px; background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.22); border-radius: 999px; }
        .conf-bottom-actions { display: flex; align-items: center; gap: 20px; margin-top: 24px; flex-wrap: wrap; }
        /* ── Return to Home button ── */
        .rth-btn { position: relative; overflow: hidden; border: 1px solid #18181a; color: #18181a; display: inline-block; font-size: 15px; line-height: 15px; padding: 18px 28px 17px; cursor: pointer; background: #fff; user-select: none; font-family: var(--font-outfit), sans-serif; font-weight: 600; text-decoration: none; }
        .rth-btn span:first-child { position: relative; transition: color 600ms cubic-bezier(0.48, 0, 0.12, 1); z-index: 10; }
        .rth-btn span:last-child { color: white; display: block; position: absolute; bottom: 0; transition: all 500ms cubic-bezier(0.48, 0, 0.12, 1); z-index: 100; opacity: 0; top: 50%; left: 50%; transform: translateY(225%) translateX(-50%); height: 14px; line-height: 13px; white-space: nowrap; }
        .rth-btn::after { content: ""; position: absolute; bottom: -50%; left: 0; width: 100%; height: 100%; background-color: black; transform-origin: bottom center; transition: transform 600ms cubic-bezier(0.48, 0, 0.12, 1); transform: skewY(9.3deg) scaleY(0); z-index: 50; }
        .rth-btn:hover::after { transform: skewY(9.3deg) scaleY(2); }
        .rth-btn:hover span:last-child { transform: translateX(-50%) translateY(-50%); opacity: 1; transition: all 900ms cubic-bezier(0.48, 0, 0.12, 1); }
        /* ── Print Receipt Button (Valorant style) ── */
        .pr-btn-wrap { display: none; }
        .vb-borders { position: relative; width: fit-content; height: fit-content; }
        .vb-borders::before { content: ""; position: absolute; width: calc(100% + 0.5em); height: 50%; left: -0.3em; top: -0.3em; border: 1px solid #0E1822; border-bottom: 0; }
        .vb-borders::after { content: ""; position: absolute; width: calc(100% + 0.5em); height: 50%; left: -0.3em; bottom: -0.3em; border: 1px solid #0E1822; border-top: 0; z-index: 0; }
        .vb-btn { font-family: var(--font-outfit), sans-serif; color: white; cursor: pointer; font-size: 13px; font-weight: 700; letter-spacing: 0.05rem; border: 1px solid #0E1822; padding: 0.8rem 2.1rem; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 531.28 200'%3E%3Cpolygon fill='%23FF4655' points='415.81 200 0 200 115.47 0 531.28 0 415.81 200'/%3E%3C/svg%3E"); background-color: #0E1822; background-size: 200%; background-position: 200%; background-repeat: no-repeat; transition: background-position 0.3s ease-in-out, border 0.3s ease-in-out, color 0.3s ease-in-out; position: relative; z-index: 1; }
        .vb-btn:hover { border: 1px solid #FF4655; color: white; background-position: 40%; }
        .vb-btn::before { content: ""; position: absolute; background-color: #0E1822; width: 0.2rem; height: 0.2rem; top: -1px; left: -1px; transition: background-color 0.15s ease-in-out; }
        .vb-btn::after { content: ""; position: absolute; background-color: #FF4655; width: 0.3rem; height: 0.3rem; bottom: -1px; right: -1px; transition: background-color 0.15s ease-in-out; }
        .vb-btn:hover::before { background-color: white; }
        .vb-btn:hover::after { background-color: white; }


        /* ── Footer reset: fully restore global site-footer styles ── */
        .booking-page-mmt .site-footer {
          background: #ffffff !important;
          color: #111111 !important;
          padding: 80px 8% 0 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          z-index: auto !important;
        }
        .booking-page-mmt .footer-top-links {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 30px !important;
          margin: 0 auto 80px auto !important;
          max-width: 1400px !important;
          width: 100% !important;
        }
        .booking-page-mmt .footer-col h3 {
          font-family: var(--font-outfit), sans-serif !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: #111 !important;
          margin-bottom: 25px !important;
          letter-spacing: normal !important;
        }
        .booking-page-mmt .site-footer .footer-col a {
          display: block !important;
          font-family: var(--font-outfit), sans-serif !important;
          color: #666 !important;
          text-decoration: none !important;
          margin-bottom: 15px !important;
          font-size: 0.95rem !important;
          transition: color 0.3s ease !important;
        }
        .booking-page-mmt .site-footer .footer-col a:hover {
          color: #2563eb !important;
        }
        .booking-page-mmt .footer-middle-bar {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 30px 0 !important;
          border-top: 1px solid #eaeaea !important;
          border-bottom: 1px solid #eaeaea !important;
          max-width: 1400px !important;
          margin: 0 auto !important;
          width: 100% !important;
          font-family: var(--font-outfit), sans-serif !important;
          font-size: 0.9rem !important;
          color: #666 !important;
          font-weight: 500 !important;
        }
        .booking-page-mmt .site-footer .footer-middle-bar a,
        .booking-page-mmt .site-footer .footer-middle-bar span {
          font-family: var(--font-outfit), sans-serif !important;
          color: #666 !important;
        }
        .booking-page-mmt .site-footer .footer-middle-bar a:hover {
          color: #2563eb !important;
        }
        .booking-page-mmt .footer-massive-text {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          font-size: 14.5vw !important;
          font-weight: 900 !important;
          line-height: 0.75 !important;
          text-transform: uppercase !important;
          text-align: center !important;
          background: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920') center 60% / cover !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          color: transparent !important;
          padding-top: 40px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          letter-spacing: -0.06em !important;
          width: 100% !important;
          user-select: none !important;
        }
        @media (max-width: 992px) {
          .booking-page-mmt .footer-top-links {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 40px !important;
          }
          .booking-page-mmt .footer-massive-text {
            font-size: 15vw !important;
            padding-top: 30px !important;
            letter-spacing: -0.05em !important;
          }
        }
        @media (max-width: 600px) {
          .booking-page-mmt .footer-top-links {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .booking-page-mmt .footer-middle-bar {
            flex-direction: column !important;
            gap: 10px !important;
            text-align: center !important;
          }
        }

        @media (max-width: 900px) {
          .confirmation-split { grid-template-columns: 1fr; }
          .conf-left-card { position: static; }
          .conf-status-title { font-size: 28px; }
          .conf-guest-cards { grid-template-columns: 1fr; }
          .conf-detail-label { width: 110px; font-size: 13px; }
          .conf-detail-value { font-size: 14px; }
        }
      ` }} />


      {/* 1. STUNNING HEADER NAVIGATION IN MMT STYLE */}
      <header id="main-header" className={headerScrolled ? "scrolled" : ""}>
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
              <BookNowButton href="/guesthouse#rooms-suites" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', textAlign: 'center', marginTop: '4px' }} />
            </div>
          </div>
        </div>
      )}

      {/* 2. BODY CONTENT SECTION */}
      <main style={{ marginTop: '20px', paddingBottom: '80px' }}>
        
        {currentStep === 1 && (
          <>
            <div className="booking-grid-mmt">
            
            {/* LEFT SIDE CONTENT - GUEST & ROOM SELECTIONS */}
            <div>
              
              {/* MMT-style review heading */}
              <h2 style={{ fontSize: '36px', fontFamily: 'var(--font-bebas-neue), cursive', fontWeight: 400, letterSpacing: '0.5px', color: '#000', marginBottom: '20px', marginTop: '0' }}>Review your Booking</h2>

              {/* Hotel + Stay Summary Card */}
              <div className="mmt-card" style={{ marginBottom: '16px', padding: '20px 24px' }}>

                {/* Hotel top: name + stars + address + room thumb */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '5px', color: '#111' }}>Braj Nidhi Guesthouse</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#f59e0b" stroke="none"/>)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} style={{ color: '#C89B3C' }}/>
                      Vrindavan, Uttar Pradesh
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {Object.entries(roomSelections).filter(([_, count]) => count > 0).map(([rt, count]) => (
                      <div key={rt} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{count}x {getRoomTitle(rt).split(' – ')[0]}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280' }}>₹{getRoomPrice(rt)} / night</div>
                        </div>
                        <img loading="lazy" decoding="async" src={getRoomImage(rt)} alt={rt} style={{ width: '54px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', margin: '14px 0' }}/>

                {/* Dates / Nights / Guests display row */}
                <div className="bk-dates-row">
                  <div style={{ paddingRight: '16px', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>CHECK IN</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', lineHeight: 1.3 }}>
                      {new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>{checkInTime}</div>
                  </div>

                  <div className="bk-nights-bubble" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }}>
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px', padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#1d4ed8', lineHeight: 1 }}>{nights}</div>
                      <div style={{ fontSize: '9px', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nights</div>
                    </div>
                  </div>

                  <div style={{ padding: '0 16px', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>CHECK OUT</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', lineHeight: 1.3 }}>
                      {new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>{checkOutTime}</div>
                  </div>

                  <div style={{ paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>GUESTS & ROOMS</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', lineHeight: 1.3 }}>
                      {nights} Nights · {adults + children} Guest{adults + children > 1 ? 's' : ''} · {rooms} Room{rooms > 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>
                      {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
                    </div>
                  </div>
                </div>

                {/* Modify toggle */}
                <button
                  onClick={() => setShowModify(!showModify)}
                  style={{ marginTop: '14px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', color: '#1d6de5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                >
                  <Calendar size={13}/>
                  {showModify ? 'Close Modify Panel' : 'Modify Dates / Guests'}
                </button>

                {/* Inline edit panel */}
                {showModify && (
                  <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', marginTop: '12px' }}>

                    {/* Check-in / Check-out buttons */}
                    <div style={{ display: 'flex', gap: '1px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                      {(['checkin','checkout'] as const).map(type => {
                        const val = type === 'checkin' ? checkIn : checkOut;
                        const label = type === 'checkin' ? 'Check-in' : 'Check-out';
                        const isOpen = openCalendar === type;
                        const formatted = val ? new Date(val + 'T00:00:00').toLocaleDateString('en-GB').replace(/\//g,'/') : 'Select';
                        return (
                          <button key={type} onClick={() => { setOpenCalendar(isOpen ? null : type); setCalViewDate(new Date((val || new Date().toISOString().split('T')[0]) + 'T00:00:00')); }} style={{ flex:1, padding:'12px 14px', background: isOpen ? '#fff' : '#f9fafb', border: isOpen ? '2px solid #1d6de5' : '2px solid transparent', borderRadius:'10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                            <div style={{ fontSize:'10px', color:'#6B7280', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>{label}</div>
                            <div style={{ fontSize:'15px', fontWeight:'700', color:'#111' }}>{formatted}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Calendar popup */}
                    {openCalendar && (() => {
                      const yr = calViewDate.getFullYear();
                      const mo = calViewDate.getMonth();
                      const todayStr = new Date().toISOString().split('T')[0];
                      const selStr = openCalendar === 'checkin' ? checkIn : checkOut;
                      return (
                        <div style={{ background:'#fff', borderRadius:'10px', border:'1px solid #e5e7eb', boxShadow:'0 6px 20px rgba(0,0,0,0.1)', padding:'10px 12px', marginBottom:'10px', maxWidth:'280px' }}>
                          {/* Month nav */}
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                            <button onClick={() => setCalViewDate(new Date(yr, mo - 1, 1))} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', fontSize:'13px', padding:'3px 7px', borderRadius:'5px' }}>◄</button>
                            <div style={{ fontSize:'12px', fontWeight:'600', color:'#111', background:'#f3f4f6', padding:'4px 12px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'4px' }}>
                              {CAL_MONTHS[mo]} {yr} <span style={{ fontSize:'9px', color:'#6B7280' }}>▼</span>
                            </div>
                            <button onClick={() => setCalViewDate(new Date(yr, mo + 1, 1))} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', fontSize:'13px', padding:'3px 7px', borderRadius:'5px' }}>►</button>
                          </div>
                          {/* Weekday headers */}
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'2px' }}>
                            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                              <div key={d} style={{ textAlign:'center', fontSize:'9px', fontWeight:'700', color: d==='Sa'||d==='Su' ? '#ef4444' : '#9CA3AF', padding:'2px 0' }}>{d}</div>
                            ))}
                          </div>
                          {/* Date cells */}
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px' }}>
                            {getCalDays(yr, mo).map((cell, idx) => {
                              const ds = cell.type === 'cur' ? `${yr}-${String(mo+1).padStart(2,'0')}-${String(cell.d).padStart(2,'0')}` : '';
                              const isSel = ds === selStr;
                              const isToday = ds === todayStr;
                              const isPast = ds && ds < todayStr;
                              const disabled = cell.type !== 'cur' || !!isPast;
                              return (
                                <button key={idx} disabled={disabled} onClick={() => !disabled && handleCalSelect(yr, mo, cell.d)}
                                  style={{ border: isToday && !isSel ? '1.5px solid #1d6de5' : 'none', borderRadius:'50%', background: isSel ? '#1d6de5' : 'transparent', color: isSel ? '#fff' : cell.type !== 'cur' || isPast ? '#d1d5db' : '#111', fontSize:'11px', fontWeight: isSel ? '700' : '400', cursor: disabled ? 'default' : 'pointer', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', padding:'3px', opacity: cell.type !== 'cur' ? 0.3 : 1, transition:'background 0.15s' }}
                                >
                                  {cell.d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Guests +/- counters */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'4px' }}>
                      {[
                        { label:'Adults', sub:'', val: adults, min:1, max:6, set: setAdults },
                        { label:'Children', sub:'0 – 17 Years Old', val: children, min:0, max:6, set: setChildren }
                      ].map(({ label, sub, val, min, max, set }) => (
                        <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#fff', borderRadius:'8px', border:'1px solid #e5e7eb' }}>
                          <div>
                            <div style={{ fontSize:'14px', fontWeight:'700', color:'#111' }}>{label}</div>
                            {sub && <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'1px' }}>{sub}</div>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:'0', border:'1px solid #e5e7eb', borderRadius:'8px', overflow:'hidden', background:'#fff' }}>
                            <button onClick={() => set(Math.max(min, val - 1))} style={{ width:'34px', height:'34px', background:'none', border:'none', fontSize:'18px', fontWeight:'300', color: val <= min ? '#d1d5db' : '#374151', cursor: val <= min ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                            <span style={{ width:'32px', textAlign:'center', fontSize:'15px', fontWeight:'700', color:'#111' }}>{val}</span>
                            <button onClick={() => set(Math.min(max, val + 1))} style={{ width:'34px', height:'34px', background:'none', border:'none', fontSize:'18px', fontWeight:'300', color: val >= max ? '#d1d5db' : '#374151', cursor: val >= max ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }}/>

                {/* Room type row */}
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
                    {adults + children} x {getRoomTitle(roomType)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#374151' }}>• Room Only</span>
<span style={{ fontSize: '12px', color: '#374151' }}>• Free High-Speed Wi-Fi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <ShieldCheck size={13} style={{ color: '#16a34a' }}/>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Free cancellation up to 48 hours before check-in</span>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="mmt-card" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'Outfit, sans-serif', fontWeight: '700', color: '#111', marginBottom: '16px' }}>Important Information</h3>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f0fdf4', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>Spiritual Property Rules</span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 10px' }}>
                      Braj Nidhi is a strictly sattvic heritage property dedicated to devotional living.
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      <li style={{ fontSize: '13px', color: '#374151' }}>Primary Guest must be at least 18 years of age.</li>
                      <li style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>No meat, alcohol, or tobacco permitted anywhere on the property.</li>
                      <li style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>Smoking strictly prohibited inside rooms and all common areas.</li>
                      <li style={{ fontSize: '13px', color: '#374151' }}>Male-only groups and family groups are welcome.</li>
                      <li style={{ fontSize: '13px', color: '#374151' }}>Valid ID proof required at check-in: Aadhaar, Passport, Driving Licence, or Voter ID.</li>
                      <li style={{ fontSize: '13px', color: '#374151' }}>Check-in: {checkInTime} &nbsp;·&nbsp; Check-out: {checkOutTime}</li>
                      <li style={{ fontSize: '13px', color: '#374151' }}>Free cancellation up to 48 hours before check-in. No refund thereafter.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 2 removed — dates/guests now editable in hotel summary card above */}
              {false && <div className="mmt-card">
                <div className="card-header-mmt">
                  <div className="card-header-title">
                    <Calendar size={18} />
                    <span>Customize Room &amp; Calendar Selections</span>
                  </div>
                </div>

                {/* Real-time ERP Sync Status Bar */}
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.02)', 
                  border: '1px solid rgba(0, 0, 0, 0.05)', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSearching ? (
                      <div className="spinner-payment" style={{ width: '16px', height: '16px', borderWidth: '2px', animation: 'spin 1s linear infinite', borderTopColor: '#C89B3C', margin: 0 }}></div>
                    ) : (
                      <span className={`status-dot ${apiConnectionStatus}`} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#000000' }}>
                      {isSearching ? 'Syncing live inventory from ERP...' : 
                       apiConnectionStatus === 'live' ? 'Live ERP Connected' : 
                       apiConnectionStatus === 'error' ? 'ERP Sync Interrupted (Sandbox active)' : 
                       'Sandbox Simulator Active'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => searchRoomsApi(checkIn, checkOut, adults + children)}
                      className="btn-apply-promo"
                      disabled={isSearching}
                      style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}
                    >
                      Search / Sync Rooms
                    </button>
                  </div>
                </div>

                {/* Grid Room Selector */}
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(44, 37, 32, 0.9)', marginBottom: '12px' }}>
                  Select Suite Category
                </h4>
                <div className="suite-selector-grid" style={{ marginBottom: '24px' }}>
                  {/* Deluxe 2 Card */}
                  {(() => {
                    const available = isCategoryAvailable('deluxe2');
                    return (
                      <div 
                        onClick={() => available && setRoomType('deluxe2')} 
                        className={`suite-selector-card ${roomType === 'deluxe2' ? 'selected' : ''}`}
                        style={{
                          opacity: available ? 1 : 0.5,
                          cursor: available ? 'pointer' : 'not-allowed',
                          pointerEvents: available ? 'auto' : 'none'
                        }}
                      >
                        {roomType === 'deluxe2' && <Check size={10} strokeWidth={3} className="selected-check" />}
                        <h4>Deluxe 2 – Twin Bedded Room</h4>
                        <p>Ideal for 2 Adults</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span className="price-tag">₹{livePrices.deluxe2.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 'normal', color: 'rgba(44, 37, 32, 0.5)' }}> / night</span></span>
                          {!available && (
                            <span className="badge-pill-mmt accent" style={{ background: 'rgba(200, 155, 60, 0.08)', borderColor: 'rgba(200, 155, 60, 0.25)', color: '#C89B3C', fontSize: '10px', fontWeight: '800' }}>Sold Out on ERP</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Deluxe 3 Card */}
                  {(() => {
                    const available = isCategoryAvailable('deluxe3');
                    return (
                      <div 
                        onClick={() => available && setRoomType('deluxe3')} 
                        className={`suite-selector-card ${roomType === 'deluxe3' ? 'selected' : ''}`}
                        style={{
                          opacity: available ? 1 : 0.5,
                          cursor: available ? 'pointer' : 'not-allowed',
                          pointerEvents: available ? 'auto' : 'none'
                        }}
                      >
                        {roomType === 'deluxe3' && <Check size={10} strokeWidth={3} className="selected-check" />}
                        <h4>Deluxe 3 – 3 Bedded Room</h4>
                        <p>Ideal for 2 Adults + 1 Child OR 3 Adults</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span className="price-tag">₹{livePrices.deluxe3.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 'normal', color: 'rgba(44, 37, 32, 0.5)' }}> / night</span></span>
                          {!available && (
                            <span className="badge-pill-mmt accent" style={{ background: 'rgba(200, 155, 60, 0.08)', borderColor: 'rgba(200, 155, 60, 0.25)', color: '#C89B3C', fontSize: '10px', fontWeight: '800' }}>Sold Out on ERP</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Deluxe 4 Card */}
                  {(() => {
                    const available = isCategoryAvailable('deluxe4');
                    return (
                      <div 
                        onClick={() => available && setRoomType('deluxe4')} 
                        className={`suite-selector-card ${roomType === 'deluxe4' ? 'selected' : ''}`}
                        style={{
                          opacity: available ? 1 : 0.5,
                          cursor: available ? 'pointer' : 'not-allowed',
                          pointerEvents: available ? 'auto' : 'none'
                        }}
                      >
                        {roomType === 'deluxe4' && <Check size={10} strokeWidth={3} className="selected-check" />}
                        <h4>Deluxe 4 – 4 Bedded Room</h4>
                        <p>Ideal for 3 Adults + 1 Child OR 4 Adults</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span className="price-tag">₹{livePrices.deluxe4.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 'normal', color: 'rgba(44, 37, 32, 0.5)' }}> / night</span></span>
                          {!available && (
                            <span className="badge-pill-mmt accent" style={{ background: 'rgba(200, 155, 60, 0.08)', borderColor: 'rgba(200, 155, 60, 0.25)', color: '#C89B3C', fontSize: '10px', fontWeight: '800' }}>Sold Out on ERP</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Inputs for Dates */}
                <div className="form-grid-dual-mmt">
                  <div className="input-wrapper-mmt">
                    <label>Change Check-in Date</label>
                    <input 
                      type="date" 
                      value={checkIn}
                      min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="input-wrapper-mmt">
                    <label>Change Check-out Date</label>
                    <input 
                      type="date" 
                      value={checkOut}
                      min={checkIn || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dropdowns for Adults & Children */}
                <div className="form-grid-dual-mmt">
                  <div className="input-wrapper-mmt">
                    <label>Adults (Above 12 yrs)</label>
                    <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>
                  <div className="input-wrapper-mmt">
                    <label>Children (0 - 12 yrs)</label>
                    <select value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                      <option value={0}>No Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3 Children</option>
                    </select>
                  </div>
                </div>
              </div>}

              {/* Card 3: Guest Contact Details */}
              <div className="mmt-card">
                <div className="card-header-mmt">
                  <div className="card-header-title">
                    <Users size={18} />
                    <span>Primary Guest Details</span>
                  </div>
                  <button
                    onClick={() => setShowAddGuestModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#1d6de5', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: '4px 0', fontFamily: 'Outfit, sans-serif' }}
                  >
                    + Add Guest
                  </button>
                </div>

                {/* Saved Guests List */}
                {savedGuests.length > 0 && (
                  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {savedGuests.map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#1d6de5', flexShrink: 0 }}>
                            {g.firstName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{g.firstName} {g.lastName}</div>
                            {g.isChild && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Below 12 years</div>}
                          </div>
                        </div>
                        <button onClick={() => setSavedGuests(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-grid-mmt">
                  <div className="input-wrapper-mmt">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      placeholder="First name"
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="input-wrapper-mmt">
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      placeholder="Last name"
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-grid-dual-mmt">
                  <div className="input-wrapper-mmt">
                    <label>Email Address *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        placeholder="email@example.com" 
                        style={{ 
                          paddingLeft: '40px', 
                          width: '100%', 
                          borderColor: guestDetails.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(guestDetails.email) ? '#ef4444' : undefined 
                        }}
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'rgba(0,0,0,0.35)' }} />
                    </div>
                    {guestDetails.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(guestDetails.email) && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>Please enter a valid email address</div>
                    )}
                  </div>
                  <div className="input-wrapper-mmt">
                    <label>Mobile Number *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX"
                        style={{ 
                          paddingLeft: '40px', 
                          width: '100%',
                          borderColor: guestDetails.phone && !/^(?:\+91|91)?[6789]\d{9}$/.test(guestDetails.phone.replace(/[\s-]/g, '')) ? '#ef4444' : undefined 
                        }}
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'rgba(0,0,0,0.35)' }} />
                    </div>
                    {guestDetails.phone && !/^(?:\+91|91)?[6789]\d{9}$/.test(guestDetails.phone.replace(/[\s-]/g, '')) && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>Please enter a valid Indian mobile number</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms + PAY NOW */}
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: termsAccepted ? '16px' : '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#1d6de5', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer', outline: !termsAccepted ? '1px solid #ef4444' : 'none' }}
                  />
                  <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                    By proceeding, I agree to Braj Nidhi's{' '}
                    <a href="/terms" style={{ color: '#1d6de5', textDecoration: 'none', fontWeight: '600' }}>Terms of Service</a>,{' '}
                    <a href="/privacy" style={{ color: '#1d6de5', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</a> and{' '}
                    <a href="/cancellation-policy" style={{ color: '#1d6de5', textDecoration: 'none', fontWeight: '600' }}>Cancellation &amp; Property Booking Policies</a>.
                  </span>
                </label>
                {!termsAccepted && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px', fontWeight: '500', paddingLeft: '25px' }}>
                    Please check this box to agree to the policies and proceed
                  </div>
                )}
                {(() => {
                  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(guestDetails.email || '');
                  const isPhoneValid = /^(?:\+91|91)?[6789]\d{9}$/.test((guestDetails.phone || '').replace(/[\s-]/g, ''));
                  const isFormValid = (guestDetails.firstName || '').trim() && (guestDetails.lastName || '').trim() && isEmailValid && isPhoneValid;
                  const isDisabled = isInsufficient || availChecking || !isFormValid || !termsAccepted;

                  return (
                    <button
                      onClick={isInsufficient ? () => setSoldOutPopup(true) : proceedToPayment}
                      disabled={isDisabled}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: isDisabled
                          ? '#d1d5db'
                          : 'linear-gradient(135deg, #1565C0, #1976D2, #1E88E5)',
                        color: isDisabled ? '#6b7280' : '#fff',
                        fontSize: '16px',
                        fontWeight: '800',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '1.5px',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase',
                        boxShadow: isDisabled ? 'none' : '0 6px 20px rgba(21, 101, 192, 0.4)',
                        transition: 'all 0.25s'
                      }}
                      onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.boxShadow = '0 10px 30px rgba(21, 101, 192, 0.55)'; }}
                      onMouseLeave={e => { if (!isDisabled) e.currentTarget.style.boxShadow = '0 6px 20px rgba(21, 101, 192, 0.4)'; }}
                    >
                      {isInsufficient ? 'ROOMS UNAVAILABLE' : (!isFormValid ? 'FILL DETAILS TO PAY' : 'PAY NOW')}
                    </button>
                  );
                })()}
              </div>

            </div>

            {/* RIGHT STICKY SIDEBAR - BOOKING PRICE SUMMARY & PROMO ENGINE */}
            <div className="mmt-sidebar">
              <div className="mmt-card" style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}>
                <div className="summary-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ShieldCheck size={20} />
                    <span>Fare Summary</span>
                    {apiConnectionStatus === 'live' ? (
                      <span className="badge-pill-mmt success" style={{ fontSize: '10px', marginLeft: 'auto', background: 'rgba(22, 163, 74, 0.08)', borderColor: 'rgba(22, 163, 74, 0.2)', color: '#16a34a' }}>Live ERP</span>
                    ) : apiConnectionStatus === 'error' ? (
                      <span className="badge-pill-mmt accent" style={{ fontSize: '10px', marginLeft: 'auto', background: 'rgba(200, 155, 60, 0.06)', borderColor: 'rgba(200, 155, 60, 0.2)', color: '#C89B3C' }}>ERP Offline</span>
                    ) : (
                      <span className="badge-pill-mmt" style={{ fontSize: '10px', marginLeft: 'auto' }}>Sandbox</span>
                    )}
                  </h3>
                </div>

                <div>

                  {/* ── Booking snapshot widget ── */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
                    marginBottom: 18,
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid #e9ecef',
                    overflow: 'hidden',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                  }}>
                    {/* Rooms */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 6px 14px', gap: 6 }}>
                      <div style={{ color: '#1a56db', marginBottom: 2 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7v13"/><path d="M21 7v13"/><path d="M3 16h18"/><rect x="3" y="7" width="18" height="9" rx="2"/><path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1 }}>{rooms}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.9px' }}>
                        Room{rooms > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div style={{ background: '#f0f0f0', width: 1 }} />

                    {/* Nights */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 6px 14px', gap: 6 }}>
                      <div style={{ color: '#C89B3C', marginBottom: 2 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#C89B3C', lineHeight: 1 }}>{nights}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.9px' }}>
                        Night{nights !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div style={{ background: '#f0f0f0', width: 1 }} />

                    {/* Guests */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 6px 14px', gap: 6 }}>
                      <div style={{ color: '#16a34a', marginBottom: 2 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1 }}>{adults + children}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.9px' }}>
                        Guest{adults + children !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Bottom date strip */}
                    <div style={{
                      gridColumn: '1 / -1',
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 10, padding: '8px 14px',
                      background: '#fafafa',
                    }}>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 700 }}>
                        {new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d1d5db' }}>
                        <span style={{ height: 1, width: 20, background: '#d1d5db', display: 'inline-block' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#C89B3C', whiteSpace: 'nowrap' }}>{nights}N</span>
                        <span style={{ height: 1, width: 20, background: '#d1d5db', display: 'inline-block' }} />
                      </span>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 700 }}>
                        {new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* ── Room cost breakdown ── */}
                  <div style={{
                    background: '#f9fafb', borderRadius: 10, padding: '12px 14px',
                    marginBottom: 10, border: '1px solid #f0f0f0',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                      Room Charges
                    </div>
                    {Object.entries(roomSelections).filter(([_, count]) => count > 0).map(([rt, count]) => {
                      const price = livePrices[rt] || getRoomPrice(rt);
                      return (
                        <div key={rt} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4 }}>
                            <span>{getRoomTitle(rt)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                            <span>₹{price.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''} × {count} room{count > 1 ? 's' : ''}</span>
                            <span style={{ fontWeight: 700, color: '#111' }}>₹{(price * nights * count).toLocaleString()}</span>
                          </div>
                        </div>
                      )
                    })}
                    {Object.values(roomSelections).filter(c => c > 0).length > 1 && (
                      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '4px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#111', fontWeight: 700 }}>
                        <span>Total Room Cost</span>
                        <span>₹{roomCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Add-ons ── */}
                  {(darshanGuide || airportCab) && (
                    <div style={{
                      background: '#f9fafb', borderRadius: 10, padding: '12px 14px',
                      marginBottom: 10, border: '1px solid #f0f0f0',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                        Add-ons
                      </div>
                      {darshanGuide && (
                        <div className="summary-row-mmt" style={{ padding: '2px 0', margin: 0 }}>
                          <span>🛕 Darshan VIP Guide</span>
                          <span>₹1,500</span>
                        </div>
                      )}
                      {airportCab && (
                        <div className="summary-row-mmt" style={{ padding: '2px 0', margin: 0 }}>
                          <span>🚗 Airport Luxury Pickup</span>
                          <span>₹2,500</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Taxes ── */}
                  <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', margin: '10px 0', paddingTop: 10 }}>
                    <div className="summary-row-mmt" style={{ color: '#6b7280', fontSize: 13 }}>
                      <span>Subtotal (before tax)</span>
                      <span>₹{taxableAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-row-mmt" style={{ color: '#6b7280', fontSize: 13 }}>
                      <span>GST 5%</span>
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* ── Grand Total ── */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
                    borderRadius: 12, padding: '14px 16px', marginTop: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>TOTAL PAYABLE</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Incl. all taxes &amp; fees</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                      ₹{payableTotal.toLocaleString()}
                    </div>
                  </div>

                </div>

                {/* Coupon Code */}
                <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '10px' }}>Coupon Codes</div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
                    <input
                      type="text"
                      placeholder="Have A Coupon Code?"
                      style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', fontSize: '13px', color: '#374151', outline: 'none', fontFamily: 'Outfit, sans-serif' }}
                    />
                    <button style={{ padding: '12px 16px', background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', color: '#9CA3AF', cursor: 'pointer', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          </>
        )}

        {/* Step 2 — loading overlay or reservation error after payment */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: '30px 20px' }}>
            {paymentLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '400px', textAlign: 'center' }}>
                <div className="spinner-payment" style={{ width: '56px', height: '56px', borderWidth: '4px' }}></div>
                <p style={{ fontSize: '18px', fontWeight: '800', color: '#111', fontFamily: 'Outfit, sans-serif' }}>{paymentStepText}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>Please do not close or refresh this page while we secure your booking with our hotel servers.</p>
              </div>
            ) : reservationError ? (
              <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: '16px', padding: '32px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444', fontSize: '32px' }}>
                  ⚠️
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#991b1b', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
                  Reservation Sync Issue
                </h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your payment was successfully received by our payment gateway, but our hotel database encountered a temporary issue while generating your room reservation.
                </p>
                
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Payment Reference ID
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                    <code style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                      {reservationError.paymentId}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(reservationError.paymentId);
                        alert('Payment ID copied to clipboard!');
                      }}
                      style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Copy ID
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px', fontWeight: '500' }}>
                    Error Detail: {reservationError.message}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', background: '#f1f5f9', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', lineHeight: '1.5', textAlign: 'left' }}>
                  <strong>What happens next?</strong><br />
                  Please contact our front desk with your Payment Reference ID. Our team will manually confirm your room reservation or issue a full refund within 24 hours.
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setReservationError(null);
                      setCurrentStep(1);
                    }}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Return to Selection
                  </button>
                  <a
                    href="tel:+919876543210"
                    style={{ padding: '12px 24px', borderRadius: '10px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
                  >
                    Contact Front Desk
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 4. STEP 3: TRANSACTION SUCCESS CONFIRMATION RECEIPT SCREEN */}
        {currentStep === 3 && (
          <div className="confirmation-mmt-wrapper">
            <canvas ref={confettiCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />

            {/* STATUS HEADER */}
            <div className="conf-status-header">
              <div className="conf-check-circle">
                <CheckCircle2 size={22} strokeWidth={2.5} />
              </div>
              <span className="conf-status-label">Booking Confirmed</span>
              <h2 className="conf-status-title">
                Radhe Radhe! Your stay at Braj Nidhi,{' '}
                {new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} is confirmed!
              </h2>
              <div className="conf-action-pills">
                <button className="atc-btn" onClick={() => {
                  const fmt = (d: string) => d.replace(/-/g, '');
                  const title = encodeURIComponent(`Braj Nidhi Stay — ${getRoomTitle(roomType)}`);
                  const details = encodeURIComponent(`Booking Ref: ${bookingRef}
Guest: ${guestDetails.firstName} ${guestDetails.lastName}
Total Paid: Rs.${payableTotal.toLocaleString()}`);
                  const location = encodeURIComponent('Braj Nidhi Guesthouse, Vrindavan, UP');
                  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(checkIn)}/${fmt(checkOut)}&details=${details}&location=${location}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" height={24} fill="none" className="atc-icon"><g strokeWidth={2} strokeLinecap="round" stroke="#fff"><rect y={5} x={4} width={16} rx={2} height={16} /><path d="m8 3v4" /><path d="m16 3v4" /><path d="m4 11h16" /></g></svg>
                  <span className="atc-label">Add to Calendar</span>
                </button>
              </div>
            </div>

            {/* SPLIT LAYOUT */}
            <div className="confirmation-split">
              
              {/* LEFT CARD & GUEST INFO */}
              <div className="conf-left-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(roomSelections).filter(([_, count]) => count > 0).map(([rt, count]) => (
                  <div key={rt} className="conf-left-card">
                    <img loading="lazy" decoding="async" src={getRoomImage(rt)} alt="Room Preview" className="conf-left-image" />
                    <div className="conf-left-body">
                      <div className="conf-room-title-line">
                        <h3>{count}x {getRoomTitle(rt)}</h3>
                        <span>Braj Nidhi Guesthouse, Vrindavan</span>
                      </div>
                      <div className="conf-price-row">
                        <div className="conf-price-tag">
                          <MapPin size={13} style={{ color: '#C89B3C' }} />
                          ₹{(livePrices[rt] || getRoomPrice(rt)).toLocaleString()} / night
                        </div>
                        <div className="conf-ref-badge"><Check size={10} />{bookingRef}</div>
                      </div>
                      <div className="conf-property-box">
                        <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi" className="conf-property-avatar" />
                        <div className="conf-property-details">
                          <h4>Braj Nidhi Guesthouse</h4>
                          <span>Vrindavan, UP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Your Information */}
                <div className="conf-accordion">
                  <div className="conf-accordion-header"><span>Your Information</span></div>
                  <div className="conf-guest-section-title">Guest Details</div>
                  <div className="conf-guest-cards" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="conf-guest-card">
                      <div className="conf-guest-avatar">
                        {(guestDetails.firstName?.[0] || 'G').toUpperCase()}{(guestDetails.lastName?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="conf-guest-info">
                        <h5>{guestDetails.firstName} {guestDetails.lastName}</h5>
                        <span>{adults} Adult{adults > 1 ? 's' : ''} · {nights} Night{nights > 1 ? 's' : ''}</span>
                        <div className="conf-paid-tag"><Check size={11} />₹{payableTotal.toLocaleString()} Paid</div>
                      </div>
                    </div>
                    {children > 0 && (
                      <div className="conf-guest-card" style={{ background: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.2)' }}>
                        <div className="conf-guest-avatar" style={{ background: 'linear-gradient(135deg, #d4af37, #8b6914)' }}>{children}C</div>
                        <div className="conf-guest-info">
                          <h5>{children} Child{children > 1 ? 'ren' : ''}</h5>
                          <span>Accompanying guests</span>
                          <div className="conf-paid-tag" style={{ color: '#d4af37' }}><Check size={11} />Included</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT DETAILS */}
              <div className="conf-right-side">
                <div className="conf-accordion">
                  <div className="conf-accordion-header"><span>Booking Details</span></div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Check size={16} /></div>
                    <span className="conf-detail-label">Reservation ID</span>
                    <span className="conf-detail-value" style={{ color: '#C89B3C', fontWeight: 700 }}>{bookingRef}</span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Users size={16} /></div>
                    <span className="conf-detail-label">Name</span>
                    <span className="conf-detail-value" style={{ color: '#C89B3C', fontWeight: 700 }}>
                      {guestDetails.firstName} {guestDetails.lastName}
                    </span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Phone size={16} /></div>
                    <span className="conf-detail-label">Phone</span>
                    <span className="conf-detail-value">{guestDetails.phone || '—'}</span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Mail size={16} /></div>
                    <span className="conf-detail-label">Email</span>
                    <span className="conf-detail-value">{guestDetails.email || '—'}</span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Calendar size={16} /></div>
                    <span className="conf-detail-label">Check-In</span>
                    <span className="conf-detail-value">
                      {new Date(checkIn).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {checkInTime}
                    </span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><Calendar size={16} /></div>
                    <span className="conf-detail-label">Check-Out</span>
                    <span className="conf-detail-value">
                      {new Date(checkOut).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {checkOutTime}
                    </span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><MapPin size={16} /></div>
                    <span className="conf-detail-label">Property</span>
                    <span className="conf-detail-value">Braj Nidhi, Vrindavan UP</span>
                  </div>
                </div>



                <div className="conf-accordion">
                  <div className="conf-accordion-header"><span>Payment Details</span></div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><CreditCard size={16} /></div>
                    <span className="conf-detail-label">Payment Method</span>
                    <span className="conf-detail-value">Razorpay (Online)</span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><ShieldCheck size={16} /></div>
                    <span className="conf-detail-label">Payment Status</span>
                    <span className="conf-detail-value" style={{ color: '#16a34a', fontWeight: 700 }}>✓ Captured</span>
                  </div>
                  <div className="conf-detail-row">
                    <div className="conf-detail-icon"><IndianRupee size={16} /></div>
                    <span className="conf-detail-label">Amount Paid</span>
                    <span className="conf-detail-value" style={{ fontWeight: 700 }}>₹{payableTotal.toLocaleString()}</span>
                  </div>
                  {razorpayPaymentId && (
                    <div className="conf-detail-row">
                      <div className="conf-detail-icon"><Check size={16} /></div>
                      <span className="conf-detail-label">Payment ID</span>
                      <span className="conf-detail-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>{razorpayPaymentId}</span>
                    </div>
                  )}
                  {razorpayOrderId && (
                    <div className="conf-detail-row">
                      <div className="conf-detail-icon"><Check size={16} /></div>
                      <span className="conf-detail-label">Order ID</span>
                      <span className="conf-detail-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>{razorpayOrderId}</span>
                    </div>
                  )}
                </div>

                {/* Hidden receipt — only rendered when printing */}
                <InvoiceReceipt 
                  bookingRef={bookingRef || 'BN-1234'}
                  date={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  guestName={`${guestDetails.firstName || ''} ${guestDetails.lastName || ''}`}
                  guestEmail={guestDetails.email || ''}
                  guestPhone={guestDetails.phone || ''}
                  roomTitle={getRoomTitle(roomType)}
                  pricePerNight={pricePerNight}
                  nights={nights}
                  subtotal={payableTotal}
                  tax={0}
                  grandTotal={payableTotal}
                />

                <div className="conf-bottom-actions">
                  <Link href="/" className="rth-btn">
                    <span className="text">Return to Home</span>
                    <span>Go Home ↩</span>
                  </Link>
                  <div className="vb-borders">
                    <button className="vb-btn" onClick={() => window.print()}>PRINT RECEIPT</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Sold-out popup */}
      <RoomUnavailablePopup
        isOpen={soldOutPopup}
        onClose={() => setSoldOutPopup(false)}
        roomName={getRoomTitle(roomType)}
        requested={rooms}
        available={Math.max(0, availMinForRange ?? 0)}
        checkIn={checkIn}
        checkOut={checkOut}
        onTryOtherDates={() => { setSoldOutPopup(false); setShowModify(true); }}
        onBookAvailable={(availMinForRange ?? 0) > 0 && (availMinForRange ?? 0) < rooms
          ? () => { setRooms(availMinForRange!); setSoldOutPopup(false); }
          : undefined}
      />


      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddGuestModal(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>

            {/* Close */}
            <button onClick={() => setShowAddGuestModal(false)} style={{ position: 'absolute', top: '14px', right: '14px', width: '32px', height: '32px', borderRadius: '50%', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', zIndex: 1 }}>×</button>

            {/* Title */}
            <div style={{ padding: '22px 24px 14px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Saved Guests</h2>
            </div>

            {/* Saved guests */}
            {savedGuests.length > 0 && (
              <div style={{ padding: '0 24px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedGuests.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#1d6de5', flexShrink: 0 }}>
                        {g.firstName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{g.firstName} {g.lastName}</div>
                        {g.isChild && <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Below 12 years</div>}
                      </div>
                    </div>
                    <button onClick={() => setSavedGuests(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Guests form */}
            <div className="ag-form-card" style={{ margin: '0 24px 16px', background: '#EEF5FB', borderRadius: '12px', padding: '18px' }}>
              <style>{`
                .ag-form-card .ag-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10px;
                  margin-bottom: 14px;
                }
                .ag-form-card .ag-field { display: flex; flex-direction: column; min-width: 0; }
                .ag-form-card .ag-label {
                  font-size: 11px; font-weight: 700; color: #6B7280;
                  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
                }
                .ag-form-card .ag-input,
                .ag-form-card .ag-select {
                  width: 100%;
                  padding: 11px 12px;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  font-size: 14px;
                  background: #fff;
                  outline: none;
                  font-family: var(--font-outfit), sans-serif;
                  box-sizing: border-box;
                  min-width: 0;
                  transition: border-color 0.15s, box-shadow 0.15s;
                }
                .ag-form-card .ag-input:focus,
                .ag-form-card .ag-select:focus {
                  border-color: #1d6de5;
                  box-shadow: 0 0 0 3px rgba(29, 109, 229, 0.12);
                }
                .ag-form-card .ag-select { cursor: pointer; padding-right: 8px; }
                .ag-form-card .ag-add-btn {
                  width: 100%;
                  padding: 12px 24px;
                  background: #1d6de5;
                  border: none;
                  border-radius: 10px;
                  font-size: 13px;
                  font-weight: 700;
                  color: #fff;
                  cursor: pointer;
                  letter-spacing: 0.8px;
                  font-family: var(--font-outfit), sans-serif;
                  text-transform: uppercase;
                  transition: background 0.2s, transform 0.1s;
                }
                .ag-form-card .ag-add-btn:hover { background: #1557c0; }
                .ag-form-card .ag-add-btn:active { transform: scale(0.98); }
                @media (max-width: 480px) {
                  .ag-form-card .ag-grid {
                    grid-template-columns: 1fr;
                  }
                }
              `}</style>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '4px', fontFamily: 'Outfit, sans-serif' }}>Add Guests</h3>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.5' }}>
                Name should be as per official govt. ID &amp; travelers below 18 years of age cannot travel alone
              </p>

              <div className="ag-grid">
                <div className="ag-field">
                  <div className="ag-label">First Name</div>
                  <input className="ag-input" type="text" placeholder="First name" value={newGuestFirstName} onChange={e => setNewGuestFirstName(e.target.value)} />
                </div>
                <div className="ag-field">
                  <div className="ag-label">Last Name</div>
                  <input className="ag-input" type="text" placeholder="Last name" value={newGuestLastName} onChange={e => setNewGuestLastName(e.target.value)} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="checkbox" checked={newGuestIsChild} onChange={e => setNewGuestIsChild(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1d6de5', cursor: 'pointer' }}/>
                <span style={{ fontSize: '13px', color: '#374151' }}>Below 12 years of age</span>
              </label>

              <button className="ag-add-btn" onClick={handleAddGuest}>
                + Add to Saved Guests
              </button>
            </div>

            {/* Done */}
            <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
              <button onClick={() => setShowAddGuestModal(false)} style={{ width: '100%', padding: '14px', background: '#e5e7eb', color: '#6B7280', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div className="footer-top-links">
          <div className="footer-col"><h3>Our Services</h3><Link href="/guesthouse">Guesthouse</Link><Link href="/weddings">Weddings</Link><Link href="/corporate">Corporate</Link><Link href="/braj-yatra">Braj Yatra</Link></div>
          <div className="footer-col"><h3>Explore Vrindavan</h3><Link href="/braj-yatra#packages">Sapt Devalaya Yatra</Link><Link href="/braj-yatra#packages">Chaurasi Kos Yatra</Link><Link href="/braj-yatra">Govardhan Parikrama</Link><Link href="/braj-yatra">Barsana & Nandgaon</Link><a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer">Chandrodaya Mandir</a><a href="https://www.vhtofficial.com/" target="_blank" rel="noopener noreferrer">Heritage Tower</a></div>
          <div className="footer-col"><h3>Stay & Book</h3><Link href="/booking">Book Your Stay</Link><Link href="/weddings">Wedding Packages</Link><Link href="/corporate">Corporate Stays</Link><a href="#">Refund Policy</a></div>
          <div className="footer-col"><h3>Help & Support</h3><a href="#">FAQ</a><Link href="/contact">Contact Us</Link><a href="#">Direction Map</a><a href="#">Group Inquiries</a></div>
          <div className="footer-col"><h3>Information</h3><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/guest-policy">Guest Policy</Link><Link href="/cancellation-policy">Cancellation Policy</Link></div>
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
    </div>
  );
}
