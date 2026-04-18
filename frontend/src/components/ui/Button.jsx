import { Loader2 } from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion";

export default function Button({
  children,
  isLoading,
  icon: Icon,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();

  const scaleClasses = prefersReducedMotion
    ? ""
    : "hover:scale-[1.02] active:scale-[0.97]";

  const baseStyles = `w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-[var(--radius-lg)] shadow-sm text-sm font-medium
    transition-all duration-200 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-70 disabled:cursor-not-allowed
    ${scaleClasses}
    group relative overflow-hidden`;

  const variants = {
    primary:
      "text-white bg-teal-700 hover:bg-teal-800 focus:ring-teal-600 border border-transparent",
    secondary:
      "text-teal-800 bg-white hover:bg-teal-50 focus:ring-teal-300 border border-teal-200",
    outline:
      "text-teal-700 bg-transparent hover:bg-teal-50 focus:ring-teal-300 border border-teal-700",
    danger:
      "text-white bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 border border-transparent",
    ghost:
      "text-teal-700 bg-transparent hover:bg-teal-50 focus:ring-teal-200 border border-transparent shadow-none",
    // Teal gradient for primary CTAs
    gradient:
      "text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 focus:ring-teal-600 border border-transparent shadow-[var(--shadow-primary)]",
    // Accent orange for high-emphasis CTAs
    accent:
      "text-white bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-800 hover:to-amber-700 focus:ring-orange-500 border border-transparent shadow-[var(--shadow-accent)]",
    // Shimmer = gradient + shine on hover
    shimmer:
      "text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 focus:ring-teal-600 border border-transparent shadow-[var(--shadow-primary)]",
  };

  const isShimmer = variant === "shimmer";

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {isShimmer && !prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
        />
      )}

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {children}
          {Icon && (
            <Icon
              className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          )}
        </>
      )}
    </button>
  );
}
