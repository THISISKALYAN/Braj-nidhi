/**
 * Builds the `rooms` payload for the ERP's `create_reservation` method.
 *
 * Kept as pure functions so the multi-room maths can be tested without an ERP
 * round-trip. The shape follows the ERP team's own reference client
 * (public/api-test.html): one row per room type carrying `room_type`, `qty`,
 * `adults` and `children`, where the guest counts are the totals for that row —
 * i.e. for all `qty` rooms in it, not per room.
 */
import {
  ERP_ROOM_TYPE_IDS,
  ROOM_CAPACITY,
  normalizeRoomKey,
  type RoomKey,
} from '@/lib/roomPricing';

export interface ErpRoomRow {
  room_type: string;
  qty: number;
  rate: number;
  amount: number;
  taxable_amount: number;
  gst_amount: number;
  gst_rate: number;
  tax_rate: number;
  adults: number;
  children: number;
}

export interface BuildRoomsInput {
  /** Website room key → number of rooms. Keys need not be normalized. */
  roomSelections: Record<string, number>;
  /** Resolved nightly rate per room key (ERP rate where available). */
  prices: Record<RoomKey, number>;
  nights: number;
  adults: number;
  children: number;
  /** GST as a fraction, e.g. 0.05. Displayed rates are GST-inclusive. */
  gstRate: number;
  /** Optional live ERP room-type IDs, keyed by website type. */
  erpRoomTypeIds?: Partial<Record<RoomKey, string>>;
}

export interface BuildRoomsResult {
  rooms: ErpRoomRow[];
  /** Sum of every row's `amount`. GST-inclusive, excludes add-ons. */
  roomsSubtotal: number;
  taxableTotal: number;
  gstTotal: number;
  totalRooms: number;
  /** Non-fatal problems worth logging — capacity overflow, dropped guests. */
  warnings: string[];
}

/**
 * Distribute `total` across `weights` so the parts sum to exactly `total`.
 *
 * Plain `Math.floor(total / n)` per row silently drops the remainder, which is
 * how guests were being lost on multi-room bookings. Largest-remainder keeps the
 * sum exact.
 */
function distributeExact(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || weightSum <= 0) return weights.map(() => 0);

  const exact = weights.map(w => (total * w) / weightSum);
  const base = exact.map(Math.floor);
  let remainder = total - base.reduce((a, b) => a + b, 0);

  // Hand the leftover units to the rows with the largest fractional parts.
  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);

  for (const { index } of order) {
    if (remainder <= 0) break;
    base[index] += 1;
    remainder -= 1;
  }

  return base;
}

/**
 * Give every row at least one adult, taking from the most-populated rows.
 * A booked room with zero adults is not a valid reservation.
 */
function ensureOneAdultPerRow(allocation: number[]): number[] {
  const result = [...allocation];
  const total = result.reduce((a, b) => a + b, 0);
  if (total < result.length) return result; // Not enough adults to go round.

  for (let i = 0; i < result.length; i++) {
    if (result[i] > 0) continue;
    let donor = -1;
    for (let j = 0; j < result.length; j++) {
      if (result[j] > 1 && (donor === -1 || result[j] > result[donor])) donor = j;
    }
    if (donor === -1) break;
    result[donor] -= 1;
    result[i] += 1;
  }

  return result;
}

export function buildErpRooms(input: BuildRoomsInput): BuildRoomsResult {
  const { prices, nights, adults, children, gstRate } = input;
  const warnings: string[] = [];
  const safeNights = Math.max(1, Math.floor(nights));

  // Merge on the normalized key so one ERP room type can never appear twice —
  // duplicate rows would split a booking across two lines in the reservation.
  const merged = new Map<RoomKey, number>();
  for (const [rawKey, rawQty] of Object.entries(input.roomSelections)) {
    const qty = Math.floor(Number(rawQty) || 0);
    if (qty <= 0) continue;
    const key = normalizeRoomKey(rawKey);
    merged.set(key, (merged.get(key) ?? 0) + qty);
  }

  const entries = [...merged.entries()];
  if (entries.length === 0) {
    return {
      rooms: [],
      roomsSubtotal: 0,
      taxableTotal: 0,
      gstTotal: 0,
      totalRooms: 0,
      warnings: ['No rooms selected.'],
    };
  }

  const totalRooms = entries.reduce((sum, [, qty]) => sum + qty, 0);

  // Weight guest allocation by each row's capacity, so larger rooms take more
  // people and the result naturally respects per-room limits.
  const capacities = entries.map(([key, qty]) => ROOM_CAPACITY[key] * qty);
  const totalCapacity = capacities.reduce((a, b) => a + b, 0);

  const safeAdults = Math.max(1, Math.floor(Number(adults) || 0));
  const safeChildren = Math.max(0, Math.floor(Number(children) || 0));

  if (safeAdults + safeChildren > totalCapacity) {
    warnings.push(
      `Selected rooms hold ${totalCapacity} guests but ${safeAdults + safeChildren} were entered.`,
    );
  }

  const adultsPerRow = ensureOneAdultPerRow(distributeExact(safeAdults, capacities));
  const childrenPerRow = distributeExact(safeChildren, capacities);

  // Money: each row's amount is exact (integer rate x nights x qty), so the row
  // amounts always sum to the room subtotal. Only the tax split needs
  // remainder-aware distribution to avoid a rupee of drift against the total.
  const amounts = entries.map(([key, qty]) => {
    const rate = Math.round(Number(prices[key]) || 0);
    return { key, qty, rate, amount: rate * safeNights * qty };
  });

  const roomsSubtotal = amounts.reduce((sum, row) => sum + row.amount, 0);
  const taxableTotal = Math.round(roomsSubtotal / (1 + gstRate));
  const gstTotal = roomsSubtotal - taxableTotal;
  const taxablePerRow = distributeExact(
    taxableTotal,
    amounts.map(row => row.amount),
  );

  const rooms: ErpRoomRow[] = amounts.map((row, index) => {
    const taxable = taxablePerRow[index];
    return {
      room_type:
        input.erpRoomTypeIds?.[row.key] ?? ERP_ROOM_TYPE_IDS[row.key],
      qty: row.qty,
      rate: row.rate,
      amount: row.amount,
      taxable_amount: taxable,
      gst_amount: row.amount - taxable,
      gst_rate: gstRate * 100,
      tax_rate: gstRate * 100,
      adults: adultsPerRow[index],
      children: childrenPerRow[index],
    };
  });

  const allocatedAdults = rooms.reduce((s, r) => s + r.adults, 0);
  const allocatedChildren = rooms.reduce((s, r) => s + r.children, 0);
  if (allocatedAdults !== safeAdults) {
    warnings.push(`Adults allocated (${allocatedAdults}) != entered (${safeAdults}).`);
  }
  if (allocatedChildren !== safeChildren) {
    warnings.push(
      `Children allocated (${allocatedChildren}) != entered (${safeChildren}).`,
    );
  }

  return { rooms, roomsSubtotal, taxableTotal, gstTotal, totalRooms, warnings };
}
