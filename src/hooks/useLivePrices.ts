"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  FALLBACK_PRICES,
  resolvePrices,
  type RoomKey,
} from '@/lib/roomPricing';

/**
 * Live ERP nightly rates, shared by every page that shows a price.
 *
 * Always returns a usable price map: ERP rates where available, rate-card
 * figures where not. `source` distinguishes the two so the UI (and the console
 * trace) can tell whether a displayed number came from the ERP.
 *
 * Pass the guest's dates once they exist; without them the hook asks for
 * today's rate, which is the sensible thing to advertise on a room list.
 */

export type PriceSource = 'erp' | 'partial' | 'fallback' | 'loading';

interface PricesResponse {
  prices: Record<RoomKey, number>;
  livePriced?: RoomKey[];
  source: Exclude<PriceSource, 'loading'>;
  reason?: string;
  from: string;
  to: string;
  diagnostics?: unknown;
  cached?: boolean;
}

export interface UseLivePricesResult {
  prices: Record<RoomKey, number>;
  livePriced: RoomKey[];
  source: PriceSource;
  reason?: string;
  isLoading: boolean;
  refresh: () => void;
  /** True when this room type's price came from the ERP rather than the card. */
  isLive: (key: RoomKey) => boolean;
}

/** Set NEXT_PUBLIC_DEBUG_PRICES=1 to trace pricing in the browser console. */
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_PRICES === '1';

export function useLivePrices(
  checkIn?: string,
  checkOut?: string,
  options?: { guests?: number; rooms?: number; pollMs?: number },
): UseLivePricesResult {
  const [prices, setPrices] = useState<Record<RoomKey, number>>(FALLBACK_PRICES);
  const [livePriced, setLivePriced] = useState<RoomKey[]>([]);
  const [source, setSource] = useState<PriceSource>('loading');
  const [reason, setReason] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const guests = options?.guests;
  const rooms = options?.rooms;
  const pollMs = options?.pollMs;

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const params = new URLSearchParams();
      // Only forward a complete, ordered range; otherwise let the server default
      // to today so a half-filled date picker doesn't produce a bogus query.
      if (checkIn && checkOut && checkIn < checkOut) {
        params.set('from', checkIn);
        params.set('to', checkOut);
      }
      // Guests and room count both go to the ERP: its rates can depend on
      // occupancy and on how many rooms are being held, so a change to either
      // must produce a fresh quote rather than reuse the previous one.
      if (guests) params.set('guests', String(guests));
      if (rooms) params.set('rooms', String(rooms));

      try {
        const res = await fetch(`/api/erp/prices?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as PricesResponse;
        if (cancelled) return;

        const resolved = resolvePrices(data.prices);
        setPrices(resolved);
        setLivePriced(data.livePriced ?? []);
        setSource(data.source);
        setReason(data.reason);

        if (DEBUG) {
          console.groupCollapsed(
            `%c[prices] ${data.source.toUpperCase()} ${data.from} → ${data.to}`,
            `color:${data.source === 'erp' ? '#16a34a' : data.source === 'partial' ? '#d97706' : '#dc2626'};font-weight:bold`,
          );
          console.log('ERP-priced types :', data.livePriced ?? []);
          console.log('Final prices     :', resolved);
          if (data.reason) console.warn('Why not live     :', data.reason);
          console.log('Diagnostics      :', data.diagnostics);
          console.groupEnd();
        }
      } catch (error) {
        if (cancelled) return;
        setPrices(FALLBACK_PRICES);
        setLivePriced([]);
        setSource('fallback');
        setReason(error instanceof Error ? error.message : 'Price lookup failed.');
        if (DEBUG) console.warn('[prices] lookup failed, using rate card:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    if (!pollMs) return () => { cancelled = true; };

    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [checkIn, checkOut, guests, rooms, pollMs, tick]);

  const isLive = useCallback(
    (key: RoomKey) => livePriced.includes(key),
    [livePriced],
  );

  return { prices, livePriced, source, reason, isLoading, refresh, isLive };
}
