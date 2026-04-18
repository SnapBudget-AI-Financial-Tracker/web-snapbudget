import { getFinancialStatusBadge } from "./categoryIcons.js";

/**
 * FinancialStatusBadge — renders a pill badge for a financial status.
 * Props: status {string} — one of HEMAT | AMAN | WASPADA | BOROS | DARURAT
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
