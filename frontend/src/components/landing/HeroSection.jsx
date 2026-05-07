import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import IPhoneMockup from "./IPhoneMockup";

// Split text by chars
function SplitHeading({ text, className, style, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, wi) => (
        <span
          key={wi}
          style={{
            display: "inline-flex",
            overflow: "hidden",
            marginRight: wi < words.length - 1 ? "0.3em" : 0,
          }}
        >
          {word.split("").map((char, ci) => {
            const idx = words.slice(0, wi).join("").length + ci;
            return (
              <span
                key={ci}
                className="l-split-char"
                style={{
                  transitionDelay: visible ? `${delay + idx * 30}ms` : "0ms",
                  ...(visible
                    ? { opacity: 1, transform: "translateY(0) rotateX(0)" }
                    : {}),
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

// Parallax on scroll
function useParallax(speed = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const y = window.scrollY * speed;
      ref.current.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

// Mouse tilt on hero
function useHeroTilt() {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1200px) rotateX(${y * -4}deg) rotateY(${x * 6}deg)`;
  }, []);
  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    ref.current.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    setTimeout(() => {
      if (ref.current) ref.current.style.transition = "";
    }, 600);
  }, []);
  return { ref, onMove, onLeave };
}

export default function HeroSection() {
  const { ref: tiltRef, onMove, onLeave } = useHeroTilt();
  const orbRef1 = useParallax(0.08);
  const orbRef2 = useParallax(0.05);
  const iphoneRef = useParallax(0.12);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "var(--l-bg)", paddingTop: "80px" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Grain */}
      <div className="l-grain" aria-hidden="true" />

      {/* Mesh bg */}
      <div className="l-mesh-bg" aria-hidden="true">
        <div className="l-orb l-orb-1" ref={orbRef1} />
        <div className="l-orb l-orb-2" ref={orbRef2} />
        <div className="l-orb l-orb-3" />
      </div>

      {/* Grid lines decoration */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--l-border) 1px, transparent 1px), linear-gradient(90deg, var(--l-border) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.4,
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
        }}
      />

      {/* 3D tilt container */}
      <div
        ref={tiltRef}
        className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-24 lg:py-32"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* ── Left: Text ── */}
          <div style={{ transformStyle: "preserve-3d" }}>
            {/* AI badge */}
            <div
              className="l-badge mb-8"
              style={{ transform: "translateZ(20px)" }}
            >
              <span className="l-badge-dot" />
              AI-Powered Finance
            </div>

            {/* Headline with split text */}
            <h1
              className="l-heading mb-6"
              style={{
                fontFamily: "var(--l-font-head)",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                color: "var(--l-text)",
                transform: "translateZ(30px)",
              }}
            >
              <SplitHeading text="Kelola" delay={0} />{" "}
              <SplitHeading
                text="Keuangan"
                delay={100}
                style={{ color: "var(--l-primary)" }}
              />
              <br />
              <SplitHeading text="Lebih" delay={200} />{" "}
              <span className="l-gradient-text-gold">
                <SplitHeading text="Cerdas" delay={300} />
              </span>
            </h1>

            <p
              style={{
                fontFamily: "var(--l-font-body)",
                fontSize: "1.1rem",
                lineHeight: 1.75,
                color: "var(--l-text-muted)",
                maxWidth: 480,
                marginBottom: 40,
                transform: "translateZ(15px)",
              }}
              className="l-reveal visible"
            >
              Cukup foto struk belanja — AI SnapBudget otomatis mencatat,
              mengkategorikan, dan menganalisis pengeluaran Anda tanpa input
              manual.
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-wrap gap-4 mb-10"
              style={{ transform: "translateZ(20px)" }}
            >
              <Link to="/register" className="l-btn-primary">
                Mulai Gratis
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="l-btn-ghost">
                Sudah punya akun
              </Link>
            </div>
          </div>

          {/* ── Right: iPhone Mockup ── */}
          <div
            ref={iphoneRef}
            className="relative flex items-center justify-center"
            style={{ minHeight: 520, transform: "translateZ(0)" }}
          >
            {/* Glow rings behind phone */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                border: "1px solid rgba(0,212,170,0.15)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animation: "ringExpand 4s ease-out infinite",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                borderRadius: "50%",
                border: "1px solid rgba(0,212,170,0.07)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animation: "ringExpand 4s ease-out 1.5s infinite",
              }}
            />

            <div className="l-iphone-wrapper l-float">
              <IPhoneMockup />
              <div className="l-iphone-glow" aria-hidden="true" />
            </div>

            {/* Floating stat badges */}
            <div
              className="l-float-delay"
              style={{
                position: "absolute",
                top: "12%",
                left: "-5%",
                background: "var(--l-surface)",
                border: "1px solid var(--l-border-glow)",
                borderRadius: 14,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(0,212,170,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--l-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--l-font-head)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "var(--l-text)",
                  }}
                >
                  Scan Struk
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--l-primary)" }}>
                  AI sudah baca
                </div>
              </div>
            </div>

            <div
              className="l-float-slow"
              style={{
                position: "absolute",
                bottom: "14%",
                right: "-3%",
                background: "var(--l-surface)",
                border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: 14,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(245,166,35,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--l-accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--l-font-head)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "var(--l-text)",
                  }}
                >
                  Hemat 30%
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--l-accent)" }}>
                  rata-rata pengguna
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0.5 }}
      >
        <span
          style={{
            fontFamily: "var(--l-font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--l-text-muted)",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background:
              "linear-gradient(to bottom, var(--l-primary), transparent)",
            animation: "lFloat 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
