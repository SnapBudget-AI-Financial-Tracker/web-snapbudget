import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Skeleton loader component for loading states.
 * Uses `animate-pulse-slow` (pulse keyframe, 1.5s) from index.css.
 * Animation is disabled when `useReducedMotion()` returns true.
 *
 * @param {string}  className - Additional Tailwind classes
 * @param {'card'|'row'|'chart'} variant - Shape of the skeleton
 */
function Skeleton({ className = '', variant = 'row' }) {
  const reducedMotion = useReducedMotion();
  const animationClass = reducedMotion ? '' : 'animate-pulse-slow';
  const base = `bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] ${animationClass}`;

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] ${animationClass} ${className}`}>
        {/* Header line */}
        <div className={`h-4 ${base} w-2/5 mb-3`} />
        {/* Value line */}
        <div className={`h-7 ${base} w-3/5 mb-4`} />
        {/* Footer lines */}
        <div className={`h-3 ${base} w-full mb-2`} />
        <div className={`h-3 ${base} w-4/5`} />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] ${animationClass} ${className}`}>
        {/* Chart title */}
        <div className={`h-4 ${base} w-1/3 mb-4`} />
        {/* Chart area */}
        <div className="flex items-end gap-2 h-40">
          {[60, 85, 45, 70, 55, 90, 40].map((height, i) => (
            <div
              key={i}
              className={`flex-1 ${base} rounded-t-[var(--radius-sm)]`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="flex gap-2 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`flex-1 h-2 ${base}`} />
          ))}
        </div>
      </div>
    );
  }

  // variant === 'row' (default)
  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
      {/* Icon placeholder */}
      <div className={`h-9 w-9 rounded-[var(--radius-md)] flex-shrink-0 ${base}`} />
      {/* Text lines */}
      <div className="flex-1 space-y-2">
        <div className={`h-3.5 ${base} w-2/5`} />
        <div className={`h-3 ${base} w-3/5`} />
      </div>
      {/* Amount placeholder */}
      <div className={`h-4 ${base} w-16 flex-shrink-0`} />
    </div>
  );
}

export default Skeleton;
