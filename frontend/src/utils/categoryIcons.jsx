import {
  UtensilsCrossed,
  Coffee,
  Car,
  ShoppingBag,
  FileText,
  Gamepad2,
  Heart,
  MoreHorizontal,
} from "lucide-react";

/**
 * Returns a lucide-react icon component for a given category string.
 * Matches both Indonesian and English category names (case-insensitive).
 *
 * Requirements: 7.4
 */
export function getCategoryIcon(category) {
  if (!category) return MoreHorizontal;

  const normalized = category.toLowerCase().trim();

  if (normalized.includes("makan") || normalized.includes("food")) {
    return UtensilsCrossed;
  }
  if (normalized.includes("minum") || normalized.includes("drink") || normalized.includes("beverage")) {
    return Coffee;
  }
  if (normalized.includes("transport") || normalized.includes("kendaraan")) {
    return Car;
  }
  if (normalized.includes("belanja") || normalized.includes("shopping")) {
    return ShoppingBag;
  }
  if (normalized.includes("tagihan") || normalized.includes("bill") || normalized.includes("utilities")) {
    return FileText;
  }
  if (normalized.includes("hiburan") || normalized.includes("entertainment") || normalized.includes("game")) {
    return Gamepad2;
  }
  if (normalized.includes("kesehatan") || normalized.includes("health") || normalized.includes("medical")) {
    return Heart;
  }

  return MoreHorizontal;
}

/**
 * Returns badge config (label, bg, text color) for a financial status string.
 * Supports: HEMAT, AMAN, WASPADA, BOROS, DARURAT (case-insensitive).
 *
 * Requirements: 7.3
 */
export function getFinancialStatusBadge(status) {
  const normalized = (status || "").toUpperCase().trim();

  const configs = {
    HEMAT:    { label: "HEMAT",    bg: "bg-emerald-100", text: "text-emerald-700" },
    AMAN:     { label: "AMAN",     bg: "bg-blue-100",    text: "text-blue-700"    },
    WASPADA:  { label: "WASPADA",  bg: "bg-amber-100",   text: "text-amber-700"   },
    BOROS:    { label: "BOROS",    bg: "bg-orange-100",  text: "text-orange-700"  },
    DARURAT:  { label: "DARURAT",  bg: "bg-rose-100",    text: "text-rose-700"    },
  };

  return configs[normalized] ?? { label: status || "—", bg: "bg-zinc-100", text: "text-zinc-600" };
}

/**
 * FinancialStatusBadge — renders a pill badge for a financial status.
 *
 * Props:
 *   status {string} — one of HEMAT | AMAN | WASPADA | BOROS | DARURAT
 *
 * Requirements: 7.3
 */
export function FinancialStatusBadge({ status }) {
  const { label, bg, text } = getFinancialStatusBadge(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
