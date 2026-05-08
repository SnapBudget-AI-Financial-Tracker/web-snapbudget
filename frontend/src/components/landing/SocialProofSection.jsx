import { useState, useEffect, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

function useCountUp(target, duration = 2000, start = false, decimals = 0) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion || !start ? target : 0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!start || reducedMotion) return;
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = eased * target;
      setValue(
        decimals > 0 ? parseFloat(raw.toFixed(decimals)) : Math.floor(raw),
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start, reducedMotion, decimals]);

  return value;
}

function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Stat card with count-up ──────────────────────────────────────
function StatCard({
  value,
  suffix = "",
  prefix = "",
  label,
  accent,
  delay = 0,
  isVisible,
  decimals = 0,
}) {
  const count = useCountUp(value, 2200, isVisible, decimals);
  const { ref, visible: cardVisible } = useReveal(0.1);

  return (
    <div
      ref={ref}
      className="l-stat-card"
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ${delay}ms ease, transform 0.7s ${delay}ms ease`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          fontFamily: "var(--l-font-head)",
          fontWeight: 800,
          fontSize: "clamp(2.2rem, 4vw, 3rem)",
          color: accent,
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: "-0.03em",
        }}
      >
        {prefix}
        {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString("id-ID")}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: "var(--l-font-body)",
          fontSize: "0.875rem",
          color: "var(--l-text-muted)",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function SocialProofSection() {
  const { ref: sectionRef, visible: sectionVisible } = useReveal(0.15);

  const stats = [
    {
      value: 500,
      suffix: "+",
      label: "Pengguna Aktif",
      accent: "var(--l-primary)",
    },
    {
      value: 10000,
      suffix: "+",
      label: "Transaksi Tercatat",
      accent: "var(--l-accent)",
    },
    {
      value: 4.9,
      suffix: "/5",
      label: "Rating Rata-rata",
      accent: "#818CF8",
      decimals: 1,
    },
  ];

  return (
    <section
      id="social-proof"
      style={{
        background: "var(--l-bg)",
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)",
          top: "10%",
          right: "-15%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div ref={sectionRef} className="grid md:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <StatCard
              key={s.label}
              {...s}
              delay={i * 150}
              isVisible={sectionVisible}
              decimals={s.decimals || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
