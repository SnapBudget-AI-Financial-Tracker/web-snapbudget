import { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import SocialProofSection from "../components/landing/SocialProofSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import { useActiveSection } from "../hooks/useScrollAnimation";

export default function Landing() {
  const sectionIds = ["hero", "features", "testimonials", "cta"];
  const activeSection = useActiveSection(sectionIds);

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
    <div className="min-h-screen bg-bg-base">
      {/* Navigation */}
      <LandingNavbar activeSection={activeSection} />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Section */}
      <FeatureSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
