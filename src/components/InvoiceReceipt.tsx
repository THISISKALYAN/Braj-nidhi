import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, Globe } from 'lucide-react';
import { GST_RATE_PERCENTAGE } from '@/config/taxes';

export interface InvoiceItem {
  name: string;
  subtitle?: string;
  price: number;
  qty: number;
  total: number;
}

interface InvoiceReceiptProps {
  bookingRef: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomsCount?: number;
  adults?: number;
  children?: number;
  paymentId?: string;
  roomTitle: string;
  pricePerNight: number;
  nights: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  items?: InvoiceItem[];
}

export default function InvoiceReceipt({
  bookingRef,
  date,
  checkIn,
  checkOut,
  guestName,
  guestEmail,
  guestPhone,
  roomsCount,
  adults,
  children,
  paymentId,
  roomTitle,
  pricePerNight,
  nights,
  subtotal,
  tax,
  grandTotal,
  items
}: InvoiceReceiptProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalRooms = roomsCount || 1;
  const displayItems = items && items.length > 0 ? items : [
    {
      name: roomTitle,
      subtitle: `${totalRooms} Room${totalRooms > 1 ? 's' : ''} × ${nights} Night${nights > 1 ? 's' : ''}`,
      price: pricePerNight,
      qty: totalRooms * nights,
      total: pricePerNight * totalRooms * nights
    }
  ];

  return createPortal(
    <div className="invoice-receipt-container">
      {/* Abstract Background Shapes */}
      <div className="inv-shape inv-shape-top-right"></div>
      <div className="inv-shape inv-shape-bottom-left"></div>

      {/* Header */}
      <div className="inv-header">
        <div className="inv-logo-area">
          <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" alt="Braj Nidhi Logo" style={{ height: '60px', width: 'auto' }} />
        </div>
        <div className="inv-title-area">
          <h1>INVOICE</h1>
          <div className="inv-abstract-circles">
            <div className="inv-circle-yellow"></div>
            <div className="inv-circle-outline"></div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="inv-details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '10px' }}>
          <div className="inv-details-grid" style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr', rowGap: '6px' }}>
            <div className="inv-label">Invoice No.</div>
            <div className="inv-colon">:</div>
            <div className="inv-value"><strong>{bookingRef}</strong></div>

            <div className="inv-label">Invoice Date</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">{date}</div>

            {paymentId && (
              <>
                <div className="inv-label">Payment ID</div>
                <div className="inv-colon">:</div>
                <div className="inv-value" style={{ wordBreak: 'break-all', fontSize: '12px' }}>{paymentId}</div>
              </>
            )}

            <div className="inv-label">Invoice To</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">
              <strong>{guestName}</strong><br/>
              {guestEmail && <>{guestEmail}<br/></>}
              {guestPhone}
            </div>
          </div>

          <div className="inv-details-grid" style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr', rowGap: '6px' }}>
            <div className="inv-label">Check-In</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">{checkIn ? <><strong>{checkIn}</strong> (1:00 PM)</> : '—'}</div>

            <div className="inv-label">Check-Out</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">{checkOut ? <><strong>{checkOut}</strong> (11:00 AM)</> : '—'}</div>

            <div className="inv-label">Duration</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">{nights} {nights === 1 ? 'Night' : 'Nights'}</div>

            <div className="inv-label">Occupancy</div>
            <div className="inv-colon">:</div>
            <div className="inv-value">
              {totalRooms} {totalRooms === 1 ? 'Room' : 'Rooms'} · {adults || 1} Adult(s){children ? `, ${children} Child(ren)` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="inv-table-container">
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '55%' }}>Item name</th>
              <th style={{ textAlign: 'center', width: '15%' }}>Price</th>
              <th style={{ textAlign: 'center', width: '10%' }}>Qty</th>
              <th style={{ textAlign: 'right', width: '20%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'left' }}>
                  <strong>Braj Nidhi Guesthouse</strong><br/>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{item.name}</span>
                  {item.subtitle && <div style={{ fontSize: '12px', color: '#666' }}>{item.subtitle}</div>}
                </td>
                <td style={{ textAlign: 'center' }}>₹{item.price.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td style={{ textAlign: 'right' }}>₹{item.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ borderBottom: 'none', height: '16px' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Totals Section */}
      <div className="inv-bottom-section">
        <div className="inv-terms">
          <h4>Terms and conditions</h4>
          <p>
            Please note that check-in time is 1:00 PM and check-out time is 11:00 AM. 
            Cancellation policies apply as per the booking agreement.
          </p>
        </div>
        <div className="inv-totals">
          <div className="inv-total-row">
            <span>Subtotal (Taxable)</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="inv-total-row">
            <span>GST ({GST_RATE_PERCENTAGE}% Included)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="inv-total-row inv-grand-total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Signatures & Contacts */}
      <div className="inv-footer">
        <div className="inv-contacts">
          <div className="inv-contact-item">
            <div className="inv-icon"><Mail size={12}/></div>
            <span>support@thebrajnidhi.com</span>
          </div>
          <div className="inv-contact-item">
            <div className="inv-icon"><Phone size={12}/></div>
            <span>7037794300</span>
          </div>
          <div className="inv-contact-item">
            <div className="inv-icon"><Globe size={12}/></div>
            <span>thebrajnidhi.com</span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom */}
      <div className="inv-bottom-decor">
        <span>Follow our social media <strong>@brajnidhi</strong></span>
        <div className="inv-bottom-bar"></div>
      </div>
    </div>,
    document.body
  );
}
