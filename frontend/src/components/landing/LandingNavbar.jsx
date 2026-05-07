import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  useNavbarScrollEffect,
  smoothScrollTo,
  scrollToTop,
} from "../../hooks/useScrollAnimation";

export default function LandingNavbar({ activeSection = "" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled } = useNavbarScrollEffect(60);
  const [scrollPct, setScrollPct] = useState(0);

  const navLinks = [
    { id: "hero", label: "Beranda" },
    { id: "features", label: "Fitur" },
    { id: "cta", label: "Mulai" },
  ];

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollPct(Math.min(pct * 100, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    smoothScrollTo(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Scroll progress */}
      <div
        className="l-progress-bar"
        style={{ width: `${scrollPct}%` }}
        aria-hidden="true"
      />

      <nav
        role="navigation"
        aria-label="Navigasi utama"
        className={`l-nav ${isScrolled ? "scrolled" : ""}`}
      >
        <div
          className="max-w-7xl mx-auto px-5 sm:px-8"
          style={{ paddingTop: "18px", paddingBottom: "18px" }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5"
              style={{ cursor: "none" }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--l-primary), #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px var(--l-primary-glow)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--l-font-head)",
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#07070F",
                    lineHeight: 1,
                  }}
                >
                  S
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--l-font-head)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--l-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                SnapBudget
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`l-nav-link px-4 py-2 ${activeSection === link.id ? "active" : ""}`}
                  aria-current={activeSection === link.id ? "page" : undefined}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/about"
                className="l-nav-link px-4 py-2"
                style={{ cursor: "none" }}
              >
                Tentang
              </Link>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="l-nav-link px-4 py-2"
                style={{ cursor: "none" }}
              >
                Masuk
              </Link>
              <Link to="/register" className="l-btn-primary" style={{ padding: "10px 22px", fontSize: "0.875rem" }}>
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              style={{ color: "var(--l-text)", cursor: "pointer" }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 md:hidden"
          style={{ background: "rgba(7,7,15,0.97)", top: 0 }}
        >
          <button
            className="absolute top-5 right-5"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--l-text-muted)", cursor: "pointer" }}
          >
            <X size={24} />
          </button>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                fontFamily: "var(--l-font-head)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color:
                  activeSection === link.id
                    ? "var(--l-primary)"
                    : "var(--l-text)",
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--l-font-head)",
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "var(--l-text)",
              letterSpacing: "-0.02em",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Tentang
          </Link>

          <div className="flex flex-col gap-3 mt-4 w-64">
            <Link
              to="/login"
              className="l-btn-ghost"
              style={{ justifyContent: "center", cursor: "pointer" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="l-btn-primary"
              style={{ justifyContent: "center", cursor: "pointer" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      )}

      {/* Scroll-to-top */}
      {scrollPct > 20 && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 490,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--l-surface)",
            border: "1px solid var(--l-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "none",
            color: "var(--l-primary)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          ↑
        </button>
      )}
    </>
  );
}
