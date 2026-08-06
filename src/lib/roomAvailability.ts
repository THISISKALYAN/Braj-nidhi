import fs from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomType = 'deluxe2' | 'deluxe3' | 'deluxe4';

export const TOTAL_ROOMS: Record<RoomType, number> = {
  deluxe2: Number(process.env.ERP_HOLD_QUOTA_DELUXE2) || 1,
  deluxe3: Number(process.env.ERP_HOLD_QUOTA_DELUXE3) || 2,
  deluxe4: Number(process.env.ERP_HOLD_QUOTA_DELUXE4) || 1,
};

export const UPGRADE_ORDER: RoomType[] = ['deluxe2', 'deluxe3', 'deluxe4'];

export const ROOM_NAMES: Record<RoomType, string> = {
  deluxe2: 'Deluxe 2 – Twin Bedded Room',
  deluxe3: 'Deluxe 3 – Triple Room',
  deluxe4: 'Deluxe 4 – Family Room',
};



export interface BookingRecord {
  id: string;
  roomType: RoomType;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  rooms: number;
  adults: number;
  children: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  bookedAt: string;  // ISO timestamp
  status: 'confirmed' | 'cancelled';
  erpReservationId?: string;
  erpSyncStatus?: 'synced' | 'pending' | 'failed';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  totalAmount?: number;
  taxableAmount?: number;
  gstAmount?: number;
}

// ─── Storage Abstraction ──────────────────────────────────────────────────────
// • Vercel (production) → Upstash Redis  (UPSTASH_REDIS_REST_URL + _TOKEN set)
// • Local dev           → src/data/bookings.json  (file on disk)

const KV_KEY = 'bn:bookings';

// ── Local file helpers (dev only) ─────────────────────────────────────────────

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'bookings.json');

function fileReadBookings(): BookingRecord[] {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_PATH))
      fs.writeFileSync(DATA_PATH, JSON.stringify({ bookings: [] }, null, 2));
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return (JSON.parse(raw).bookings ?? []) as BookingRecord[];
  } catch {
    return [];
  }
}

function fileWriteBookings(bookings: BookingRecord[]) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ bookings }, null, 2));
  } catch (e) {
    console.error('[storage] file write error:', e);
  }
}

// ── Redis helpers (production) ────────────────────────────────────────────────

function getRedis() {
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function isRedisConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ── Public read / write ───────────────────────────────────────────────────────

export async function readBookings(): Promise<BookingRecord[]> {
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      const data = await redis.get(KV_KEY);
      if (!data) return [];
      // Upstash auto-parses JSON
      return Array.isArray(data) ? data as BookingRecord[] : [];
    } catch (e) {
      console.error('[storage] Redis read error, falling back to []:', e);
      return [];
    }
  }
  return fileReadBookings();
}

