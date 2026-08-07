// src/config/taxes.ts

/**
 * The GST rate percentage to be applied across the application.
 * Change this value in the `.env` / `.env.local` file under NEXT_PUBLIC_GST_RATE.
 * If not set in env, it defaults to 5.
 */
export const GST_RATE_PERCENTAGE = process.env.NEXT_PUBLIC_GST_RATE ? Number(process.env.NEXT_PUBLIC_GST_RATE) : 5;

/**
 * The GST rate as a decimal fraction (e.g., 0.05 for 5%).
 * Used in math formulas where the rate needs to be a multiplier.
 */
export const GST_RATE_FRACTION = GST_RATE_PERCENTAGE / 100;
