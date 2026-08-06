import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

const ERP_API_KEY = process.env.ERP_API_KEY;
const ERP_API_SECRET = process.env.ERP_API_SECRET;
const ERP_BASE_URL =
  process.env.ERP_BASE_URL ||
  'https://erp.vcmerp.in/api/method/guesthouse.website_booking_api';

/**
 * Whitelist of ERP methods that are safe to call from the frontend.
 * Any method NOT in this list is rejected with 403.
 */
const ALLOWED_ERP_METHODS = new Set([
  'search_rooms',
  'create_reservation',
  'get_reservation',
  'cancel_reservation',
  'get_property_info',
  'confirm_payment',
]);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ method: string }> },
) {
  // ── Rate limit: 10 req/min per IP ────────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(`erp-proxy:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    if (!ERP_API_KEY || !ERP_API_SECRET) {
      return Response.json(
        { error: 'ERP credentials are not configured on the server.' },
        { status: 500 },
      );
    }

    const { method } = await context.params;

    // ── Whitelist check — reject unknown methods ─────────────────────────────
    if (!ALLOWED_ERP_METHODS.has(method)) {
      return Response.json(
        { error: `ERP method '${method}' is not permitted` },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (method === 'create_reservation') {
      const checkInDate = body.check_in_date;
      if (checkInDate) {
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
        if (checkInDate < todayStr) {
          return Response.json(
            { error: 'Backdated reservations are not allowed' },
            { status: 400 },
          );
        }
      }
    }

    const targetUrl = `${ERP_BASE_URL.replace(/\/$/, '')}.${method}`;

    const erpResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${ERP_API_KEY}:${ERP_API_SECRET}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    const text = await erpResponse.text();
    let responseData: any;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { raw: text };
    }

    if (!erpResponse.ok) {
      return Response.json(
        {
          error: responseData.exception || responseData.exc || 'ERP Request Failed',
          details: responseData,
        },
        { status: erpResponse.status },
      );
    }

    const result =
      responseData.message !== undefined ? responseData.message : responseData;
    return Response.json(result);
  } catch (error: any) {
    console.error('ERP API Proxy Error:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
