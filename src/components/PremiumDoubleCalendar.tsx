"use client";

import React, { useState, useEffect, useRef } from 'react';

interface PremiumDoubleCalendarProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  initialSelection?: 'in' | 'out';
  /** Force fixed centered positioning (use inside modals) */
  forceFixed?: boolean;
  /** Dates with zero availability — shown red + struck-through */
  unavailableDates?: string[];
  /** Dates with limited availability — value = rooms left, shown with orange dot */
  lowAvailDates?: Record<string, number>;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function parseDateStr(str: string) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400000);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function fmtDisplay(dateStr: string) {
  if (!dateStr) return '—';
  const d = parseDateStr(dateStr);
  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} '${String(d.getFullYear()).slice(2)} · ${dows[d.getDay()]}`;
}

export default function PremiumDoubleCalendar({
  checkIn, checkOut, onChange, isOpen, onClose, initialSelection = 'in', forceFixed = false,
  unavailableDates = [], lowAvailDates = {},
}: PremiumDoubleCalendarProps) {
  const checkInDate = parseDateStr(checkIn);
  const checkOutDate = parseDateStr(checkOut);

  const [activeSelection, setActiveSelection] = useState<'in' | 'out'>(initialSelection);
  const [viewMonth, setViewMonth] = useState(checkInDate.getMonth());
  const [viewYear, setViewYear] = useState(checkInDate.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSelection(initialSelection);
      const anchor = initialSelection === 'out' ? checkOut : checkIn;
      const d = parseDateStr(anchor);
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
      setShowMonthPicker(false);
    }
  }, [isOpen, initialSelection]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const t = e.target as Element;
        if (t.closest('.mmt-date-trigger') || t.closest('.search-block')) return;
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handle, true);
    document.addEventListener('touchstart', handle, true);
    return () => {
      document.removeEventListener('mousedown', handle, true);
      document.removeEventListener('touchstart', handle, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setShowMonthPicker(false);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setShowMonthPicker(false);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: Date, overflow: boolean) => {
    if (overflow) return;
    if (day < today) return;

    if (activeSelection === 'in') {
      const minOut = addDays(day, 1);
      const newOutDate = day >= checkOutDate ? minOut : checkOutDate;
      const newOut = fmtStr(newOutDate);
      onChange(fmtStr(day), newOut);
      setActiveSelection('out');
      setViewMonth(newOutDate.getMonth());
      setViewYear(newOutDate.getFullYear());
    } else {
      if (day <= checkInDate) {
        const minOut = addDays(day, 1);
        onChange(fmtStr(day), fmtStr(minOut));
        setActiveSelection('out');
        setViewMonth(minOut.getMonth());
        setViewYear(minOut.getFullYear());
      } else {
        onChange(checkIn, fmtStr(day));
        if (onClose) onClose();
      }
    }
  };

  const buildGrid = () => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const firstDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthTotal = new Date(viewYear, viewMonth, 0).getDate();
    const cells: { date: Date; overflow: boolean }[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      const pm = viewMonth === 0 ? 11 : viewMonth - 1;
      const py = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ date: new Date(py, pm, prevMonthTotal - i), overflow: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), overflow: false });
    }
    let next = 1;
    while (cells.length % 7 !== 0) {
      const nm = viewMonth === 11 ? 0 : viewMonth + 1;
      const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ date: new Date(ny, nm, next++), overflow: true });
    }
    return cells;
  };

  const cells = buildGrid();
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);

  const monthOptions: { label: string; month: number; year: number }[] = [];
  for (let i = 0; i < 25; i++) {
    const idx = today.getMonth() + i;
    const m = idx % 12;
    const y = today.getFullYear() + Math.floor(idx / 12);
    monthOptions.push({ label: `${MONTHS[m]} ${y}`, month: m, year: y });
  }

  const isAtOrBeforeToday = viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  return (
    <>
      <div className="sky-backdrop" onClick={onClose} style={forceFixed ? { zIndex: 299998 } : undefined} />
      <div ref={containerRef} className={`sky-cal-panel${forceFixed ? ' sky-cal-fixed' : ''}`} onClick={e => e.stopPropagation()}>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Backdrop: transparent on desktop (click-outside only), dark on mobile */
          .sky-backdrop {
            position: fixed; inset: 0;
            background: transparent;
            z-index: 99998;
          }
          @media (max-width: 768px) {
            .sky-backdrop { background: rgba(0,0,0,0.45); }
          }

          /* Desktop: absolute dropdown above search bar (like Rooms & Guests) */
          .sky-cal-panel {
            position: absolute;
            bottom: calc(100% + 15px);
            left: 0;
            z-index: 99999;
            background: #fff;
            border-radius: 20px;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 15px 45px rgba(0,0,0,0.12);
            width: 420px;
            max-height: 92vh;
            overflow-y: auto;
            font-family: var(--font-outfit), sans-serif;
            animation: skyFade 0.18s ease forwards;
          }
          @keyframes skyFade {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* Force fixed centered — used inside modals */
          .sky-cal-panel.sky-cal-fixed {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            transform: translate(-50%, -50%) !important;
            width: min(420px, calc(100vw - 20px)) !important;
            z-index: 299999 !important;
            animation: skyFadeFixed 0.18s ease forwards;
          }
          @keyframes skyFadeFixed {
            from { opacity: 0; transform: translate(-50%, -47%); }
            to   { opacity: 1; transform: translate(-50%, -50%); }
          }

          /* Mobile: drop upwards relative to search block */
          @media (max-width: 768px) {
            .sky-cal-panel:not(.sky-cal-fixed) {
              position: absolute;
              top: auto;
              bottom: calc(100% + 15px);
              left: 50%;
              transform: translateX(-50%);
              width: calc(100vw - 20px);
              max-height: 75vh;
              border-radius: 16px;
              animation: skyFadeMobile 0.18s ease forwards;
            }
            @keyframes skyFadeMobile {
              from { opacity: 0; transform: translateX(-50%) translateY(10px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          }

          /* ── Date rows (Rooms & Guests style) ── */
          .sky-date-rows { padding: 4px 0 0; }

          .sky-date-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 20px;
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
          }
          .sky-date-row:hover { background: #fafafa; }
          .sky-date-row + .sky-date-row { border-top: 1px solid #f0f0f0; }

          /* gold left border on active row */
          .sky-date-row.active::before {
            content: '';
            position: absolute;
            left: 0; top: 12px; bottom: 12px;
            width: 3px;
            background: #C89B3C;
            border-radius: 0 3px 3px 0;
          }

          .sky-row-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.3px;
            text-transform: uppercase;
            color: #9ca3af;
            margin-bottom: 3px;
          }
          .sky-date-row.active .sky-row-label { color: #C89B3C; }

          .sky-row-value {
            font-size: 15px;
            font-weight: 700;
            color: #111;
          }
          .sky-date-row.active .sky-row-value { color: #111; }

          .sky-row-badge {
            font-size: 11px;
            font-weight: 600;
            color: #fff;
            background: #C89B3C;
            padding: 2px 8px;
            border-radius: 20px;
            white-space: nowrap;
          }
          .sky-row-badge.inactive {
            background: #f3f4f6;
            color: #9ca3af;
          }

          /* divider before calendar grid */
          .sky-cal-divider {
            height: 1px;
            background: #e8e8e8;
            margin: 0;
          }

          /* Month nav */
          .sky-month-nav {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 12px 6px; position: relative;
          }
          .sky-nav-arrow {
            width: 28px; height: 28px; border-radius: 50%;
            border: 1.5px solid #e5e7eb; background: #fff;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            color: #374151; transition: all 0.15s; flex-shrink: 0;
          }
          .sky-nav-arrow:hover:not(:disabled) { border-color: #C89B3C; color: #C89B3C; }
          .sky-nav-arrow:disabled { opacity: 0.3; cursor: default; }
          .sky-month-title {
            display: flex; align-items: center; gap: 6px;
            cursor: pointer; padding: 6px 14px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; font-size: 15px; font-weight: 700;
            color: #111; user-select: none; transition: border-color 0.15s;
          }
          .sky-month-title:hover { border-color: #C89B3C; }
          .sky-month-picker {
            position: absolute; top: calc(100% - 4px); left: 50%;
            transform: translateX(-50%); background: #fff;
            border: 1px solid #e5e7eb; border-radius: 10px;
            box-shadow: 0 8px 28px rgba(0,0,0,0.13);
            z-index: 10; max-height: 220px; overflow-y: auto;
            min-width: 180px; padding: 4px 0;
          }
          @media (max-width: 768px) {
            .sky-month-picker {
              top: auto;
              bottom: calc(100% + 4px);
              box-shadow: 0 -8px 28px rgba(0,0,0,0.13);
            }
          }
          .sky-month-option {
            padding: 9px 18px; font-size: 14px;
            cursor: pointer; color: #374151; transition: background 0.1s;
          }
          .sky-month-option:hover { background: #fdf8ef; color: #C89B3C; }
          .sky-month-option.cur { font-weight: 700; color: #C89B3C; background: #fdf8ef; }

          /* Weekday headers */
          .sky-weekdays {
            display: grid; grid-template-columns: repeat(7, 1fr);
            padding: 0 8px; margin-bottom: 1px;
          }
          .sky-wd {
            text-align: center; font-size: 12px; font-weight: 700;
            color: #9ca3af; padding: 4px 0; letter-spacing: 0.4px;
          }

          /* Day grid */
          .sky-days-grid {
            display: grid; grid-template-columns: repeat(7, 1fr);
            padding: 0 10px; row-gap: 1px;
          }
          .sky-day {
            position: relative; height: 44px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; user-select: none;
          }
          .sky-day-bg { position: absolute; inset: 0; z-index: 0; }
          .sky-day-num {
            position: relative; z-index: 2;
            width: 36px; height: 36px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; font-size: 14px; font-weight: 500; color: #111;
            transition: background 0.12s, color 0.12s;
          }
          .sky-day.overflow { cursor: default; pointer-events: none; }
          .sky-day.overflow .sky-day-num { color: #d1d5db; }
          .sky-day.past { cursor: default; pointer-events: none; }
          .sky-day.past .sky-day-num { color: #d1d5db; }
          .sky-day.out-disabled { cursor: not-allowed; pointer-events: none; }
          .sky-day.out-disabled .sky-day-num { color: #d1d5db; }
          .sky-day:not(.past):not(.overflow):not(.out-disabled):not(.sel-start):not(.sel-end):hover .sky-day-num {
            background: #e8f0fe; color: #1a56db;
          }
          .sky-day.in-range .sky-day-bg { background: #e8f0fe; }
          .sky-day.range-left .sky-day-bg { background: linear-gradient(to right, transparent 50%, #e8f0fe 50%); }
          .sky-day.range-right .sky-day-bg { background: linear-gradient(to left, transparent 50%, #e8f0fe 50%); }
          .sky-day.sel-start .sky-day-num,
          .sky-day.sel-end .sky-day-num {
            background: #1a56db !important;
            color: #fff !important;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(26,86,219,0.35);
          }
          .sky-day.is-today:not(.sel-start):not(.sel-end) .sky-day-num {
            border: 2px solid #C89B3C; font-weight: 700;
          }

          /* Unavailable (fully booked) */
          .sky-day.unavailable {
            cursor: not-allowed !important;
            pointer-events: none;
          }
          .sky-day.unavailable .sky-day-num {
            color: #ef4444 !important;
            text-decoration: line-through;
            opacity: 0.7;
          }

          /* Low availability — orange dot below number */
          .sky-day.low-avail .sky-day-num::after {
            content: '';
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            width: 5px; height: 5px;
            border-radius: 50%;
            background: #f97316;
          }
          .sky-day.low-avail:not(.sel-start):not(.sel-end):not(.unavailable) .sky-day-num {
            position: relative;
          }

          /* Footer */
          .sky-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding: 8px 14px 12px; border-top: 1px solid #f0f0f0; margin-top: 4px;
          }
          .sky-nights { font-size: 13px; color: #6b7280; }
          .sky-nights strong { color: #111; font-weight: 700; }
          .sky-apply-btn {
            background: #1a56db;
            color: #fff;
            border: none;
            border-radius: 50px;
            padding: 8px 22px;
            font-size: 13px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            letter-spacing: 0.5px;
            transition: background 0.15s;
          }
          .sky-apply-btn:hover { background: #1648c0; }

          @media (max-width: 480px) {
            .sky-cal-panel { width: 97vw; border-radius: 16px; }
            .sky-date-row { padding: 12px 16px; }
            .sky-row-value { font-size: 14px; }
            .sky-day { height: 46px; }
            .sky-day-num { width: 40px; height: 40px; font-size: 15px; }
            .sky-weekdays, .sky-days-grid { padding: 0 6px; }
            .sky-month-nav { padding: 12px 10px 8px; }
          }
        `}} />

        {/* Date rows — Rooms & Guests style */}
        <div className="sky-date-rows">
          <div
            className={`sky-date-row${activeSelection === 'in' ? ' active' : ''}`}
            onClick={() => {
              setActiveSelection('in');
              const d = parseDateStr(checkIn);
              setViewMonth(d.getMonth());
              setViewYear(d.getFullYear());
            }}
          >
            <div>
              <div className="sky-row-label">Check-in</div>
              <div className="sky-row-value">{fmtDisplay(checkIn)}</div>
            </div>
            <span className={`sky-row-badge${activeSelection === 'in' ? '' : ' inactive'}`}>
              {activeSelection === 'in' ? 'Selecting' : 'Tap to change'}
            </span>
          </div>

          <div
            className={`sky-date-row${activeSelection === 'out' ? ' active' : ''}`}
            onClick={() => {
              setActiveSelection('out');
              const d = parseDateStr(checkOut);
              setViewMonth(d.getMonth());
              setViewYear(d.getFullYear());
            }}
          >
            <div>
              <div className="sky-row-label">Check-out</div>
              <div className="sky-row-value">{fmtDisplay(checkOut)}</div>
            </div>
            <span className={`sky-row-badge${activeSelection === 'out' ? '' : ' inactive'}`}>
              {activeSelection === 'out' ? 'Selecting' : 'Tap to change'}
            </span>
          </div>
        </div>

        <div className="sky-cal-divider" />

        {/* Month navigation */}
        <div className="sky-month-nav">
          <button
            className="sky-nav-arrow"
            onClick={prevMonth}
            disabled={isAtOrBeforeToday}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="sky-month-title" onClick={() => setShowMonthPicker(p => !p)}>
            <span>{MONTHS[viewMonth]} {viewYear}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          <button className="sky-nav-arrow" onClick={nextMonth} aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {showMonthPicker && (
            <div className="sky-month-picker">
              {monthOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`sky-month-option${opt.month === viewMonth && opt.year === viewYear ? ' cur' : ''}`}
                  onClick={() => {
                    setViewMonth(opt.month);
                    setViewYear(opt.year);
                    setShowMonthPicker(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekday row */}
        <div className="sky-weekdays">
          {WEEKDAYS.map(w => <div key={w} className="sky-wd">{w}</div>)}
        </div>

        {/* Day grid */}
        <div className="sky-days-grid">
          {cells.map(({ date, overflow }, idx) => {
            const dateStr = fmtStr(date);
            const isPast = !overflow && date < today;
            const isOutDisabled = !overflow && activeSelection === 'out' && date <= checkInDate;
            const isStart = !overflow && sameDay(date, checkInDate);
            const isEnd = !overflow && sameDay(date, checkOutDate);
            const isToday = !overflow && sameDay(date, today);
            const inRange = !overflow && date > checkInDate && date < checkOutDate;
            const rangeLeft = isStart && !sameDay(checkInDate, checkOutDate);
            const rangeRight = isEnd && !sameDay(checkInDate, checkOutDate);
            const isUnavailable = !overflow && !isPast && unavailableDates.includes(dateStr);
            const isLowAvail = !overflow && !isPast && !isUnavailable && dateStr in lowAvailDates;
            const lowCount = isLowAvail ? lowAvailDates[dateStr] : 0;

            const cls = [
              'sky-day',
              overflow       ? 'overflow'     : '',
              isPast         ? 'past'         : '',
              isOutDisabled  ? 'out-disabled' : '',
              isUnavailable  ? 'unavailable'  : '',
              isStart        ? 'sel-start'    : '',
              isEnd          ? 'sel-end'      : '',
              inRange        ? 'in-range'     : '',
              rangeLeft      ? 'range-left'   : '',
              rangeRight     ? 'range-right'  : '',
              isToday        ? 'is-today'     : '',
              isLowAvail     ? 'low-avail'    : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={idx}
                className={cls}
                title={isUnavailable ? 'Sold out' : isLowAvail ? `Only ${lowCount} room${lowCount === 1 ? '' : 's'} left` : undefined}
                onClick={() => !overflow && !isPast && !isOutDisabled && !isUnavailable && handleDayClick(date, overflow)}
              >
                <div className="sky-day-bg" />
                <span className="sky-day-num">{date.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sky-footer">
          <span className="sky-nights">
            {nights > 0
              ? <><strong>{nights} night{nights !== 1 ? 's' : ''}</strong> · {MONTHS[checkInDate.getMonth()].slice(0,3)} {checkInDate.getDate()} → {MONTHS[checkOutDate.getMonth()].slice(0,3)} {checkOutDate.getDate()}</>
              : <span style={{color:'#9ca3af'}}>{activeSelection === 'in' ? 'Select check-in' : 'Select check-out'}</span>
            }
          </span>
          <button className="sky-apply-btn" onClick={onClose}>APPLY</button>
        </div>
      </div>
    </>
  );
}
