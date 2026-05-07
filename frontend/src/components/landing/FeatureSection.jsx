import { useState, useRef, useEffect, useCallback } from "react";
import { Scan, BarChart3, Target, MessageCircle } from "lucide-react";

const features = [
  {
    id: "scan",
    icon: Scan,
    title: "Scan Struk AI",
    description:
      "Foto struk belanja, AI kami otomatis mengekstrak dan mengkategorikan pengeluaran Anda dengan akurasi 95%+.",
    details: [
      "Mendukung format dari merchant populer",
      "Akurasi ekstraksi lebih dari 95%",
      "Kategorisasi otomatis cerdas",
      "Riwayat scan mudah dicari",
    ],
    accent: "var(--l-primary)",
    glow: "rgba(0,212,170,0.12)",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analitik Keuangan",
    description:
      "Visualisasi interaktif membantu memahami pola pengeluaran dan menemukan peluang penghematan nyata.",
    details: [
      "Dashboard real-time dengan grafik interaktif",
      "Analisis tren pengeluaran bulanan",
      "Perbandingan budget vs aktual",
      "Insight AI untuk rekomendasi hemat",
    ],
    accent: "#818CF8",
    glow: "rgba(129,140,248,0.12)",
  },
  {
    id: "goals",
    icon: Target,
    title: "Tujuan Tabungan",
    description:
      "Tetapkan target finansial dan pantau progressnya dengan visual yang memotivasi setiap hari.",
    details: [
      "Multiple goals dengan timeline fleksibel",
      "Tracking progress real-time",
      "Notifikasi milestone otomatis",
      "Rekomendasi jumlah tabungan",
    ],
    accent: "var(--l-accent)",
    glow: "rgba(245,166,35,0.12)",
  },
  {
    id: "chatbot",
    icon: MessageCircle,
    title: "Chatbot AI",
    description:
      "Asisten keuangan pintar yang menjawab pertanyaan dan memberikan saran personal 24/7.",
    details: [
      "Tanya jawab seputar keuangan pribadi",
      "Saran budgeting berdasarkan pola",
      "Peringatan pengeluaran berlebih",
      "Tips mengelola keuangan lebih baik",
    ],
    accent: "#34D399",
    glow: "rgba(52,211,153,0.12)",
  },
];

function useReveal(threshold = 0.15) {
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

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { ref: revealRef, visible } = useReveal(0.1);

  const onMove = useCallback((e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: y * -8, y: x * 10 });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const Icon = feature.icon;

  return (
    <div
      ref={revealRef}
      className="l-reveal"
      style={{
        transitionDelay: `${index * 120}ms`,
        ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}),
      }}
    >
      <div
        ref={cardRef}
        className="l-card"
        style={{
          padding: "32px",
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          cursor: "none",
          background: hovered
            ? `linear-gradient(135deg, var(--l-surface), ${feature.glow})`
            : "var(--l-surface)",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.15s ease-out",
          borderColor: hovered ? feature.accent + "40" : "var(--l-border)",
          boxShadow: hovered
            ? `0 0 40px ${feature.glow}, 0 20px 40px rgba(0,0,0,0.5)`
            : "none",
        }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        aria-expanded={expanded}
      >
        {/* Icon */}
        <div
          className="l-icon-bg mb-6"
          style={{
            background: feature.glow,
            border: `1px solid ${feature.accent}30`,
          }}
        >
          <Icon size={24} style={{ color: feature.accent }} />
        </div>

        {/* Number */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 28,
            fontFamily: "var(--l-font-head)",
            fontWeight: 800,
            fontSize: "3rem",
            color: "var(--l-border)",
            lineHeight: 1,
            userSelect: "none",
          }}
          aria-hidden="true"
        >
          0{index + 1}
        </div>

        <h3
          className="l-subheading mb-3"
          style={{
            fontFamily: "var(--l-font-head)",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "var(--l-text)",
          }}
        >
          {feature.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--l-font-body)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "var(--l-text-muted)",
            marginBottom: 20,
          }}
        >
          {feature.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--l-font-body)",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: feature.accent,
            cursor: "none",
          }}
        >
          {expanded ? "Tutup ↑" : "Detail ↓"}
        </div>

        {expanded && (
          <ul
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid var(--l-border)`,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {feature.details.map((d, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontFamily: "var(--l-font-body)",
                  fontSize: "0.85rem",
                  color: "var(--l-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    marginTop: 4,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: feature.accent,
                    flexShrink: 0,
                  }}
                />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function FeatureSection() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section
      id="features"
      style={{ background: "var(--l-bg-2)", padding: "120px 0", position: "relative", overflow: "hidden" }}
    >
      {/* Decorative horizontal line at top */}
      <div className="l-line-h" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      {/* Subtle dot grid bg */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(var(--l-border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section header */}
        <div
          ref={ref}
          className="mb-20"
          style={{ maxWidth: 600 }}
        >
          <div className="l-badge mb-6">
            <span className="l-badge-dot" />
            Fitur Unggulan
          </div>
          <h2
            className="l-heading mb-5"
            style={{
              fontFamily: "var(--l-font-head)",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "var(--l-text)",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(30px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            Semua yang Anda butuhkan{" "}
            <span className="l-gradient-text">dalam satu tempat</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--l-font-body)",
              fontSize: "1rem",
              color: "var(--l-text-muted)",
              lineHeight: 1.7,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.7s 0.15s ease, transform 0.7s 0.15s ease",
            }}
          >
            Teknologi AI terdepan yang membuat pengelolaan keuangan terasa mudah dan menyenangkan.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}
        </div>
      </div>

      <div className="l-line-h" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}
