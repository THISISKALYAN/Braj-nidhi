import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, Globe } from 'lucide-react';

interface InvoiceReceiptProps {
  bookingRef: string;
  date: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomTitle: string;
  pricePerNight: number;
  nights: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
}

export default function InvoiceReceipt({
  bookingRef,
  date,
  guestName,
  guestEmail,
  guestPhone,
  roomTitle,
  pricePerNight,
  nights,
  subtotal,
  tax,
  grandTotal
}: InvoiceReceiptProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        <div className="inv-details-grid">
          <div className="inv-label">Invoice No.</div>
          <div className="inv-colon">:</div>
          <div className="inv-value">{bookingRef}</div>

          <div className="inv-label">Date</div>
          <div className="inv-colon">:</div>
          <div className="inv-value">{date}</div>

          <div className="inv-label">Invoice to</div>
          <div className="inv-colon">:</div>
          <div className="inv-value">
            <strong>{guestName}</strong><br/>
            {guestEmail}<br/>
            {guestPhone}
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
            <tr>
              <td style={{ textAlign: 'left' }}>
                Braj Nidhi Guesthouse<br/>
                <span style={{ fontSize: '12px', color: '#666' }}>{roomTitle}</span>
              </td>
              <td style={{ textAlign: 'center' }}>₹{pricePerNight.toLocaleString()}</td>
              <td style={{ textAlign: 'center' }}>{nights}</td>
              <td style={{ textAlign: 'right' }}>₹{(pricePerNight * nights).toLocaleString()}</td>
            </tr>
            {/* Add extra row to make it look full if needed, or just keep it simple */}
            <tr>
              <td colSpan={4} style={{ borderBottom: 'none', height: '20px' }}></td>
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
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="inv-total-row">
            <span>Tax (Included)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="inv-total-row inv-grand-total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
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
