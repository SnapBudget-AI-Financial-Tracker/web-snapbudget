import useReducedMotion from '../../hooks/useReducedMotion';
import useCountUp from '../../hooks/useCountUp';

/**
 * Extracts the numeric part from a formatted value string.
 * e.g. "$1,234.56" → 1234.56, "Rp 5.000" → 5000, "42" → 42
 * Returns null if no numeric content found.
 */
function extractNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  // Remove currency symbols, spaces, and thousand separators (dots/commas before 3 digits)
  const cleaned = value.replace(/[^0-9.,]/g, '');
  if (!cleaned) return null;
  // Handle formats: "1,234.56" (EN) or "1.234,56" (ID)
  // If last separator is a comma followed by 1-2 digits → decimal comma
  const idFormat = cleaned.match(/^[\d.]+,\d{1,2}$/);
  if (idFormat) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  // Otherwise treat comma as thousand separator
  return parseFloat(cleaned.replace(/,/g, ''));
}

/**
 * Reformats an animated count back to the original value's format.
 * Preserves prefix/suffix (currency symbols, etc.) from the original string.
 */
function reformat(original, animatedCount) {
  if (typeof original === 'number') return animatedCount;
  if (typeof original !== 'string') return original;

  const num = extractNumber(original);
  if (num === null) return original;

  // Detect prefix: everything before the first digit
  const prefixMatch = original.match(/^([^0-9]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';

  // Detect suffix: everything after the last digit
  const suffixMatch = original.match(/([^0-9]*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : '';

  // Detect decimal places in original
  const decimalMatch = original.match(/[.,](\d+)(?:[^0-9]*)$/);
  const decimalPlaces = decimalMatch ? decimalMatch[1].length : 0;

  // Format the animated number with same decimal places
  const formatted = animatedCount.toFixed(decimalPlaces);

  // Re-apply thousand separators matching original style
  const [intPart, decPart] = formatted.split('.');
  const idStyle = original.match(/\d{1,3}(\.\d{3})+(,\d+)?/); // e.g. "1.234,56"
  const intFormatted = idStyle
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const decFormatted = decPart !== undefined
    ? (idStyle ? ',' : '.') + decPart
    : '';

  return prefix + intFormatted + decFormatted + suffix;
}

/**
 * StatCard — glassmorphism stat card for Dashboard
 *
 * Props:
 *   title       {string}      — label shown below the value
 *   value       {string|node} — formatted value to display
 *   subtitle    {string}      — optional subtitle below value
 *   icon        {ReactNode}   — icon element (e.g. from lucide-react)
 *   iconBg      {string}      — Tailwind bg class for icon container (e.g. "bg-emerald-50")
 *   iconColor   {string}      — Tailwind text class for icon (e.g. "text-emerald-600")
 *
 * Requirements: 3.4, 7.1, 7.2, 12.1, 12.2
 */
export default function StatCard({ title, value, subtitle, icon, iconBg = 'bg-primary-50', iconColor = 'text-primary-600' }) {
  const reducedMotion = useReducedMotion();

  // Extract numeric target for animation; fall back to null for non-numeric values
  const numericTarget = extractNumber(value);
  const animatedCount = useCountUp(numericTarget ?? 0, 1200);

  // Build the displayed value: animated number reformatted, or raw value if non-numeric
  const displayValue = numericTarget !== null
    ? reformat(value, animatedCount)
    : value;

  return (
    <div
      className={[
        // Glassmorphism base — Requirement 7.1
        'relative overflow-hidden',
        'bg-white/80 backdrop-blur-sm',
        'border border-white/60',
        'rounded-[var(--radius-lg)]',
        'p-6',
        // Shadow — deeper than plain shadow-sm
        'shadow-[var(--shadow-md)]',
        // Hover shadow boost — always applied
        'hover:shadow-[var(--shadow-xl)]',
        // Hover lift — Requirement 3.4 (skip transform if reduced-motion)
        !reducedMotion
          ? 'hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-out'
          : 'transition-[box-shadow] duration-200 ease-out',
        'cursor-default',
      ].join(' ')}
    >
      {/* Subtle inner gradient overlay for glass depth */}
      <div
        className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex justify-between items-start mb-4">
        <div className={`p-2 ${iconBg} rounded-[var(--radius-md)]`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>

      <p className="relative text-sm font-medium text-[var(--color-text-secondary)] mb-1">
        {title}
      </p>
      <h3 className="relative text-2xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
        {displayValue}
      </h3>
      {subtitle && (
        <p className="relative text-xs text-[var(--color-text-muted)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
