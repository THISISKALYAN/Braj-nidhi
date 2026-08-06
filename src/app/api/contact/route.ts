import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limit: 3 req/min per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`contact:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const { formType, name, firstName, lastName, email, phone, ...rest } = body;

    const contactName = name || (firstName ? `${firstName} ${lastName}` : '') || 'Guest';

    if (!email || !contactName || !phone || !formType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let toEmail = 'support@thebrajnidhi.com';
    let subject = `New Inquiry from ${contactName}`;
    let title = 'New General Inquiry';

    if (formType === 'wedding') {
      toEmail = 'weddings@thebrajnidhi.com';
      subject = `New Wedding Inquiry from ${contactName}`;
      title = 'New Wedding Inquiry';
    } else if (formType === 'corporate') {
      toEmail = 'corporateevents@thebrajnidhi.com';
      subject = `New Corporate Inquiry from ${contactName}`;
      title = 'New Corporate Inquiry';
    } else if (formType === 'contact') {
      toEmail = 'support@thebrajnidhi.com';
      subject = `New Contact Form Submission from ${contactName}`;
      title = 'New Contact Submission';
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const user = process.env.SMTP_USER || 'bookings@thebrajnidhi.com';
    const pass = process.env.SMTP_PASS;
    const fromRaw = `"Braj Nidhi" <bookings@thebrajnidhi.com>`;

    if (!host || !user || !pass) {
      return Response.json({ error: 'SMTP not configured' }, { status: 500 });
    }

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

    const fieldsHtml = Object.entries(rest)
      .map(
        ([key, value]) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${value}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:#c45c26;padding:24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px; font-size:16px;">You have received a new inquiry from the Braj Nidhi website.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Name</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${contactName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Phone</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
              </tr>
              ${fieldsHtml}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromRaw,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return Response.json({ success: true });
  } catch (e: any) {
    console.error('[/api/contact] Error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
