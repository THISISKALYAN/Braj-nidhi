import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

function getRazorpay() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay env vars not configured');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Accepted order amount range, in rupees.
 *
 * ₹1 is Razorpay's own floor (100 paise). The ₹5,00,000 ceiling covers the
 * largest realistic multi-room, multi-night stay while still bounding the damage
 * from a malformed or tampered amount.
 */
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 500_000;

/** Indian digit grouping, so the error reads "₹5,00,000" rather than "₹500000". */
const formatRupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export async function POST(request: NextRequest) {
  // ── Rate limit: 5 orders/min per IP ─────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(`create-order:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await request.json();
    const { amount, currency = 'INR', reservation_id } = body;

    // ── Input validation ────────────────────────────────────────────────────────
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT || parsedAmount > MAX_AMOUNT) {
      return Response.json(
        {
          error: `Invalid amount. Must be between ${formatRupees(MIN_AMOUNT)} and ${formatRupees(MAX_AMOUNT)}.`,
        },
        { status: 400 },
      );
    }

    if (currency !== 'INR') {
      return Response.json({ error: 'Only INR is supported' }, { status: 400 });
    }

    // Sanitize reservation_id
    const cleanReservationId =
      typeof reservation_id === 'string'
        ? reservation_id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 50)
        : '';

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100), // paise
      currency,
      receipt: cleanReservationId || `rcpt_${Date.now()}`,
      notes: { reservation_id: cleanReservationId },
    });

    return Response.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return Response.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 },
    );
  }
}
