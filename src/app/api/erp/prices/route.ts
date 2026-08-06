/**
 * GET /api/erp/prices?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Single place the whole site asks for nightly rates. Queries the ERP's
 * `search_rooms` for the given stay and returns a per-room-type price map,
 * merged over the fallback rate card.
 *
 * Dates default to today → tomorrow so pages that show a room list before the
 * guest has picked dates still display today's ERP rate rather than a static
 * number.
 *
 * `source` tells you where each figure came from, and `diagnostics` exposes the
 * raw ERP reply plus the room-type mapping trace — that is what to read when the
 * site shows rate-card prices instead of the rates set in the ERP.
 */
import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import {
  addDays,
  extractErpPrices,
  resolvePrices,
  todayInIndia,
  type RoomKey,
} from '@/lib/roomPricing';

const ERP_API_KEY = process.env.ERP_API_KEY;
const ERP_API_SECRET = process.env.ERP_API_SECRET;
const ERP_BASE_URL =
  process.env.ERP_BASE_URL ||
  'https://erp.vcmerp.in/api/method/guesthouse.website_booking_api';

/**
 * Short in-process cache. Room lists poll, and several components on one page
 * ask for the same dates; 30s keeps the ERP from being hit once per component
 * while still picking up a same-day rate change quickly.
 */
const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; body: unknown }>();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`erp-prices:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const params = req.nextUrl.searchParams;
  const today = todayInIndia();

  const from = DATE_RE.test(params.get('from') ?? '') ? params.get('from')! : today;
  const rawTo = params.get('to') ?? '';
  const to = DATE_RE.test(rawTo) && rawTo > from ? rawTo : addDays(from, 1);

  const guests = Math.min(20, Math.max(1, Number(params.get('guests')) || 2));
  const rooms = Math.min(20, Math.max(1, Number(params.get('rooms')) || 1));
  const debug = params.get('debug') === '1';

  // Keyed on the stay dates only. The ERP request below deliberately fixes
  // guests and rooms at 1 so every room type is returned, so the reply depends
  // on nothing else — including guests and rooms in the key would just split the
  // cache into identical copies.
  const cacheKey = `${from}|${to}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS && !debug) {
    return Response.json({ ...(hit.body as object), cached: true });
  }

  if (!ERP_API_KEY || !ERP_API_SECRET) {
    return Response.json({
      prices: {},
      source: 'fallback',
      reason: 'ERP credentials are not configured on the server.',
      from,
      to,
      guests,
      rooms,
    });
  }

  try {
    const erpResponse = await fetch(`${ERP_BASE_URL.replace(/\/$/, '')}.search_rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${ERP_API_KEY}:${ERP_API_SECRET}`,
      },
      body: JSON.stringify({
        property: process.env.ERP_PROPERTY || 'BRAJ-NIDHI-GUEST-HOUSE-VRN',
        check_in_date: from,
        check_out_date: to,
        // This call exists to read the nightly rate of every room type, not to
        // test whether a particular party fits. The ERP filters availableRooms
        // by occupancy, so asking for the party's per-room average silently
        // dropped every type too small to seat it — 7 guests over 2 rooms asked
        // for 4 per room and returned only Deluxe 4, leaving Deluxe 2 and 3 with
        // no price and the card showing "Check Price". Asking for the minimum
        // returns them all; capacity is enforced separately from ROOM_CAPACITY.
        guests: 1,
        // Likewise 1 room, so a type with only a single room free is still listed.
        rooms: 1,
        booking_type: process.env.ERP_BOOKING_TYPE || 'Walk-In',
        hold_type: process.env.ERP_HOLD_TYPE,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const text = await erpResponse.text();
    let payload: Record<string, unknown>;
    try {
      const parsed = JSON.parse(text);
      // Frappe wraps whitelisted method results in `message`.
      payload = (parsed.message ?? parsed) as Record<string, unknown>;
    } catch {
      payload = { raw: text.slice(0, 500) };
    }

    if (!erpResponse.ok) {
      console.warn('[/api/erp/prices] ERP returned HTTP', erpResponse.status);
      return Response.json({
        prices: {},
        source: 'fallback',
        reason: `ERP responded with HTTP ${erpResponse.status}.`,
        from,
        to,
        guests,
        rooms,
        diagnostics: debug ? { erpResponse: payload } : undefined,
      });
    }

    const availableRooms = payload.availableRooms;
    const { prices: livePrices, trace } = extractErpPrices(availableRooms);
    const resolved = resolvePrices(livePrices);
    const liveKeys = Object.keys(livePrices) as RoomKey[];

    const body = {
      prices: resolved,
      /** Which room types actually came from the ERP this request. */
      livePriced: liveKeys,
      source:
        liveKeys.length === 0
          ? 'fallback'
          : liveKeys.length === 3
            ? 'erp'
            : 'partial',
      reason:
        liveKeys.length === 0
          ? Array.isArray(availableRooms) && availableRooms.length === 0
            ? 'ERP returned zero available rooms for these dates, so it supplied no rates. Check room inventory/availability in the ERP for this property and date range.'
            : 'ERP returned rooms but none carried a usable pricePerNight.'
          : undefined,
      from,
      to,
      guests,
      rooms,
      diagnostics: {
        erpRoomCount: Array.isArray(availableRooms) ? availableRooms.length : null,
        unavailableRoomCount: Array.isArray(payload.unavailableRooms)
          ? (payload.unavailableRooms as unknown[]).length
          : null,
        mappingTrace: trace,
        ...(debug ? { erpResponse: payload } : {}),
      },
    };

    cache.set(cacheKey, { at: Date.now(), body });
    return Response.json(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[/api/erp/prices] ERP request failed:', message);

    return Response.json({
      prices: {},
      source: 'fallback',
      reason: `Could not reach the ERP: ${message}`,
      from,
      to,
      guests,
      rooms,
    });
  }
}
