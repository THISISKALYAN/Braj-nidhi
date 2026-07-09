import nodemailer from 'nodemailer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingNotificationPayload {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  roomName: string;
  checkIn: string;       // YYYY-MM-DD
  checkOut: string;      // YYYY-MM-DD
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  total: number;
  bookingRef: string;
  paymentId: string;
}

export interface NotificationResult {
  email: { sent: boolean; error?: string };
  whatsapp: { sent: boolean; error?: string };
  adminWhatsapp: { sent: boolean; error?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function roomColor(type: string) {
  if (type.includes('deluxe3')) return '#7c3aed';
  if (type.includes('deluxe4')) return '#C89B3C';
  return '#1a56db';
}

// ─── Beautiful HTML Email ─────────────────────────────────────────────────────

function buildEmailHTML(p: BookingNotificationPayload): string {
  const color = roomColor(p.roomType);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Booking Confirmed – Braj Nidhi</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${color} 0%,${color}cc 100%);padding:36px 36px 28px;text-align:center;">
            <img src="https://thebrajnidhi.com/Braj_nidhi_.webp" alt="Braj Nidhi" height="52" style="margin-bottom:16px;border-radius:8px;" onerror="this.style.display='none'"/>
            <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:28px;">✅</div>
            <h1 style="color:#ffffff;margin:0 0 6px;font-size:26px;font-weight:900;letter-spacing:0.3px;">Booking Confirmed!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">Radhe Radhe 🙏 Your stay at Braj Nidhi is locked in</p>
          </td>
        </tr>

        <!-- Booking Ref Banner -->
        <tr>
          <td style="padding:0 36px;">
            <div style="background:#f8f9fa;border-radius:10px;margin:24px 0 0;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e9ecef;">
              <span style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Booking Reference</span>
              <span style="font-size:16px;font-weight:900;color:#111;letter-spacing:1px;font-family:monospace;">${p.bookingRef}</span>
            </div>
          </td>
        </tr>

        <!-- Stay Summary Widget -->
        <tr>
          <td style="padding:18px 36px 0;">
            <table width="100%" style="background:#fff;border:1px solid #e9ecef;border-radius:14px;overflow:hidden;">
              <tr>
                <td align="center" style="padding:18px 8px 14px;border-right:1px solid #f0f0f0;">
                  <div style="font-size:22px;margin-bottom:6px;">🛏️</div>
                  <div style="font-size:22px;font-weight:900;color:#111;line-height:1;">${p.rooms}</div>
                  <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.9px;margin-top:4px;">Room${p.rooms > 1 ? 's' : ''}</div>
                </td>
                <td align="center" style="padding:18px 8px 14px;border-right:1px solid #f0f0f0;">
                  <div style="font-size:22px;margin-bottom:6px;">🌙</div>
                  <div style="font-size:22px;font-weight:900;color:#C89B3C;line-height:1;">${p.nights}</div>
                  <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.9px;margin-top:4px;">Night${p.nights !== 1 ? 's' : ''}</div>
                </td>
                <td align="center" style="padding:18px 8px 14px;">
                  <div style="font-size:22px;margin-bottom:6px;">👥</div>
                  <div style="font-size:22px;font-weight:900;color:#111;line-height:1;">${p.adults + p.children}</div>
                  <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.9px;margin-top:4px;">Guest${p.adults + p.children !== 1 ? 's' : ''}</div>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="background:#fafafa;border-top:1px solid #f0f0f0;padding:9px 14px;text-align:center;">
                  <span style="font-size:12px;color:#374151;font-weight:700;">${fmtDate(p.checkIn)}</span>
                  <span style="font-size:11px;color:#C89B3C;font-weight:700;margin:0 10px;">── ${p.nights}N ──</span>
                  <span style="font-size:12px;color:#374151;font-weight:700;">${fmtDate(p.checkOut)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Room & Details -->
        <tr>
          <td style="padding:18px 36px 0;">
            <table width="100%" style="border:1px solid #e9ecef;border-radius:12px;overflow:hidden;">
              <tr style="background:#f8f9fa;">
                <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;" colspan="2">Booking Details</td>
              </tr>
              ${[
                ['Room Type', p.roomName],
                ['Check-In', `${fmtDate(p.checkIn)} · 12:00 PM`],
                ['Check-Out', `${fmtDate(p.checkOut)} · 11:00 AM`],
                ['Adults', String(p.adults)],
                ['Children', String(p.children)],
              ].map(([label, val], i) => `
              <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
                <td style="padding:11px 16px;font-size:13px;color:#6b7280;font-weight:600;width:120px;">${label}</td>
                <td style="padding:11px 16px;font-size:13px;color:#111;font-weight:700;">${val}</td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- Total Amount -->
        <tr>
          <td style="padding:18px 36px 0;">
            <div style="background:linear-gradient(135deg,${color} 0%,${color}cc 100%);border-radius:12px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;margin-bottom:3px;">TOTAL PAID</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.55);">Incl. all taxes &amp; GST</div>
              </div>
              <div style="font-size:28px;font-weight:900;color:#fff;">₹${p.total.toLocaleString('en-IN')}</div>
            </div>
          </td>
        </tr>

        <!-- Property Info -->
        <tr>
          <td style="padding:18px 36px 0;">
            <div style="background:#fff8e7;border:1px solid rgba(200,155,60,0.25);border-radius:12px;padding:16px 18px;">
              <div style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Property</div>
              <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">Braj Nidhi Guesthouse</div>
              <div style="font-size:13px;color:#6b7280;">📍 Braj Nidhi Guest House, Vrindavan Chandrodaya Mandir, Bhaktivedanata Swami Marg, Vrindavan, UP – 281121</div>
              <div style="font-size:13px;color:#6b7280;margin-top:4px;">📞 +91 97600 00000</div>
            </div>
          </td>
        </tr>

        <!-- Check-in Instructions -->
        <tr>
          <td style="padding:18px 36px 0;">
            <div style="border:1px solid #e9ecef;border-radius:12px;padding:16px 18px;">
              <div style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Important Information</div>
              ${[
                '🕛 Check-in from 12:00 PM, Check-out by 11:00 AM',
                '🪪 Please carry a valid government ID at check-in',
                '🚫 Property is a no alcohol, no non-veg premises',
                '🙏 Temple darshan & spiritual activities arranged on request',
              ].map(line => `<div style="font-size:13px;color:#374151;margin-bottom:7px;">${line}</div>`).join('')}
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 36px;text-align:center;border-top:1px solid #f0f0f0;margin-top:24px;">
            <p style="font-size:13px;color:#9ca3af;margin:0 0 6px;">Questions? Reply to this email or WhatsApp us</p>
            <p style="font-size:14px;font-weight:700;color:${color};margin:0;">Jai Shri Krishna 🙏</p>
            <p style="font-size:11px;color:#d1d5db;margin:12px 0 0;">© Braj Nidhi Guesthouse · thebrajnidhi.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Plain-text email ─────────────────────────────────────────────────────────

function buildEmailText(p: BookingNotificationPayload): string {
  return `Radhe Radhe! 🙏 Booking Confirmed at Braj Nidhi Guesthouse

Booking Reference: ${p.bookingRef}
Payment ID: ${p.paymentId}

STAY DETAILS
────────────
Room: ${p.roomName}
Check-In:  ${fmtDate(p.checkIn)} · 12:00 PM
Check-Out: ${fmtDate(p.checkOut)} · 11:00 AM
Nights: ${p.nights}  |  Rooms: ${p.rooms}  |  Guests: ${p.adults + p.children}
Total Paid: ₹${p.total.toLocaleString('en-IN')} (incl. GST)

PROPERTY
────────
Braj Nidhi Guesthouse
Vrindavan Chandrodaya Mandir, Bhaktivedanata Swami Marg, Vrindavan, UP – 281121

• Check-in from 12:00 PM, Check-out by 11:00 AM
• Carry a valid government ID at check-in
• No alcohol, no non-veg premises

Jai Shri Krishna 🙏
Braj Nidhi Team`;
}

// ─── WhatsApp message text ────────────────────────────────────────────────────

function buildWhatsAppMessage(p: BookingNotificationPayload): string {
  return `🙏 *Radhe Radhe! Booking Confirmed*

✅ *Braj Nidhi Guesthouse, Vrindavan*

📋 *Ref:* ${p.bookingRef}
🛏️ *Room:* ${p.roomName}
📅 *Check-in:* ${fmtDate(p.checkIn)} · 12 PM
📅 *Check-out:* ${fmtDate(p.checkOut)} · 11 AM
🌙 *Nights:* ${p.nights}  |  🛏️ *Rooms:* ${p.rooms}  |  👥 *Guests:* ${p.adults + p.children}
💰 *Total Paid:* ₹${p.total.toLocaleString('en-IN')}

📍 Vrindavan Chandrodaya Mandir, Bhaktivedanata Swami Marg, Vrindavan – 281121

ℹ️ Carry valid ID at check-in · No alcohol · No non-veg

_Jai Shri Krishna_ 🙏`;
}

function buildAdminWhatsAppMessage(p: BookingNotificationPayload): string {
  return `🔔 *New Booking Alert – Braj Nidhi*

👤 *Guest:* ${p.guestName}
📧 ${p.guestEmail}
📞 ${p.guestPhone}

🛏️ *Room:* ${p.roomName} × ${p.rooms}
📅 *In:* ${fmtDate(p.checkIn)}  →  *Out:* ${fmtDate(p.checkOut)}
🌙 *${p.nights} nights* · 👥 *${p.adults + p.children} guests*
💰 *Total:* ₹${p.total.toLocaleString('en-IN')}

📋 *Ref:* ${p.bookingRef}
🆔 *Payment:* ${p.paymentId}`;
}

// ─── Email via Nodemailer (Generic SMTP — works with any provider) ────────────
//
// Works with: cPanel / Hosting Mail, Zoho, Outlook/Office365, Yahoo,
//             custom domain (mail.yourdomain.com), etc.
//
// Required env vars:
//   SMTP_HOST     → e.g. mail.brajnidhi.com  or  smtp.zoho.com
//   SMTP_PORT     → 587 (TLS/STARTTLS, recommended) or 465 (SSL)
//   SMTP_USER     → full email address  e.g. bookings@brajnidhi.com
//   SMTP_PASS     → email account password (or app password if 2FA is on)
//   SMTP_FROM     → display name + address e.g. "Braj Nidhi" <bookings@brajnidhi.com>
//                   (optional — defaults to SMTP_USER if not set)

import { generateBookingPDF } from '@/lib/pdf';

async function sendEmail(p: BookingNotificationPayload): Promise<{ sent: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER || 'bookings@thebrajnidhi.com';
  const pass = process.env.SMTP_PASS;
  
  // Use bookings@thebrajnidhi.com as the official sender and receiver
  const fromRaw = `"Braj Nidhi" <bookings@thebrajnidhi.com>`;

  if (!host || !user || !pass) {
    return {
      sent: false,
      error: 'SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local',
    };
  }
  if (!p.guestEmail) {
    return { sent: false, error: 'No guest email address provided' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = buildEmailHTML(p);
    
    // Generate the PDF
    const pdfBuffer = await generateBookingPDF(htmlContent);

    await transporter.sendMail({
      from: fromRaw,
      to: p.guestEmail,
      bcc: 'bookings@thebrajnidhi.com', // BCC the admin address
      subject: `✅ Booking Confirmed – ${p.bookingRef} | Braj Nidhi, Vrindavan`,
      text: buildEmailText(p),
      html: htmlContent,
      attachments: [
        {
          filename: `BrajNidhi_Booking_${p.bookingRef}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ]
    });

    return { sent: true };
  } catch (e: any) {
    console.error('Error sending email:', e);
    return { sent: false, error: e.message };
  }
}

