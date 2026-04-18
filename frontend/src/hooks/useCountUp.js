import { useState, useEffect, useRef } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * Hook that animates a number from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame with cubic ease-out for GPU-friendly animation.
 * Respects `prefers-reduced-motion` — returns target immediately if true.
 *
 * @param {number} target   - The final numeric value to count up to
 * @param {number} duration - Animation duration in ms (default: 1200)
 * @returns {number} current animated value
 *
 * Requirements: 7.2, 12.1
 */
function useCountUp(target, duration = 1200) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(prefersReducedMotion ? target : 0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion — skip animation entirely
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    // Reset and start animation
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1 - progress)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, prefersReducedMotion]);

  return count;
}

export default useCountUp;
