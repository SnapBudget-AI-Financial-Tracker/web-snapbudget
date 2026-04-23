import useReducedMotion from "../../hooks/useReducedMotion";
import useCountUp from "../../hooks/useCountUp";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Extracts the numeric part from a formatted value string.
 * e.g. "Rp 5.000.000" → 5000000, "42%" → 42
 * Returns null if no numeric content found.
 */
function extractNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/[^0-9.,]/g, "");
  if (!cleaned) return null;

  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;

  // Indonesian format: "5.000.000" (multiple dots as thousand separator)
  if (dotCount > 1) return parseFloat(cleaned.replace(/\./g, ""));

  // Indonesian format with decimal: "5.000.000,50"
  if (dotCount >= 1 && commaCount === 1)
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));

  // English format: "5,000,000.50"
  if (commaCount >= 1 && dotCount === 1)
    return parseFloat(cleaned.replace(/,/g, ""));

  // Single dot — decimal or thousands?
  if (dotCount === 1 && commaCount === 0) {
    if (cleaned.match(/\.\d{1,2}$/)) return parseFloat(cleaned);
    return parseFloat(cleaned.replace(/\./g, ""));
  }

  // Single comma — decimal or thousands?
  if (commaCount === 1 && dotCount === 0) {
    if (cleaned.match(/,\d{1,2}$/))
      return parseFloat(cleaned.replace(",", "."));
    return parseFloat(cleaned.replace(/,/g, ""));
  }

  return parseFloat(cleaned);
}

/**
 * Re-applies the original string's prefix / suffix / thousands style
 * to an animated numeric count.
 */
function reformat(original, animatedCount) {
  if (typeof original === "number") return animatedCount;
  if (typeof original !== "string") return original;

  const num = extractNumber(original);
  if (num === null) return original;

  const prefixMatch = original.match(/^([^0-9]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : "";

  const suffixMatch = original.match(/([^0-9]*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : "";

  const decimalMatch = original.match(/[.,](\d+)(?:[^0-9]*)$/);
  let decimalPlaces = 0;
  if (decimalMatch) {
    const dp = decimalMatch[1];
    if (!/^0+$/.test(dp)) decimalPlaces = dp.length;
  }

  const formatted = animatedCount.toFixed(decimalPlaces);
  const [intPart, decPart] = formatted.split(".");
  const idStyle = original.match(/\d{1,3}(\.\d{3})+(,\d+)?/);
  const intFormatted = idStyle
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const decFormatted =
    decPart !== undefined && decPart !== "0".repeat(decPart.length)
      ? (idStyle ? "," : ".") + decPart
      : "";

  return prefix + intFormatted + decFormatted + suffix;
}

/**
 * Returns an inline-style gradient for the card based on the iconBg colour.
 * Uses inline style to avoid Tailwind JIT purge issues with dynamic class names.
 */
function getCardGradient(iconBg) {
  const palette = {
    orange: "rgba(255, 237, 213, 0.55)",
    amber: "rgba(254, 243, 199, 0.55)",
    emerald: "rgba(209, 250, 229, 0.55)",
    green: "rgba(220, 252, 231, 0.55)",
    blue: "rgba(219, 234, 254, 0.55)",
    sky: "rgba(224, 242, 254, 0.55)",
    teal: "rgba(204, 251, 241, 0.55)",
    rose: "rgba(255, 228, 230, 0.55)",
    red: "rgba(254, 226, 226, 0.55)",
    purple: "rgba(233, 213, 255, 0.55)",
    pink: "rgba(253, 242, 248, 0.55)",
    primary: "rgba(204, 251, 241, 0.55)",
    zinc: "rgba(244, 244, 245, 0.55)",
  };
  const colorName = iconBg?.match(/bg-([a-z]+)-\d+/)?.[1] || "teal";
  const color = palette[colorName] ?? palette.teal;
  return {
    background: `linear-gradient(140deg, ${color} 0%, rgba(255,255,255,1) 62%)`,
  };
}

/**
 * StatCard — premium fintech stat card for the Dashboard.
 *
 * Props:
 *   title       {string}      — label text (shown above value)
 *   value       {string|node} — formatted value, e.g. "Rp 3.000.000"
 *   subtitle    {string}      — optional helper text below value
 *   icon        {ReactNode}   — lucide-react icon element
 *   iconBg      {string}      — Tailwind bg class for icon badge (e.g. "bg-orange-50")
 *   iconColor   {string}      — Tailwind text class for icon (e.g. "text-orange-600")
 *   trend       {string}      — optional: "up" | "down" — shows trend arrow badge
 *   trendLabel  {string}      — optional: text shown next to trend arrow
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-primary-50",
  iconColor = "text-primary-600",
  trend,
  trendLabel,
}) {
  const reducedMotion = useReducedMotion();

  const numericTarget = extractNumber(value);
  const animatedCount = useCountUp(numericTarget ?? 0, 1200);
  const displayValue =
    numericTarget !== null ? reformat(value, animatedCount) : value;

  return (
    <div
      className={[
        "relative overflow-hidden",
        "border border-teal-100/60",
        "rounded-[var(--radius-xl)]",
        "p-5",
        "shadow-[var(--shadow-md)]",
        "hover:shadow-[var(--shadow-xl)]",
        !reducedMotion
          ? "hover:-translate-y-1 transition-all duration-200 ease-out"
          : "transition-shadow duration-200 ease-out",
        "cursor-default",
      ].join(" ")}
      style={getCardGradient(iconBg)}
    >
      {/* Glass-sheen inner overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[var(--radius-xl)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative corner circle */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "currentColor" }}
        aria-hidden="true"
      />

      {/* ── Top row: icon badge + optional trend badge ── */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-2.5 ${iconBg} rounded-[var(--radius-md)] shadow-sm`}>
          <span className={iconColor}>{icon}</span>
        </div>

        {trend && (
          <div
            className={[
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              trend === "up"
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600",
            ].join(" ")}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendLabel}
          </div>
        )}
      </div>

      {/* ── Label ── */}
      <p className="relative text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-[var(--font-body)]">
        {title}
      </p>

      {/* ── Animated value ── */}
      <h3 className="relative text-2xl font-bold text-zinc-900 leading-tight font-[var(--font-heading)]">
        {displayValue}
      </h3>

      {/* ── Subtitle ── */}
      {subtitle && (
        <p className="relative text-xs text-zinc-400 mt-2 font-[var(--font-body)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
