import { useEffect, useRef, useState, useCallback } from "react";
import useReducedMotion from "./useReducedMotion";

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * Requirement 3: Scroll-Triggered Animations
 *
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (default: 0.2)
 * @param {boolean} options.triggerOnce - Whether to trigger only once (default: true)
 * @param {string} options.rootMargin - Root margin for observer (default: '0px')
 * @returns {Object} - { ref, isVisible, hasAnimated }
 */
export function useScrollAnimation({
  threshold = 0.2,
  triggerOnce = true,
  rootMargin = "0px",
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleIntersection = useCallback(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (reducedMotion) {
            // If reduced motion is enabled, mark as visible immediately
            setIsVisible(true);
            setHasAnimated(true);
          } else {
            setIsVisible(true);
            if (triggerOnce) {
              setHasAnimated(true);
            }
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      });
    },
    [threshold, triggerOnce, reducedMotion]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin]);

  // If reduced motion is enabled, always return visible
  if (reducedMotion) {
    return { ref, isVisible: true, hasAnimated: true };
  }

  return { ref, isVisible, hasAnimated };
}

/**
 * Hook to track which section is currently active in the viewport
 * Requirement 6.3: Active navigation indicator
 *
 * @param {string[]} sectionIds - Array of section IDs to track
 * @returns {string} - ID of the currently active section
 */
export function useActiveSection(sectionIds = []) {
  const [activeSection, setActiveSection] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
      rootMargin: "-20% 0px -20% 0px",
    });

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return reducedMotion ? "" : activeSection;
}

/**
 * Hook for navbar glassmorphism effect on scroll
 * Requirement 6.6: Navbar glassmorphism after 80px scroll
 *
 * @param {number} scrollThreshold - Scroll threshold in pixels (default: 80)
 * @returns {boolean} - Whether navbar should show glassmorphism
 */
export function useNavbarScrollEffect(scrollThreshold = 80) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollY > scrollThreshold);
      setShowScrollToTop(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollThreshold]);

  return { isScrolled, showScrollToTop };
}

/**
 * Utility function for smooth scroll to element
 * Requirement 6.2: Smooth scroll to section
 *
 * @param {string} elementId - ID of the element to scroll to
 */
export function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/**
 * Utility function to scroll to top of page
 * Requirement 6.5: Scroll to top functionality
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