// ─── WhatsApp via Meta Cloud API (free — 1000 conversations/month) ────────────

async function sendWhatsAppMeta(phone: string, message: string): Promise<{ sent: boolean; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { sent: false, error: 'WhatsApp Meta API not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)' };
  }

  // Sanitise: remove +, spaces, dashes; ensure starts with country code
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { sent: false, error: data.error?.message ?? JSON.stringify(data) };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

// ─── WhatsApp via CallMeBot (free — admin-only, pre-registered number) ────────
// Register at https://www.callmebot.com/blog/free-api-whatsapp-messages/

async function sendWhatsAppCallMeBot(phone: string, message: string): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const botPhone = process.env.CALLMEBOT_PHONE ?? phone;

  if (!apiKey) {
    return { sent: false, error: 'CallMeBot not configured (CALLMEBOT_API_KEY)' };
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${botPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const text = await res.text();
    if (!res.ok || text.toLowerCase().includes('error')) {
      return { sent: false, error: text.slice(0, 200) };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function sendBookingNotifications(
  p: BookingNotificationPayload,
): Promise<NotificationResult> {
  const adminPhone = process.env.ADMIN_WHATSAPP_PHONE ?? '7037794300';

  // Run all in parallel — failures in one channel don't block others
  const [emailResult, guestWaResult, adminWaResult, ccAdminWaResult] = await Promise.all([
    // 1. Email to guest (+ BCC to yourself)
    sendEmail(p),

    // 2. WhatsApp to guest — try Meta API first
    sendWhatsAppMeta(p.guestPhone, buildWhatsAppMessage(p)),

    // 3. WhatsApp admin alert — try CallMeBot (free, no per-message limit for admin)
    sendWhatsAppCallMeBot(adminPhone, buildAdminWhatsAppMessage(p)),
    
    // 4. CC admin on the exact same message sent to the guest
    sendWhatsAppMeta('7037794300', buildWhatsAppMessage(p)),
  ]);

  // If Meta guest WA failed, log it but don't retry (guest already gets email)
  const result: NotificationResult = {
    email: emailResult,
    whatsapp: guestWaResult,
    adminWhatsapp: adminWaResult,
  };

  console.log('[Notifications]', JSON.stringify(result, null, 2));
  return result;
}
