/**
 * Currency and date formatting utilities for RideHub
 * Rules:
 * - Currency: Indian rupees only. Format: ₹1,50,000 (Indian Numbering System)
 * - Internal consistency & clear labels
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberIndian(val: number): string {
  return new Intl.NumberFormat("en-IN").format(val);
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Section 5.7 Cancellation & Refund Rule:
 * Formula: elapsed = (now - bookedAt) / (pickupAt - bookedAt)
 * If elapsed <= 0.25 -> 100% refund
 * If elapsed <= 0.50 -> 50% refund
 * Otherwise -> 0% refund
 */
export function calculateRefund(bookedAtIso: string, pickupAtIso: string, totalAmount: number, depositAmount: number = 0) {
  const now = Date.now();
  const bookedAt = new Date(bookedAtIso).getTime();
  const pickupAt = new Date(pickupAtIso).getTime();

  const totalLeadTime = Math.max(pickupAt - bookedAt, 1);
  const elapsedLeadTime = Math.max(0, now - bookedAt);
  const elapsedRatio = Math.min(Math.max(elapsedLeadTime / totalLeadTime, 0), 1);

  let refundPercent = 0;
  let tierLabel = "No Refund";

  if (elapsedRatio <= 0.25) {
    refundPercent = 100;
    tierLabel = "100% Full Refund (Tier 1)";
  } else if (elapsedRatio <= 0.5) {
    refundPercent = 50;
    tierLabel = "50% Partial Refund (Tier 2)";
  } else {
    refundPercent = 0;
    tierLabel = "0% Non-refundable (Tier 3)";
  }

  // Deposit is always 100% refundable upon cancellation prior to pickup
  const refundableRental = (totalAmount - depositAmount) * (refundPercent / 100);
  const totalRefund = refundableRental + depositAmount;

  return {
    elapsedRatio,
    refundPercent,
    tierLabel,
    totalRefund: Math.round(totalRefund),
    depositRefund: depositAmount,
    rentalRefund: Math.round(refundableRental),
  };
}
