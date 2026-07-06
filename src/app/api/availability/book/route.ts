import { NextRequest } from 'next/server';
import { createBooking } from '@/lib/roomAvailability';
import type { RoomType } from '@/lib/roomAvailability';
import { sanitizeString, isValidDate, isValidPhone, isValidEmail } from '@/lib/apiAuth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

const VALID_ROOM_TYPES: RoomType[] = ['deluxe2', 'deluxe3', 'deluxe4'];

export async function POST(req: NextRequest) {
  // ── Rate limit: 5 bookings/min per IP (strict — prevents spamming) ──────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(`book:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const {
      roomType,
      checkIn,
      checkOut,
      rooms,
      adults,
      children,
      guestName,
      guestEmail,
      guestPhone,
      razorpayPaymentId,
      razorpayOrderId,
      erpReservationId,
      totalAmount,
      taxableAmount,
      gstAmount,
    } = body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!roomType || !checkIn || !checkOut || !rooms) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_ROOM_TYPES.includes(roomType as RoomType)) {
      return Response.json({ error: 'Invalid roomType' }, { status: 400 });
    }

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return Response.json({ error: 'checkIn must be before checkOut' }, { status: 400 });
    }

    // Don't allow booking in the past
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    if (checkIn < todayStr) {
      return Response.json({ error: 'Cannot book past dates' }, { status: 400 });
    }

    const numRooms = Number(rooms);
    if (isNaN(numRooms) || numRooms < 1 || numRooms > 10) {
      return Response.json({ error: 'rooms must be between 1 and 10' }, { status: 400 });
    }

    const numAdults = Number(adults ?? 2);
    const numChildren = Number(children ?? 0);
    if (numAdults < 1 || numAdults > 20 || numChildren < 0 || numChildren > 20) {
      return Response.json({ error: 'Invalid guest counts' }, { status: 400 });
    }

    // Sanitize text inputs
    const cleanName = sanitizeString(guestName, 100);
    const cleanEmail = typeof guestEmail === 'string' ? guestEmail.trim().toLowerCase() : '';
    const cleanPhone = typeof guestPhone === 'string' ? guestPhone.trim() : '';

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (cleanPhone && !isValidPhone(cleanPhone)) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // ── Create booking ────────────────────────────────────────────────────────
    const result = await createBooking({
      roomType: roomType as RoomType,
      checkIn,
      checkOut,
      rooms: numRooms,
      adults: numAdults,
      children: numChildren,
      guestName: cleanName,
      guestEmail: cleanEmail,
      guestPhone: cleanPhone,
      razorpayPaymentId: typeof razorpayPaymentId === 'string' ? razorpayPaymentId : undefined,
      razorpayOrderId: typeof razorpayOrderId === 'string' ? razorpayOrderId : undefined,
      erpReservationId: typeof erpReservationId === 'string' ? erpReservationId : undefined,
      totalAmount: typeof totalAmount === 'number' ? totalAmount : undefined,
      taxableAmount: typeof taxableAmount === 'number' ? taxableAmount : undefined,
      gstAmount: typeof gstAmount === 'number' ? gstAmount : undefined,
    });

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 409 });
    }

    return Response.json({
      success: true,
      booking: result.booking,
      erpSynced: result.booking?.erpSyncStatus === 'synced',
      erpError: result.erpError,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
