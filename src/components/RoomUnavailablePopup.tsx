"use client";

import React, { useEffect, useRef } from 'react';

export interface RoomUnavailablePopupProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  requested: number;
  available: number;
  checkIn?: string;
  checkOut?: string;
  onTryOtherDates?: () => void;
  onSelectOtherRoom?: () => void;
  onBookAvailable?: () => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtDate(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(y, m - 1, day);
  return `${DAYS[dt.getDay()]}, ${day} ${MONTHS[m - 1]} ${y}`;
}

export default function RoomUnavailablePopup({
  isOpen,
  onClose,
  roomName,
  requested,
  available,
  checkIn,
  checkOut,
  onTryOtherDates,
  onSelectOtherRoom,
  onBookAvailable,
}: RoomUnavailablePopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dateRange = checkIn && checkOut
    ? `${fmtDate(checkIn)}  →  ${fmtDate(checkOut)}`
    : null;

  return (
    <>
      <style>{`
        @keyframes rupFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rupSlideUp {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .rup-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 200000;
          animation: rupFadeIn 0.2s ease;
        }
        .rup-card {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 200001;
          background: #fff;
          border-radius: 22px;
          width: min(520px, calc(100vw - 28px));
          max-height: 96vh;
          overflow-y: auto;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.04),
            0 24px 68px rgba(0, 0, 0, 0.22),
            0 8px 20px rgba(0, 0, 0, 0.08);
          font-family: var(--font-outfit), sans-serif;
          animation: rupSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Top accent stripe */
        .rup-accent-stripe {
          height: 5px;
          border-radius: 22px 22px 0 0;
          background: linear-gradient(90deg, #b91c1c, #ef4444, #f97316, #eab308);
        }

        .rup-body {
          padding: 28px 30px 24px;
          text-align: center;
        }

        /* Icon circle */
        .rup-icon-wrap {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fef2f2, #fff1f2);
          border: 2px solid #fecaca;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .rup-icon-inner {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fee2e2, #fecdd3);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
        }

        .rup-title {
          font-family: var(--font-bebas-neue), var(--font-outfit), sans-serif;
          font-size: 26px;
          letter-spacing: 0.8px;
          color: #b91c1c;
          margin-bottom: 6px;
          font-weight: 400;
        }
        .rup-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 22px;
        }

        /* Info card */
        .rup-info-card {
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 18px;
          text-align: left;
        }
        .rup-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .rup-info-row + .rup-info-row {
          border-top: 1px solid #f0f0f0;
        }
        .rup-info-label {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rup-info-value {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }

        /* Availability gauge */
        .rup-gauge-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #fef2f2, #fff7ed);
          border: 1px solid #fecaca;
          border-radius: 12px;
        }
        .rup-gauge-bar-bg {
          flex: 1; height: 8px;
          background: #fee2e2;
          border-radius: 99px;
          overflow: hidden;
        }
        .rup-gauge-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rup-gauge-label {
          font-size: 13px; font-weight: 700;
          color: #b91c1c;
          white-space: nowrap;
        }

        /* Date row */
        .rup-dates {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #6b7280;
        }
        .rup-date-chip {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 6px 12px;
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        }
        .rup-date-arrow {
          color: #c89b3c;
          font-weight: 700;
        }

        /* Message text */
        .rup-message {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.65;
          margin-bottom: 22px;
        }
        .rup-message strong {
          color: #111;
        }

        /* Divider */
        .rup-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 0 0 20px;
        }

        /* Buttons */
        .rup-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .rup-btn {
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          font-family: var(--font-outfit), sans-serif;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .rup-btn:hover { transform: translateY(-1px); }
        .rup-btn-primary {
          background: linear-gradient(135deg, #1d6de5, #1557c0);
          color: #fff;
          box-shadow: 0 4px 14px rgba(29, 109, 229, 0.3);
        }
        .rup-btn-primary:hover {
          box-shadow: 0 8px 22px rgba(29, 109, 229, 0.4);
        }
        .rup-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }
        .rup-btn-secondary:hover {
          background: #e5e7eb;
        }
        .rup-btn-gold {
          background: linear-gradient(135deg, #C89B3C, #a67c2e);
          color: #fff;
          box-shadow: 0 4px 14px rgba(200, 155, 60, 0.3);
        }
        .rup-btn-gold:hover {
          box-shadow: 0 8px 22px rgba(200, 155, 60, 0.4);
        }

        /* Footer */
        .rup-footer {
          padding: 14px 30px 18px;
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
          border-radius: 0 0 22px 22px;
          text-align: center;
        }
        .rup-footer-text {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.5;
        }
        .rup-footer-brand {
          font-weight: 700;
          color: #C89B3C;
        }

        /* Close button */
        .rup-close {
          position: absolute;
          top: 16px; right: 16px;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #6b7280;
          transition: all 0.15s;
          z-index: 1;
        }
        .rup-close:hover {
          background: rgba(0,0,0,0.1);
          color: #111;
        }

        @media (max-width: 480px) {
          .rup-card { border-radius: 18px; }
          .rup-accent-stripe { border-radius: 18px 18px 0 0; }
          .rup-body { padding: 22px 20px 18px; }
          .rup-footer { padding: 12px 20px 16px; border-radius: 0 0 18px 18px; }
          .rup-title { font-size: 22px; }
          .rup-actions { flex-direction: column; }
          .rup-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="rup-overlay"
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      />

      {/* Card */}
      <div className="rup-card" role="dialog" aria-modal="true" aria-label="Room unavailable">
        <div className="rup-accent-stripe" />

        <button className="rup-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>

        <div className="rup-body">
          {/* Icon */}
          <div className="rup-icon-wrap">
            <div className="rup-icon-inner">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>

          <div className="rup-title">Room Unavailable</div>
          <div className="rup-subtitle">
            Thank you for choosing <strong style={{ color: '#C89B3C' }}>Braj Nidhi</strong>
          </div>

          {/* Info card */}
          <div className="rup-info-card">
            <div className="rup-info-row">
              <span className="rup-info-label">Room Type</span>
              <span className="rup-info-value">{roomName}</span>
            </div>
            <div className="rup-info-row">
              <span className="rup-info-label">Requested</span>
              <span className="rup-info-value" style={{ color: '#b91c1c' }}>
                {requested} Room{requested !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="rup-info-row">
              <span className="rup-info-label">Available</span>
              <span className="rup-info-value" style={{ color: available > 0 ? '#c2410c' : '#b91c1c' }}>
                {available > 0 ? `${available} Room${available !== 1 ? 's' : ''}` : 'Sold Out'}
              </span>
            </div>
          </div>

          {/* Availability gauge */}
          {requested > 0 && (
            <div className="rup-gauge-wrap">
              <div className="rup-gauge-bar-bg">
                <div
                  className="rup-gauge-bar-fill"
                  style={{
                    width: `${Math.min(100, (available / requested) * 100)}%`,
                    background: available === 0
                      ? '#ef4444'
                      : 'linear-gradient(90deg, #f97316, #eab308)',
                  }}
                />
              </div>
              <span className="rup-gauge-label">
                {available}/{requested}
              </span>
            </div>
          )}

          {/* Date range */}
          {dateRange && (
            <div className="rup-dates">
              <span className="rup-date-chip">{fmtDate(checkIn!)}</span>
              <span className="rup-date-arrow">→</span>
              <span className="rup-date-chip">{fmtDate(checkOut!)}</span>
            </div>
          )}

          {/* Message */}
          <div className="rup-message">
            The selected <strong>{roomName}</strong> is not available in the quantity
            requested for your selected dates.
            <br /><br />
            Please select different dates or choose another room category
            to proceed with your booking.
            <br /><br />
            We apologize for the inconvenience and appreciate your understanding.
          </div>

          <div className="rup-divider" />

          {/* Action buttons */}
          <div className="rup-actions">
            {onTryOtherDates && (
              <button className="rup-btn rup-btn-primary" onClick={onTryOtherDates}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Try Other Dates
              </button>
            )}
            {onBookAvailable && available > 0 && available < requested && (
              <button className="rup-btn rup-btn-gold" onClick={onBookAvailable}>
                Book {available} Room{available !== 1 ? 's' : ''} Instead
              </button>
            )}
            {onSelectOtherRoom && (
              <button className="rup-btn rup-btn-secondary" onClick={onSelectOtherRoom}>
                Select Another Room
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="rup-footer">
          <div className="rup-footer-text">
            <span className="rup-footer-brand">Braj Nidhi Guesthouse</span> &middot; Chattikara Road, Vrindavan
            <br />A pure sattvic spiritual heritage property
          </div>
        </div>
      </div>
    </>
  );
}
