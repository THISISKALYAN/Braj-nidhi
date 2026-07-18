"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PremiumDoubleCalendar from './PremiumDoubleCalendar';
import RoomUnavailablePopup from './RoomUnavailablePopup';

interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: 'deluxe2' | 'deluxe3' | 'deluxe4';
  roomName: string;
  price: number;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtDisplay(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${d} ${MONTHS[m-1].slice(0,3)} '${String(y).slice(2)} · ${dows[date.getDay()]}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

interface AvailabilityState {
  unavailableDates: string[];
  lowAvailDates: Record<string, number>;
  upgradeRoom: {
    roomType: 'deluxe2' | 'deluxe3' | 'deluxe4';
    name: string;
    price: number;
    available: number;
  } | null;
  rangeBlocked: boolean;
  rangeMinAvail: number;   // minimum available rooms within selected range
  loading: boolean;
}

const ROOM_NAMES: Record<string, string> = {
  deluxe2: 'Deluxe 2 – Twin Bedded Room',
  deluxe3: 'Deluxe 3 – Triple Room',
  deluxe4: 'Deluxe 4 – Family Room',
};

export default function RoomBookingModal({ isOpen, onClose, roomType, roomName, price }: RoomBookingModalProps) {
  const router = useRouter();

  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const tomorrowDate = addDays(todayDate, 1);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarInitialSelection, setCalendarInitialSelection] = useState<'in'|'out'>('in');

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGuests, setShowGuests] = useState(false);

  // ERP availability state
  const [avail, setAvail] = useState<AvailabilityState>({
    unavailableDates: [],
    lowAvailDates: {},
    upgradeRoom: null,
    rangeBlocked: false,
    rangeMinAvail: 0,
    loading: false,
  });

  // Track booking in progress
  const [booking, setBooking] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  // Sold-out popup (shown when user picks dates with no availability)
  const [soldOutPopup, setSoldOutPopup] = useState(false);
  const lastBlockedDates = useRef<string>('');

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCheckIn('');
      setCheckOut('');
      setRooms(1); setAdults(2); setChildren(0);
      setIsCalendarOpen(true); setCalendarInitialSelection('in'); setShowGuests(false);
      setBooking('idle'); setBookingError('');
      setSoldOutPopup(false);
      lastBlockedDates.current = '';
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // Fetch availability when modal opens or dates/rooms change
  const fetchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAvailability = useCallback(async (
    rt: string, cin: string, cout: string, rm: number,
  ) => {
    if (!cin || !cout || cin >= cout) return;

    // Window: 3 months from today for the calendar
    const today = new Date(); today.setHours(0,0,0,0);
    const windowFrom = fmt(today);
    const windowTo = fmt(addDays(today, 89));

    setAvail(a => ({ ...a, loading: true }));
    try {
      const res = await fetch(
        `/api/availability?roomType=${rt}&from=${windowFrom}&to=${windowTo}&rooms=${rm}`,
      );
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();

      const availability: Record<string, number> = data.availability ?? {};

      // Separate unavailable (0) from low (1-2 for a 3-room type)
      const unavailableDates: string[] = [];
      const lowAvailDates: Record<string, number> = {};
      for (const [date, count] of Object.entries(availability)) {
        const c = count as number;
        if (c < rm) unavailableDates.push(date);
        else if (c <= 1) lowAvailDates[date] = c;
      }

      // Check if selected range is blocked + compute min available in range
      const rangeBlocked = checkRangeBlocked(cin, cout, unavailableDates);
      let rangeMinAvail = 0;
      if (cin && cout && cin < cout) {
        const cur = new Date(cin);
        const end = new Date(cout);
        let min = Infinity;
        while (cur < end) {
          const d = fmt(cur);
          const c = (availability[d] ?? 0) as number;
          if (c < min) min = c;
          cur.setDate(cur.getDate() + 1);
        }
        rangeMinAvail = min === Infinity ? 0 : min;
      }

      setAvail({
        unavailableDates,
        lowAvailDates,
        upgradeRoom: data.upgrade ?? null,
        rangeBlocked,
        rangeMinAvail,
        loading: false,
      });

      // Trigger the popup once per blocked date-range change (not on every fetch).
      const key = `${cin}|${cout}|${rm}`;
      if (rangeBlocked && lastBlockedDates.current !== key) {
        lastBlockedDates.current = key;
        setSoldOutPopup(true);
      } else if (!rangeBlocked) {
        lastBlockedDates.current = '';
      }
    } catch {
      setAvail(a => ({ ...a, loading: false }));
    }
  }, []);

  function checkRangeBlocked(cin: string, cout: string, unavail: string[]): boolean {
    if (!cin || !cout || cin >= cout) return false;
    const cur = new Date(cin);
    const end = new Date(cout);
    const unavailSet = new Set(unavail);
    while (cur < end) {
      if (unavailSet.has(fmt(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  useEffect(() => {
    if (!isOpen) return;
    if (fetchDebounce.current) clearTimeout(fetchDebounce.current);
    fetchDebounce.current = setTimeout(() => {
      fetchAvailability(roomType, checkIn, checkOut, rooms);
    }, 300);
    return () => { if (fetchDebounce.current) clearTimeout(fetchDebounce.current); };
  }, [isOpen, roomType, checkIn, checkOut, rooms, fetchAvailability]);

  if (!isOpen) return null;

  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
  );
  const totalGuests = adults + children;
  const guestsLabel = `${rooms} Room${rooms>1?'s':''}, ${totalGuests} Guest${totalGuests>1?'s':''}`;

  const handleProceed = async () => {
    if (avail.rangeBlocked) return;
    setBooking('loading');
    try {
      const res = await fetch('/api/availability/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType, checkIn, checkOut, rooms, adults, children,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBooking('error');
        setBookingError(data.error || 'Booking failed');
        // If server rejected on availability, surface the popup too.
        if (res.status === 409) setSoldOutPopup(true);
        return;
      }
      setBooking('success');
      const params = new URLSearchParams({
        roomType,
        checkin: checkIn,
        checkout: checkOut,
        rooms: String(rooms),
        adults: String(adults),
        children: String(children),
        guests: guestsLabel,
        bookingId: data.booking?.id ?? '',
      });
      onClose();
      router.push(`/booking?${params.toString()}`);
    } catch {
      setBooking('error');
      setBookingError('Network error. Please try again.');
    }
  };

  const handleUpgradeClick = (upgradeRoomType: string) => {
    onClose();
    // Re-open with upgraded room type is handled by parent, but we can just navigate to booking
    const params = new URLSearchParams({
      roomType: upgradeRoomType,
      checkin: checkIn,
      checkout: checkOut,
      rooms: String(rooms),
      adults: String(adults),
      children: String(children),
      guests: guestsLabel,
    });
    router.push(`/booking?${params.toString()}`);
  };

  const roomColors: Record<string, string> = {
    deluxe2: '#1a56db',
    deluxe3: '#7c3aed',
    deluxe4: '#C89B3C',
  };
  const accentColor = roomColors[roomType] || '#C89B3C';

  // Occupancy limits per room type
  const maxOccupancy: Record<string, { adults: number; children: number }> = {
    deluxe2: { adults: 2, children: 2 },
    deluxe3: { adults: 3, children: 3 },
    deluxe4: { adults: 4, children: 4 },
  };
  const maxAdults = (maxOccupancy[roomType]?.adults ?? 9) * rooms;
  const maxChildren = (maxOccupancy[roomType]?.children ?? 9) * rooms;

  const isBlocked = avail.rangeBlocked;

  return (
    <>
      {/* Sold-out popup */}
      <RoomUnavailablePopup
        isOpen={soldOutPopup}
        onClose={() => setSoldOutPopup(false)}
        roomName={roomName}
        requested={rooms}
        available={avail.rangeMinAvail}
        checkIn={checkIn}
        checkOut={checkOut}
        onTryOtherDates={() => {
          setSoldOutPopup(false);
          setCalendarInitialSelection('in');
          setIsCalendarOpen(true);
        }}
        onSelectOtherRoom={() => {
          setSoldOutPopup(false);
          onClose();
        }}
      />

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 199998,
          backdropFilter: 'blur(2px)',
        }}
        onClick={() => { if (!isCalendarOpen && !showGuests) onClose(); }}
      />

      {/* Modal card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 199999,
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        width: 'min(520px, calc(100vw - 24px))',
        maxHeight: '96vh',
        overflowY: 'auto',
        fontFamily: "var(--font-outfit), sans-serif",
        animation: 'rbmFade 0.2s ease forwards',
      }}>
        <style>{`
          @keyframes rbmFade {
            from { opacity:0; transform:translate(-50%,-47%); }
            to   { opacity:1; transform:translate(-50%,-50%); }
          }
          .rbm-row {
            display:flex; align-items:center; justify-content:space-between;
            padding:18px 26px; cursor:pointer; transition:background 0.15s;
            position:relative;
          }
          .rbm-row:hover { background:#fafafa; }
          .rbm-row + .rbm-row { border-top:1px solid #f0f0f0; }
          .rbm-row-label {
            font-size:11px; font-weight:700; letter-spacing:1.3px;
            text-transform:uppercase; color:#9ca3af; margin-bottom:5px;
          }
          .rbm-row-value {
            font-size:17px; font-weight:700; color:#111;
          }
          .rbm-badge {
            font-size:11px; font-weight:600; color:#fff;
            padding:3px 10px; border-radius:20px; white-space:nowrap;
          }
          .rbm-counter-row {
            display:flex; align-items:center; justify-content:space-between;
            padding:0 0 16px;
          }
          .rbm-counter-label { font-size:15px; font-weight:600; color:#2c2520; }
          .rbm-counter-sub { font-size:12px; color:#9ca3af; margin-top:2px; }
          .rbm-counter-ctrl {
            display:flex; align-items:center;
            border:1px solid #efe8df; border-radius:12px;
            padding:7px 14px; gap:20px; width:120px; justify-content:space-between;
          }
          .rbm-counter-btn {
            background:none; border:none; font-size:20px; cursor:pointer;
            color:#2c2520; font-weight:500; padding:0; line-height:1;
          }
          .rbm-counter-btn:disabled { color:#ccc; cursor:default; }
          .rbm-counter-num { font-size:17px; font-weight:700; color:#2c2520; min-width:18px; text-align:center; }

          /* Availability banner */
          .rbm-avail-banner {
            margin: 0 20px 0;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }
          .rbm-avail-banner.sold-out {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            color: #b91c1c;
          }
          .rbm-avail-banner.low-avail {
            background: #fff7ed;
            border: 1px solid #fdba74;
            color: #c2410c;
          }
          .rbm-upgrade-btn {
            display: inline-flex; align-items: center; gap: 6px;
            margin-top: 8px; padding: 7px 16px; border-radius: 50px;
            font-size: 13px; font-weight: 700; cursor: pointer; border: none;
            font-family: inherit; transition: opacity 0.15s;
          }
          .rbm-upgrade-btn:hover { opacity: 0.85; }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '26px 26px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
              Book Room
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.2 }}>{roomName}</div>
            <div style={{ fontSize: 16, color: accentColor, fontWeight: 700, marginTop: 6 }}>
              ₹{price.toLocaleString()} <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>per night</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: 16, color: '#374151',
            }}
          >✕</button>
        </div>

        {/* Date rows */}
        <div style={{ borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
          {/* Check-In row */}
          <div
            className="rbm-row"
            style={{ borderLeft: `3px solid ${calendarInitialSelection==='in' && isCalendarOpen ? accentColor : 'transparent'}` }}
            onClick={() => {
              setShowGuests(false);
              if (isCalendarOpen && calendarInitialSelection === 'in') {
                setIsCalendarOpen(false);
              } else {
                setCalendarInitialSelection('in');
                setIsCalendarOpen(true);
              }
            }}
          >
            <div>
              <div className="rbm-row-label">Check-in</div>
              <div className="rbm-row-value">{checkIn ? fmtDisplay(checkIn) : 'Select Check-in Date'}</div>
            </div>
            <span className="rbm-badge" style={{ background: isCalendarOpen && calendarInitialSelection==='in' ? accentColor : '#f3f4f6', color: isCalendarOpen && calendarInitialSelection==='in' ? '#fff' : '#9ca3af' }}>
              {isCalendarOpen && calendarInitialSelection==='in' ? 'Selecting' : 'Tap to change'}
            </span>
          </div>

          {/* Check-Out row */}
          <div
            className="rbm-row"
            style={{ borderLeft: `3px solid ${calendarInitialSelection==='out' && isCalendarOpen ? accentColor : 'transparent'}` }}
            onClick={() => {
              setShowGuests(false);
              if (isCalendarOpen && calendarInitialSelection === 'out') {
                setIsCalendarOpen(false);
              } else {
                setCalendarInitialSelection('out');
                setIsCalendarOpen(true);
              }
            }}
          >
            <div>
              <div className="rbm-row-label">Check-out</div>
              <div className="rbm-row-value">{checkOut ? fmtDisplay(checkOut) : 'Select Check-out Date'}</div>
            </div>
            <span className="rbm-badge" style={{ background: isCalendarOpen && calendarInitialSelection==='out' ? accentColor : '#f3f4f6', color: isCalendarOpen && calendarInitialSelection==='out' ? '#fff' : '#9ca3af' }}>
              {isCalendarOpen && calendarInitialSelection==='out' ? 'Selecting' : 'Tap to change'}
            </span>
          </div>

          {/* Calendar — forceFixed so it renders above the modal */}
          <div style={{ position: 'relative' }}>
            <PremiumDoubleCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              isOpen={isCalendarOpen}
              initialSelection={calendarInitialSelection}
              onChange={(cin, cout) => { setCheckIn(cin); setCheckOut(cout); }}
              onClose={() => setIsCalendarOpen(false)}
              forceFixed
              unavailableDates={avail.unavailableDates}
              lowAvailDates={avail.lowAvailDates}
            />
          </div>
        </div>

        {/* Availability Banner */}
        {!avail.loading && isBlocked && (
          <div style={{ padding: '14px 20px 0' }}>
            <div className="rbm-avail-banner sold-out">
              <span style={{ fontSize: 20, flexShrink: 0 }}>🚫</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {roomName} is sold out for selected dates
                </div>
                <div style={{ opacity: 0.85 }}>
                  Please choose different dates or consider an upgrade.
                </div>
                {avail.upgradeRoom && (
                  <button
                    className="rbm-upgrade-btn"
                    style={{ background: roomColors[avail.upgradeRoom.roomType] || '#374151', color: '#fff', marginTop: 10 }}
                    onClick={() => handleUpgradeClick(avail.upgradeRoom!.roomType)}
                  >
                    ⬆️ Upgrade to {ROOM_NAMES[avail.upgradeRoom.roomType]}
                    <span style={{ fontWeight: 400, opacity: 0.9 }}>
                      · ₹{avail.upgradeRoom.price.toLocaleString()}/night
                    </span>
                  </button>
                )}
                {!avail.upgradeRoom && (
                  <div style={{ marginTop: 6, fontWeight: 600 }}>
                    No rooms available for these dates. Try different dates.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rooms & Guests row */}
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div
            className="rbm-row"
            style={{ borderLeft: `3px solid ${showGuests ? accentColor : 'transparent'}` }}
            onClick={() => { setIsCalendarOpen(false); setShowGuests(s => !s); }}
          >
            <div>
              <div className="rbm-row-label">Rooms &amp; Guests</div>
              <div className="rbm-row-value">{guestsLabel}</div>
            </div>
            <span className="rbm-badge" style={{ background: showGuests ? accentColor : '#f3f4f6', color: showGuests ? '#fff' : '#9ca3af' }}>
              {showGuests ? 'Selecting' : 'Tap to change'}
            </span>
          </div>

          {showGuests && (
            <div style={{ padding: '20px 26px', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Rooms */}
              <div className="rbm-counter-row">
                <div><div className="rbm-counter-label">Rooms</div></div>
                <div className="rbm-counter-ctrl">
                  <button className="rbm-counter-btn" disabled={rooms<=1} onClick={()=>{
                    const newRooms = Math.max(1, rooms-1);
                    setRooms(newRooms);
                    const base = maxOccupancy[roomType];
                    if (base) {
                      setAdults(a => Math.min(a, base.adults * newRooms));
                      setChildren(c => Math.min(c, base.children * newRooms));
                    }
                  }}>−</button>
                  <span className="rbm-counter-num">{rooms}</span>
                  <button className="rbm-counter-btn" disabled={rooms>=9} onClick={()=>{
                    const newRooms = Math.min(9, rooms+1);
                    setRooms(newRooms);
                  }}>+</button>
                </div>
              </div>
              {/* Adults */}
              <div className="rbm-counter-row">
                <div>
                  <div className="rbm-counter-label">Adults</div>
                  <div className="rbm-counter-sub">Max {maxAdults} per {rooms > 1 ? `${rooms} rooms` : 'room'}</div>
                </div>
                <div className="rbm-counter-ctrl">
                  <button className="rbm-counter-btn" disabled={adults<=1} onClick={()=>setAdults(a=>Math.max(1,a-1))}>−</button>
                  <span className="rbm-counter-num">{adults}</span>
                  <button className="rbm-counter-btn" disabled={adults>=maxAdults} onClick={()=>setAdults(a=>Math.min(maxAdults,a+1))}>+</button>
                </div>
              </div>
              {/* Children */}
              <div className="rbm-counter-row">
                <div>
                  <div className="rbm-counter-label">Children</div>
                  <div className="rbm-counter-sub">0–17 yrs · Max {maxChildren} per {rooms > 1 ? `${rooms} rooms` : 'room'}</div>
                </div>
                <div className="rbm-counter-ctrl">
                  <button className="rbm-counter-btn" disabled={children<=0} onClick={()=>setChildren(c=>Math.max(0,c-1))}>−</button>
                  <span className="rbm-counter-num">{children}</span>
                  <button className="rbm-counter-btn" disabled={children>=maxChildren} onClick={()=>setChildren(c=>Math.min(maxChildren,c+1))}>+</button>
                </div>
              </div>

              {/* Live price preview */}
              {nights > 0 && (
                <div style={{
                  background: '#f8f9fa', borderRadius: 10, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    {rooms} Room{rooms>1?'s':''} × {nights} night{nights>1?'s':''}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: accentColor }}>
                    ₹{(price * nights * rooms).toLocaleString()}
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowGuests(false)}
                style={{
                  alignSelf: 'flex-end', background: accentColor, color: '#fff',
                  border: 'none', borderRadius: '50px', padding: '8px 22px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Apply</button>
            </div>
          )}
        </div>

        {/* Prompt when dates not selected yet */}
        {(!checkIn || !checkOut) && (
          <div style={{
            margin: '16px 20px 0',
            padding: '14px 18px',
            background: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                Select Dates & Guests
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Please choose your check-in & check-out dates above to view real-time room availability.
              </div>
            </div>
          </div>
        )}

        {/* Room Availability */}
        {checkIn && checkOut && !avail.loading && !isBlocked && nights > 0 && (
          <div style={{
            margin: '16px 20px 0',
            padding: '14px 18px',
            background: avail.rangeMinAvail <= 2 ? '#fff7ed' : '#f0fdf4',
            border: `1px solid ${avail.rangeMinAvail <= 2 ? '#fdba74' : '#86efac'}`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: avail.rangeMinAvail <= 2 ? '#f97316' : '#16a34a',
                boxShadow: `0 0 0 4px ${avail.rangeMinAvail <= 2 ? 'rgba(249,115,22,.18)' : 'rgba(22,163,74,.18)'}`,
              }}/>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6b7280' }}>
                  Room Availability
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 2 }}>
                  {avail.rangeMinAvail} {avail.rangeMinAvail === 1 ? 'room' : 'rooms'} available
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}> · {nights} night{nights>1?'s':''}</span>
                </div>
              </div>
            </div>
            {avail.rangeMinAvail <= 2 && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#c2410c',
                background: '#fed7aa', padding: '4px 10px', borderRadius: 20,
              }}>Hurry!</span>
            )}
          </div>
        )}

        {checkIn && checkOut && avail.loading && (
          <div style={{ margin: '16px 20px 0', padding: '14px 18px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #d1d5db', borderTopColor: '#6b7280', borderRadius: '50%', animation: 'rbmSpin 0.7s linear infinite' }}/>
            <style>{`@keyframes rbmSpin { to { transform: rotate(360deg); } }`}</style>
            Checking live ERP availability…
          </div>
        )}

        {/* Booking error */}
        {booking === 'error' && (
          <div style={{ margin: '14px 20px 0', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
            ⚠️ {bookingError}
          </div>
        )}

        {/* Summary + CTA */}
        <div style={{ padding: '20px 26px 28px' }}>
          {nights > 0 && (
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
              <strong style={{ color: '#111' }}>{rooms} Room{rooms>1?'s':''}</strong>
              {' · '}
              <strong style={{ color: '#111' }}>{nights} night{nights!==1?'s':''}</strong>
              {' · '}
              <strong style={{ color: accentColor, fontSize: 15 }}>₹{(price * nights * rooms).toLocaleString()}</strong>
              <span style={{ color: '#9ca3af' }}> total est.</span>
            </div>
          )}
          <button
            onClick={(!checkIn || !checkOut) ? () => { setCalendarInitialSelection('in'); setIsCalendarOpen(true); } : handleProceed}
            disabled={(!checkIn || !checkOut) ? false : (isBlocked || booking === 'loading')}
            style={{
              width: '100%',
              background: (!checkIn || !checkOut || isBlocked) ? '#d1d5db' : accentColor,
              color: (!checkIn || !checkOut || isBlocked) ? '#374151' : '#fff',
              border: 'none',
              borderRadius: '50px',
              padding: '16px 28px',
              fontSize: 17,
              fontWeight: 800,
              cursor: (!checkIn || !checkOut) ? 'pointer' : (isBlocked ? 'not-allowed' : 'pointer'),
              fontFamily: 'inherit',
              letterSpacing: '0.5px',
              transition: 'opacity 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseOver={e => { if (checkIn && checkOut && !isBlocked) e.currentTarget.style.opacity='0.9'; }}
            onMouseOut={e => { e.currentTarget.style.opacity='1'; }}
          >
            {booking === 'loading' ? (
              'Confirming...'
            ) : (!checkIn || !checkOut) ? (
              'Select Dates to Check Availability'
            ) : isBlocked ? (
              'Dates Unavailable'
            ) : (
              <>
                Proceed to Book
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>

        </div>
      </div>
    </>
  );
}