export async function writeBookings(bookings: BookingRecord[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      const redis = getRedis();
      await redis.set(KV_KEY, bookings);
    } catch (e) {
      console.error('[storage] Redis write error:', e);
    }
  } else {
    fileWriteBookings(bookings);
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** All calendar dates from `from` (inclusive) up to but NOT including `to` */
export function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (cur < end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ─── Availability queries (all async now) ──────────────────────────────────────

/** How many rooms are booked on each date in [from, to) */
export async function getBookedCountsForRange(
  roomType: RoomType,
  from: string,
  to: string,
): Promise<Record<string, number>> {
  const allBookings = await readBookings();
  const bookings = allBookings.filter(
    b => b.roomType === roomType && b.status === 'confirmed',
  );
  const dates = dateRange(from, to);
  const counts: Record<string, number> = {};

  for (const date of dates) {
    counts[date] = 0;
    for (const b of bookings) {
      if (b.checkIn <= date && date < b.checkOut) {
        counts[date] += b.rooms;
      }
    }
  }
  return counts;
}

/** Available rooms per date in [from, to). Prefers ERP as source of truth. */
export async function getAvailabilityForRange(
  roomType: RoomType,
  from: string,
  to: string,
): Promise<Record<string, number>> {
  const dates = dateRange(from, to);
  // Try the custom ERP endpoint first; fall back to direct Reservation doctype query.
  const erp =
    (await getERPAvailability(roomType, from, to)) ??
    (await getERPAvailabilityFromDoctype(roomType, from, to));

  // ERP returned hold-quota availability. Subtract any local bookings pending ERP sync
  // (those will become hold-quota reservations once synced — avoid double-selling).
  if (erp) {
    const localBooked = await getBookedCountsForRange(roomType, from, to);
    const all = await readBookings();
    const unsyncedByDate: Record<string, number> = {};
    for (const date of dates) {
      let n = 0;
      for (const b of all) {
        // Only subtract bookings still *pending* ERP sync — those will soon become
        // hold-quota reservations, so reserve their rooms to avoid double-selling.
        // 'failed' bookings never reached ERP, so ERP's count already reflects the
        // true (un-held) state; subtracting them would wrongly mark rooms sold out.
        if (
          b.roomType === roomType &&
          b.status === 'confirmed' &&
          b.erpSyncStatus === 'pending' &&
          b.checkIn <= date && date < b.checkOut
        ) {
          n += b.rooms;
        }
      }
      unsyncedByDate[date] = n;
    }
    const out: Record<string, number> = {};
    for (const date of dates) {
      const erpAvail = erp[date];
      if (typeof erpAvail === 'number') {
        out[date] = Math.max(0, erpAvail - (unsyncedByDate[date] || 0));
      } else {
        // Date missing from ERP response — fall back to local count for that date.
        out[date] = Math.max(0, TOTAL_ROOMS[roomType] - (localBooked[date] || 0));
      }
    }
    return out;
  }

  // No ERP — fall back to local TOTAL_ROOMS - local bookings.
  const booked = await getBookedCountsForRange(roomType, from, to);
  const total = TOTAL_ROOMS[roomType];
  const out: Record<string, number> = {};
  for (const [date, count] of Object.entries(booked)) {
    out[date] = Math.max(0, total - count);
  }
  return out;
}

/** Dates where availability < rooms needed */
export async function getUnavailableDates(
  roomType: RoomType,
  from: string,
  to: string,
  rooms = 1,
): Promise<string[]> {
  const avail = await getAvailabilityForRange(roomType, from, to);
  return Object.entries(avail)
    .filter(([, a]) => a < rooms)
    .map(([d]) => d);
}

/** Next upgradeable room type with enough availability */
export async function suggestUpgrade(
  roomType: RoomType,
  checkIn: string,
  checkOut: string,
  rooms = 1,
): Promise<{ roomType: RoomType; name: string; price: number; available: number } | null> {
  const idx = UPGRADE_ORDER.indexOf(roomType);
  for (let i = idx + 1; i < UPGRADE_ORDER.length; i++) {
    const candidate = UPGRADE_ORDER[i];
    const avail = await getAvailabilityForRange(candidate, checkIn, checkOut);
    const values = Object.values(avail);
    const minAvail = values.length ? Math.min(...values) : TOTAL_ROOMS[candidate];
    if (minAvail >= rooms) {
      return {
        roomType: candidate,
        name: ROOM_NAMES[candidate],
        price: 0, // Dynamic pricing is handled by the frontend useLivePrices hook
        available: minAvail,
      };
    }
  }
  return null;
}

// ─── ERP Integration ──────────────────────────────────────────────────────────

const ERP_BASE = (process.env.ERP_BASE_URL ?? '').replace(/\/$/, '');
const ERP_AUTH = `token ${process.env.ERP_API_KEY ?? ''}:${process.env.ERP_API_SECRET ?? ''}`;
const ERP_PROPERTY = process.env.ERP_PROPERTY ?? 'BRAJ-NIDHI-GUEST-HOUSE-VRN';
const ERP_BOOKING_TYPE = process.env.ERP_BOOKING_TYPE ?? 'Walk-In';
const ERP_HOLD_TYPE = process.env.ERP_HOLD_TYPE ?? 'BN-BN-VCM Web Site-0001-0001';

const ERP_ROOM_TYPE_MAP: Record<RoomType, string> = {
  deluxe2: process.env.ERP_ROOM_TYPE_DELUXE2 || 'BN-DELUXE-2',
  deluxe3: process.env.ERP_ROOM_TYPE_DELUXE3 || 'BN-DELUXE-3',
  deluxe4: process.env.ERP_ROOM_TYPE_DELUXE4 || 'BN-DELUXE-4',
};

export function resolveErpRoomTypeId(roomType: string): string {
  const s = (roomType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('royal') || s.includes('deluxe4') || s.includes('family') || s.includes('quad') || s.endsWith('4')) {
    return ERP_ROOM_TYPE_MAP.deluxe4;
  }
  if (s.includes('deluxe3') || s.includes('triple') || s.endsWith('3')) {
    return ERP_ROOM_TYPE_MAP.deluxe3;
  }
  return ERP_ROOM_TYPE_MAP.deluxe2;
}

// In-memory cache for ERP availability (10s TTL) — short enough for near-instant
// sync when ERP changes, long enough to batch rapid UI interactions.
type ErpCacheEntry = { fetchedAt: number; data: Record<string, number> };
const ERP_CACHE = new Map<string, ErpCacheEntry>();
const ERP_CACHE_TTL_MS = Number(process.env.ERP_CACHE_TTL_MS) || 10_000;

/** Immediately invalidate the ERP availability cache (called by webhook / admin). */
export function clearERPCache() { ERP_CACHE.clear(); }

/**
 * Fetch availability for a single date from ERP via `search_rooms`.
 * Caches per date+roomType with the standard TTL.
 */
async function fetchERPDateAvailability(
  erpRoomTypeId: string,
  date: string,
): Promise<number | null> {
  const cacheKey = `single:${erpRoomTypeId}:${date}`;
  const cached = ERP_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < ERP_CACHE_TTL_MS) {
    return cached.data[date] ?? null;
  }

  try {
    const nextDay = new Date(date + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const toDate = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    const res = await fetch(`${ERP_BASE}.search_rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: ERP_AUTH },
      body: JSON.stringify({
        property: ERP_PROPERTY,
        check_in_date: date,
        check_out_date: toDate,
        hold_type: ERP_HOLD_TYPE,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return null;
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { return null; }

    const payload = data.message ?? data;
    const available = (payload.availableRooms ?? []) as Array<{
      roomTypeId: string; availableCount: number;
    }>;
    const match = available.find(r => r.roomTypeId === erpRoomTypeId);
    const count = match?.availableCount ?? 0;

    ERP_CACHE.set(cacheKey, { fetchedAt: Date.now(), data: { [date]: count } });
    return count;
  } catch {
    return null;
  }
}

/**
 * Fetch per-date room availability from the ERP via `search_rooms`.
 * Makes parallel 1-night calls so each date reflects the exact hold matrix value.
 * Returns null on error so callers can fall back to local counting.
 */
export async function getERPAvailability(
  roomType: RoomType,
  from: string,
  to: string,
): Promise<Record<string, number> | null> {
  if (!ERP_BASE || !process.env.ERP_API_KEY) return null;

  const erpRoomTypeId = ERP_ROOM_TYPE_MAP[roomType];
  if (!erpRoomTypeId) return null;

  const dates = dateRange(from, to);
  if (dates.length === 0) return null;

  const counts = await Promise.all(
    dates.map(d => fetchERPDateAvailability(erpRoomTypeId, d)),
  );

  if (counts.every(c => c === null)) return null;

  const result: Record<string, number> = {};
  for (let i = 0; i < dates.length; i++) {
    result[dates[i]] = counts[i] ?? 0;
  }
  return result;
}

/**
 * Fallback that computes availability from the Frappe Reservation doctype directly,
 * for ERPs where `search_rooms` doesn't return per-date granularity.
 * Counts confirmed (docstatus 1) and draft (docstatus 0) reservations of room_type
 * overlapping the date range, subtracts from the website's hold quota.
 */
export async function getERPAvailabilityFromDoctype(
  roomType: RoomType,
  from: string,
  to: string,
): Promise<Record<string, number> | null> {
  if (!ERP_BASE || !process.env.ERP_API_KEY) return null;

  const erpRoomTypeId = ERP_ROOM_TYPE_MAP[roomType];
  if (!erpRoomTypeId) return null;

  // ERP_BASE looks like https://host/api/method/guesthouse.website_booking_api
  const apiRoot = ERP_BASE.replace(/\/api\/method\/.*/, '/api/method');
  const cacheKey = `doctype:${erpRoomTypeId}:${from}:${to}`;
  const cached = ERP_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < ERP_CACHE_TTL_MS) return cached.data;

  try {
    const filters = JSON.stringify([
      ['property', '=', ERP_PROPERTY],
      ['use_hold_rooms', '=', 1],
      ['hold_quota', '=', ERP_HOLD_TYPE],
      ['check_in', '<', to],
      ['check_out', '>', from],
      ['status', 'not in', ['Cancelled', 'No-show']],
    ]);
    const fields = JSON.stringify(['name', 'check_in', 'check_out', 'status']);
    const url =
      `${apiRoot}/frappe.client.get_list?doctype=Reservation` +
      `&filters=${encodeURIComponent(filters)}` +
      `&fields=${encodeURIComponent(fields)}` +
      `&limit_page_length=500`;

    const res = await fetch(url, {
      headers: { Authorization: ERP_AUTH },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const list = (await res.json()).message as Array<{
      name: string; check_in: string; check_out: string;
    }>;
    if (!Array.isArray(list)) return null;

    // For each reservation, fetch assigned_rooms to count this room_type.
    const perResRoomCounts = await Promise.all(
      list.map(async r => {
        const detailRes = await fetch(
          `${apiRoot}/frappe.client.get?doctype=Reservation&name=${encodeURIComponent(r.name)}`,
          { headers: { Authorization: ERP_AUTH }, signal: AbortSignal.timeout(8_000) },
        );
        if (!detailRes.ok) return { ...r, count: 0 };
        const doc = (await detailRes.json()).message;
        const rooms = (doc?.assigned_rooms ?? []) as Array<{ room_type: string; room_count: number }>;
        const count = rooms
          .filter(rr => rr.room_type === erpRoomTypeId)
          .reduce((s, rr) => s + (Number(rr.room_count) || 0), 0);
        return { ...r, count };
      }),
    );

    const dates = dateRange(from, to);
    const quota = TOTAL_ROOMS[roomType];
    const result: Record<string, number> = {};
    for (const date of dates) {
      let booked = 0;
      for (const r of perResRoomCounts) {
        if (r.check_in <= date && date < r.check_out) booked += r.count;
      }
      result[date] = Math.max(0, quota - booked);
    }
    ERP_CACHE.set(cacheKey, { fetchedAt: Date.now(), data: result });
    return result;
  } catch (e) {
    console.error('[ERP] doctype availability error:', e);
    return null;
  }
}

export async function syncToERP(booking: BookingRecord): Promise<{
  erpReservationId?: string;
  status: 'synced' | 'failed';
  error?: string;
}> {
  const erpRoomTypeId = resolveErpRoomTypeId(booking.roomType);

  if (!ERP_BASE || !process.env.ERP_API_KEY) {
    return { status: 'failed', error: 'ERP credentials not configured' };
  }
  if (!erpRoomTypeId) {
    return {
      status: 'failed',
      error: `ERP room type ID for ${booking.roomType} not configured. Set ERP_ROOM_TYPE_${booking.roomType.toUpperCase()}`,
    };
  }

  try {
    const res = await fetch(`${ERP_BASE}.create_reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: ERP_AUTH },
      body: JSON.stringify({
        property: ERP_PROPERTY,
        check_in_date: booking.checkIn,
        check_out_date: booking.checkOut,
        booking_type: ERP_BOOKING_TYPE,
        hold_type: ERP_HOLD_TYPE,
        ...(booking.totalAmount !== undefined && {
          amount: booking.totalAmount,
          total_amount: booking.totalAmount,
          taxable_amount: booking.taxableAmount,
          gst_amount: booking.gstAmount,
          gst_rate: 5,
          tax_rate: 5,
        }),
        guest: {
          name: booking.guestName || 'Guest',
          email: booking.guestEmail || '',
          phone: booking.guestPhone || '',
        },
        rooms: [
          {
            room_type: erpRoomTypeId,
            qty: booking.rooms,
            adults: booking.adults,
            children: booking.children,
            ...(booking.totalAmount !== undefined && {
              rate: Math.round(booking.totalAmount / (booking.rooms || 1)),
              amount: booking.totalAmount,
              taxable_amount: booking.taxableAmount,
              gst_amount: booking.gstAmount,
              gst_rate: 5,
              tax_rate: 5,
            }),
          },
        ],
        ...(booking.razorpayPaymentId && { gateway_payment_id: booking.razorpayPaymentId }),
        ...(booking.razorpayOrderId && { gateway_order_id: booking.razorpayOrderId }),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok || data.exc || data.exception) {
      const errMsg = data._error_message || data.exception || JSON.stringify(data).slice(0, 200);
      return { status: 'failed', error: errMsg };
    }

    const result = data.message ?? data;
    const erpReservationId: string | undefined =
      result.reservationId ?? result.reservation_id ?? result.name;
    // Invalidate ERP availability cache so the next read reflects the new booking.
    ERP_CACHE.clear();
    return { status: 'synced', erpReservationId };
  } catch (e: any) {
    return { status: 'failed', error: e.message ?? 'Network error' };
  }
}

// ─── Booking management ───────────────────────────────────────────────────────

export async function syncMultiToERP(bookingsToSync: BookingRecord[]): Promise<{
  erpReservationId?: string;
  status: 'synced' | 'failed';
  error?: string;
}> {
  if (bookingsToSync.length === 0) return { status: 'failed', error: 'No bookings to sync' };
  const primary = bookingsToSync[0];

  if (!ERP_BASE || !process.env.ERP_API_KEY) {
    return { status: 'failed', error: 'ERP credentials not configured' };
  }

  try {
    const res = await fetch(`${ERP_BASE}.create_reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: ERP_AUTH },
      body: JSON.stringify({
        property: ERP_PROPERTY,
        check_in_date: primary.checkIn,
        check_out_date: primary.checkOut,
        booking_type: ERP_BOOKING_TYPE,
        hold_type: ERP_HOLD_TYPE,
        ...(primary.totalAmount !== undefined && {
          amount: primary.totalAmount,
          total_amount: primary.totalAmount,
          taxable_amount: primary.taxableAmount,
          gst_amount: primary.gstAmount,
          gst_rate: 5,
          tax_rate: 5,
        }),
        guest: {
          name: primary.guestName || 'Guest',
          email: primary.guestEmail || '',
          phone: primary.guestPhone || '',
        },
        rooms: bookingsToSync.map(b => {
          const erpRoomTypeId = resolveErpRoomTypeId(b.roomType);
          const itemAmount = b.totalAmount;
          const itemRate = itemAmount !== undefined ? Math.round(itemAmount / (b.rooms || 1)) : 0;
          return {
            room_type: erpRoomTypeId,
            qty: b.rooms,
            rate: itemRate,
            ...(itemAmount !== undefined && {
              amount: itemAmount,
              taxable_amount: b.taxableAmount,
              gst_amount: b.gstAmount,
              gst_rate: 5,
              tax_rate: 5,
            }),
            adults: Math.max(1, b.adults || 1),
            children: b.children || 0,
          };
        }),
        ...(primary.razorpayPaymentId && { gateway_payment_id: primary.razorpayPaymentId }),
        ...(primary.razorpayOrderId && { gateway_order_id: primary.razorpayOrderId }),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok || data.exc || data.exception) {
      const errMsg = data._error_message || data.exception || JSON.stringify(data).slice(0, 200);
      return { status: 'failed', error: errMsg };
    }

    const result = data.message ?? data;
    const erpReservationId: string | undefined =
      result.reservationId ?? result.reservation_id ?? result.name;
    ERP_CACHE.clear();
    return { status: 'synced', erpReservationId };
  } catch (e: any) {
    return { status: 'failed', error: e.message ?? 'Network error' };
  }
}

export async function createBooking(params: {
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  rooms: number;
  roomSelections?: Partial<Record<RoomType, number>>;
  adults: number;
  children: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  erpReservationId?: string;
  totalAmount?: number;
  taxableAmount?: number;
  gstAmount?: number;
}): Promise<{ success: boolean; booking?: BookingRecord; error?: string; erpError?: string }> {
  // Determine all selected room types & quantities
  const rawSelections: [RoomType, number][] = params.roomSelections && Object.keys(params.roomSelections).length > 0
    ? (Object.entries(params.roomSelections).filter(([_, qty]) => Number(qty) > 0) as [RoomType, number][])
    : [[params.roomType, params.rooms]];

  const selections: [RoomType, number][] = rawSelections.length > 0
    ? rawSelections
    : [[params.roomType, params.rooms]];

  // Check availability for every selected room type
  for (const [rt, qty] of selections) {
    const avail = await getAvailabilityForRange(rt, params.checkIn, params.checkOut);
    const values = Object.values(avail);
    if (values.length === 0) return { success: false, error: 'Invalid date range' };
    const minAvail = Math.min(...values);

    if (minAvail < qty) {
      const roomName = ROOM_NAMES[rt] || rt;
      return {
        success: false,
        error: `Only ${minAvail} room(s) available for ${roomName} for the selected dates`,
      };
    }
  }

  // Build and save booking records for all selected room types
  const bookings = await readBookings();
  const alreadySynced = !!params.erpReservationId;
  const baseId = `BK${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const createdRecords: BookingRecord[] = selections.map(([rt, qty], idx) => ({
    id: idx === 0 ? baseId : `${baseId}-${idx}`,
    roomType: rt,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    rooms: qty,
    adults: idx === 0 ? params.adults : 0,
    children: idx === 0 ? params.children : 0,
    guestName: params.guestName,
    guestEmail: params.guestEmail,
    guestPhone: params.guestPhone,
    bookedAt: new Date().toISOString(),
    status: 'confirmed',
    erpReservationId: params.erpReservationId,
    erpSyncStatus: alreadySynced ? 'synced' : 'pending',
    razorpayPaymentId: params.razorpayPaymentId,
    razorpayOrderId: params.razorpayOrderId,
    totalAmount: idx === 0 ? params.totalAmount : undefined,
    taxableAmount: idx === 0 ? params.taxableAmount : undefined,
    gstAmount: idx === 0 ? params.gstAmount : undefined,
  }));

  bookings.push(...createdRecords);
  await writeBookings(bookings);

  // Invalidate ERP cache so next availability check is fresh
  clearERPCache();

  // ERP sync — skip if already synced (reservation created by payment handler)
  let erpError: string | undefined;
  if (!alreadySynced) {
    try {
      const erpResult = await syncMultiToERP(createdRecords);
      const all = await readBookings();
      for (const rec of createdRecords) {
        const idx = all.findIndex(b => b.id === rec.id);
        if (idx !== -1) {
          all[idx].erpSyncStatus = erpResult.status;
          if (erpResult.erpReservationId) all[idx].erpReservationId = erpResult.erpReservationId;
        }
        rec.erpSyncStatus = erpResult.status;
        if (erpResult.erpReservationId) rec.erpReservationId = erpResult.erpReservationId;
      }
      await writeBookings(all);
      if (erpResult.status === 'failed') erpError = erpResult.error;
    } catch (e: any) {
      erpError = e.message;
    }
  }

  return { success: true, booking: createdRecords[0], erpError };
}

export async function cancelBooking(id: string): Promise<boolean> {
  const bookings = await readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  bookings[idx].status = 'cancelled';
  await writeBookings(bookings);
  return true;
}

export async function restoreBooking(id: string): Promise<boolean> {
  const bookings = await readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  bookings[idx].status = 'confirmed';
  await writeBookings(bookings);
  return true;
}

export async function retryERPSync(id: string): Promise<{ success: boolean; error?: string }> {
  const bookings = await readBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) return { success: false, error: 'Booking not found' };
  const result = await syncToERP(booking);
  const idx = bookings.findIndex(b => b.id === id);
  bookings[idx].erpSyncStatus = result.status;
  if (result.erpReservationId) bookings[idx].erpReservationId = result.erpReservationId;
  await writeBookings(bookings);
  return { success: result.status === 'synced', error: result.error };
}
