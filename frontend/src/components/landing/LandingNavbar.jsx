import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronUp } from "lucide-react";
import {
  useNavbarScrollEffect,
  smoothScrollTo,
  scrollToTop,
} from "../../hooks/useScrollAnimation";

/**
 * Landing Page Navbar Component
 * Requirements 1.3, 6.1, 6.2, 6.3, 6.4, 6.6, 9.4, 9.5
 *
 * Features:
 * - Glassmorphism effect after scroll
 * - Active section indicator
 * - Smooth scroll to sections
 * - Hamburger menu on mobile
 * - Scroll to top button
 */
export default function LandingNavbar({ activeSection = "" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled, showScrollToTop } = useNavbarScrollEffect(80);

  const navLinks = [
    { id: "hero", label: "Beranda" },
    { id: "features", label: "Fitur" },
    { id: "testimonials", label: "Testimoni" },
    { id: "cta", label: "Mulai" },
  ];

  const handleNavClick = (sectionId) => {
    smoothScrollTo(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Navigasi utama"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white/90 backdrop-blur-sm shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/landing" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-heading font-bold text-xl text-text-primary">
                SnapBudget
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "text-primary-600"
                      : "text-text-primary hover:text-primary-600"
                  }`}
                  aria-current={activeSection === link.id ? "page" : undefined}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-text-primary hover:text-primary-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 border-2 border-success-600 text-success-600 text-sm font-semibold rounded-full hover:bg-success-50 transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white animate-slideDown md:hidden"
          style={{ top: "64px" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-2xl font-heading font-semibold transition-colors ${
                  activeSection === link.id
                    ? "text-primary-600"
                    : "text-text-primary hover:text-primary-600"
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
              <Link
                to="/login"
                className="w-full px-6 py-3 text-center border-2 border-primary-600 text-primary-600 font-semibold rounded-full hover:bg-primary-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="w-full px-6 py-3 text-center border-2 border-success-600 text-success-600 font-semibold rounded-full hover:bg-success-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 animate-fadeIn"
          aria-label="Kembali ke atas"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
}
