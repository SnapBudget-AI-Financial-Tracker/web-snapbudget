import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect, Fragment } from "react";

function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function CTASection() {
  const { ref, visible } = useReveal(0.2);
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };
    const el = sectionRef.current;
    if (el) el.addEventListener("mousemove", onMove, { passive: true });
    return () => { if (el) el.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <section
      id="cta"
      ref={sectionRef}
      style={{ background: "var(--l-bg-2)", padding: "120px 0", position: "relative", overflow: "hidden" }}
    >
      {/* Lines */}
      <div className="l-line-h" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      {/* Animated teal orb that follows mouse subtly */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${mousePos.x * 30}px), calc(-50% + ${mousePos.y * 30}px))`,
          transition: "transform 0.5s ease",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--l-border) 1px, transparent 1px), linear-gradient(90deg, var(--l-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.3,
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <div ref={ref}>
          <div
            className="l-badge"
            style={{
              display: "inline-flex",
              marginBottom: 24,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <span className="l-badge-dot" />
            Mulai Sekarang — Gratis
          </div>

          <h2
            style={{
              fontFamily: "var(--l-font-head)",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "var(--l-text)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(30px)",
              transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease",
            }}
          >
            Kendalikan Keuangan Anda{" "}
            <br className="hidden sm:block" />
            <span className="l-gradient-text">Mulai Hari Ini</span>
          </h2>

          <p
            style={{
              fontFamily: "var(--l-font-body)",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              color: "var(--l-text-muted)",
              maxWidth: 520,
              margin: "0 auto 40px",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease",
            }}
          >
            Bergabunglah dengan para pengguna lainnya yang telah merasakan manfaat
            mengelola keuangan secara cerdas dengan bantuan AI.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 40,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.7s 0.3s ease, transform 0.7s 0.3s ease",
            }}
          >
            <Link
              to="/register"
              className="l-btn-primary"
              style={{ fontSize: "1rem", padding: "14px 32px" }}
            >
              Daftar Gratis Sekarang
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="l-btn-ghost"
              style={{ fontSize: "1rem", padding: "14px 28px" }}
            >
              Sudah punya akun?
            </Link>
          </div>

          {/* Trust micro-copy */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              opacity: visible ? 0.55 : 0,
              transition: "opacity 0.7s 0.4s ease",
            }}
          >
            {["100% Gratis", "Tanpa kartu kredit", "Privasi terjaga"].map((item, i) => (
              <Fragment key={item}>
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 3, height: 3,
                      borderRadius: "50%",
                      background: "var(--l-border-glow)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "var(--l-font-body)",
                    fontSize: "0.82rem",
                    color: "var(--l-text-muted)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {item}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
