import { useEffect, useRef } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import { useActiveSection } from "../hooks/useScrollAnimation";
import "../components/landing/landing.css";

function useCursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const follower = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      follower.current.x = lerp(follower.current.x, mouse.current.x, 0.1);
      follower.current.y = lerp(follower.current.y, mouse.current.y, 0.1);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${follower.current.x}px, ${follower.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return { dotRef, ringRef };
}

export default function Landing() {
  const sectionIds = ["hero", "features", "cta"];
  const activeSection = useActiveSection(sectionIds);
  const { dotRef, ringRef } = useCursorFollower();

  // Scroll to hash on initial load if present
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="landing-root min-h-screen">
      {/* Global custom cursor — active across all sections */}
      <div className="l-cursor" ref={dotRef} aria-hidden="true" />
      <div className="l-cursor-follower" ref={ringRef} aria-hidden="true" />
      {/* Navigation */}
      <LandingNavbar activeSection={activeSection} />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Section */}
      <FeatureSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
