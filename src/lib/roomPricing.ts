/**
 * Room pricing — single source of truth.
 *
 * The ERP is authoritative for nightly rates and can change them per date. This
 * module holds the room-type mapping, the fallback rate card, and the logic that
 * turns an ERP `search_rooms` response into a price map, so every page derives
 * prices the same way instead of hardcoding its own numbers.
 */

export type RoomKey = 'deluxe2' | 'deluxe3' | 'deluxe4';

export const ROOM_KEYS: RoomKey[] = ['deluxe2', 'deluxe3', 'deluxe4'];



export const ROOM_TITLES: Record<RoomKey, string> = {
  deluxe2: 'Deluxe 2 – Twin Bedded Room',
  deluxe3: 'Deluxe 3 – 3 Bedded Room',
  deluxe4: 'Deluxe 4 – 4 Bedded Room',
};

/** Maximum occupants per single room of each type. */
export const ROOM_CAPACITY: Record<RoomKey, number> = {
  deluxe2: 2,
  deluxe3: 3,
  deluxe4: 4,
};

/** ERP room-type document IDs, keyed by website room type. */
export const ERP_ROOM_TYPE_IDS: Record<RoomKey, string> = {
  deluxe2: 'BN-DELUXE-2',
  deluxe3: 'BN-DELUXE-3',
  deluxe4: 'BN-DELUXE-4',
};

/**
 * Map an arbitrary ERP room-type identifier onto a website room key.
 *
 * ERP document IDs look like `BN-DELUXE-2`, but names such as
 * "Deluxe Triple" or "Royal Family Suite" also appear, so both the numeric
 * suffix and descriptive words are matched.
 *
 * Order matters: deluxe4 is tested first because "Deluxe 4" also ends in a
 * digit that the deluxe3 branch would otherwise have to exclude.
 */
export function normalizeRoomKey(raw: string): RoomKey | null {
  const s = (raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!s) return null;

  // 1. An explicit "deluxe<N>" token is the strongest signal and must be read
  //    before any trailing-digit guess. Once the ERP lists individual rooms the
  //    IDs carry a room number — "BN-DELUXE-2-0003" ends in 3 — and checking the
  //    last digit first filed those under Deluxe 3, so Deluxe 2 ended up with no
  //    price at all while Deluxe 3's was overwritten.
  const explicit = s.match(/deluxe0*([234])/);
  if (explicit) return `deluxe${explicit[1]}` as RoomKey;

  // 2. Descriptive names, for types named rather than numbered.
  if (s.includes('royal') || s.includes('family') || s.includes('quad')) return 'deluxe4';
  if (s.includes('triple')) return 'deluxe3';
  if (s.includes('twin') || s.includes('double')) return 'deluxe2';

  // 3. Last resort for short codes with no type token, e.g. "BN-DLX-3".
  if (s.endsWith('4')) return 'deluxe4';
  if (s.endsWith('3')) return 'deluxe3';
  if (s.endsWith('2')) return 'deluxe2';

  return null;
}

/** Alias kept for readability at ERP call sites. */
export const erpToWebsiteType = normalizeRoomKey;

/** A room entry as returned by the ERP's `search_rooms` method. */
export interface ErpRoom {
  roomTypeId?: string;
  roomType?: string;
  pricePerNight?: number | string;
  [key: string]: unknown;
}

export interface ExtractedPrices {
  prices: Partial<Record<RoomKey, number>>;
  /** Per-room diagnostics, so a bad mapping or missing rate is visible. */
  trace: {
    rawId: string;
    mappedTo: RoomKey | null;
    rawPrice: unknown;
    parsedPrice: number;
    used: boolean;
    reason?: string;
  }[];
}

/**
 * Pull nightly rates out of an ERP `availableRooms` array.
 *
 * Returns only types the ERP actually priced — callers merge these over the
 * fallback card so a type the ERP omits keeps its rate-card price rather than
 * becoming zero. The trace explains every accepted and rejected entry.
 */
export function extractErpPrices(rooms: unknown): ExtractedPrices {
  const prices: Partial<Record<RoomKey, number>> = {};
  const trace: ExtractedPrices['trace'] = [];

  if (!Array.isArray(rooms)) return { prices, trace };

  for (const entry of rooms as ErpRoom[]) {
    const rawId = String(entry?.roomTypeId ?? entry?.roomType ?? '');
    const rawPrice = entry?.pricePerNight;
    // Rounded to whole rupees here, once, so every consumer — room cards,
    // the fare summary, the Razorpay charge, the ERP reservation — reads the
    // same figure. Left unrounded, a rate like 3500.75 would display as-is on
    // the room cards but be rounded to 3501 only when the reservation payload
    // was built, so the guest would see one price and be charged another.
    // `rawPrice` is kept as-is in the trace for diagnosing what the ERP sent.
    const parsedPrice = Math.round(Number(rawPrice ?? 0));

    if (!rawId) {
      trace.push({ rawId, mappedTo: null, rawPrice, parsedPrice, used: false, reason: 'no roomTypeId' });
      continue;
    }

    const mappedTo = normalizeRoomKey(rawId);
    
    if (!mappedTo) {
      trace.push({ rawId, mappedTo: null, rawPrice, parsedPrice, used: false, reason: 'unknown room type' });
      continue;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      trace.push({ rawId, mappedTo, rawPrice, parsedPrice, used: false, reason: 'price missing or not positive' });
      continue;
    }

    // Two ERP rooms can share a type (multiple physical rooms). Keep the lowest
    // rate so the site never advertises less than it will charge.
    const existing = prices[mappedTo];
    if (existing !== undefined && existing <= parsedPrice) {
      trace.push({ rawId, mappedTo, rawPrice, parsedPrice, used: false, reason: `higher than existing ${existing}` });
      continue;
    }

    prices[mappedTo] = parsedPrice;
    trace.push({ rawId, mappedTo, rawPrice, parsedPrice, used: true });
  }

  return { prices, trace };
}

/** Merge live ERP prices. (Fallback removed per dynamic pricing requirement) */
export function resolvePrices(
  live: Partial<Record<RoomKey, number>> | null | undefined,
): Partial<Record<RoomKey, number>> {
  return live ?? {};
}

/** Format for display, e.g. 100 → "₹100". */
export function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

/** YYYY-MM-DD in India time, so "today's rate" matches the property's day. */
export function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}
