import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../components/landing/landing.css";

// Team Photos
import rizkyPhoto from "../assets/about/foto1.jpeg";
import rifqiPhoto from "../assets/about/foto2.jpg";
import aprizalPhoto from "../assets/about/foto3.jpeg";
import aldiPhoto from "../assets/about/foto4.jpg";
import cholidPhoto from "../assets/about/foto5.jpg";

// ── Reveal hook ────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
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

// ── Cursor follower (sama dengan Landing) ──────────────────────
function useCursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const follower = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      follower.current.x = lerp(follower.current.x, mouse.current.x, 0.1);
      follower.current.y = lerp(follower.current.y, mouse.current.y, 0.1);
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${follower.current.x}px,${follower.current.y}px) translate(-50%,-50%)`;
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

// ── Avatar dengan inisial ──────────────────────────────────────
function AvatarInitial({ name, accent, size = 96 }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
        border: `2px solid ${accent}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 28px ${accent}22`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--l-font-head)",
          fontWeight: 800,
          fontSize: size * 0.33,
          color: accent,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

// ── Data tim ───────────────────────────────────────────────────
const team = [
  {
    name: "Aprizal",
    role: "Project Manager",
    path: "AI Engineering",
    university: "Universitas Hang Tuah Pekanbaru",
    accent: "var(--l-accent)",
    image: aprizalPhoto,
    linkedin: "https://www.linkedin.com/in/aprizal-9670972b5/",
    github: "https://github.com/aprizal543",
  },
  {
    name: "Cholid Muntaha",
    role: "AI Engineer",
    path: "AI Engineering",
    university: "Universitas Jenderal Soedirman",
    accent: "#10B981",
    image: cholidPhoto,
    linkedin: "https://www.linkedin.com/in/cholid-muntaha-60474a2b1/",
    github: "https://github.com/CholidMuntaha",
  },
  {
    name: "Rifqi Surya Permana",
    role: "Data Scientist",
    path: "Data Science",
    university: "Bhayangkara Jakarta Raya",
    accent: "#818CF8",
    image: rifqiPhoto,
    linkedin: "https://www.linkedin.com/in/rifqi-permana-01b524374/",
    github: "https://github.com/RIfqi2113",
  },
  {
    name: "Aldi Zulfan Azhari",
    role: "Data Scientist",
    path: "Data Science",
    university: "UIN Sultan Syarif Kasim Riau",
    accent: "#F59E0B",
    image: aldiPhoto,
    linkedin: "https://www.linkedin.com/in/aldi-zulfan-azhari-6973b6368/",
    github: "https://github.com/aldiZulfanAzhari",
  },
  {
    name: "Muhammad Rizky",
    role: "Lead Developer",
    path: "Full Stack Developer",
    university: "UPN Veteran Jakarta",
    accent: "var(--l-primary)",
    image: rizkyPhoto,
    linkedin: "https://www.linkedin.com/in/muhammad-rizky-26557b192/",
    github: "https://github.com/MuhammadRizkyyy",
  },
];

// ── Kartu anggota tim ─────────────────────────────────────────
function TeamCard({ member, index }) {
  const { ref, visible } = useReveal(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ${index * 100}ms ease, transform 0.6s ${index * 100}ms ease`,
      }}
    >
      <div
        className="l-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "32px",
          cursor: "none",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          height: "100%",
          borderColor: hovered ? member.accent + "40" : "var(--l-border)",
          boxShadow: hovered
            ? `0 0 40px ${member.accent}18, 0 20px 40px rgba(0,0,0,0.4)`
            : "none",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Avatar + nama */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {member.image ? (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${member.accent}40`,
                boxShadow: `0 0 20px ${member.accent}22`,
                flexShrink: 0,
              }}
            >
              <img
                src={member.image}
                alt={member.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <AvatarInitial name={member.name} accent={member.accent} />
          )}
          <div>
            <div
              style={{
                fontFamily: "var(--l-font-head)",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "var(--l-text)",
                marginBottom: 4,
              }}
            >
              {member.name}
            </div>
            <div
              style={{
                fontFamily: "var(--l-font-body)",
                fontSize: "0.82rem",
                color: member.accent,
                fontWeight: 600,
              }}
            >
              {member.role}
            </div>
          </div>
        </div>

        {/* Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingTop: 16,
            borderTop: "1px solid var(--l-border)",
          }}
        >
          <InfoRow
            label="Learning Path"
            value={member.path}
            accent={member.accent}
          />
          <InfoRow
            label="Kampus"
            value={member.university}
            accent={member.accent}
          />
        </div>

        {/* Sosial */}
        <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
          <SocialLink
            href={member.linkedin}
            icon={null}
            label="LinkedIn"
            accent={member.accent}
            isLinkedin
          />
          <SocialLink
            href={member.github}
            icon={null}
            label="GitHub"
            accent={member.accent}
            isGithub
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: "var(--l-font-body)",
          fontSize: "0.7rem",
          color: accent,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--l-font-body)",
          fontSize: "0.875rem",
          color: "var(--l-text-muted)",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
  accent,
  isGithub = false,
  isLinkedin = false,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 8,
        border: `1px solid ${hovered ? accent + "60" : "var(--l-border)"}`,
        background: hovered ? accent + "12" : "transparent",
        color: hovered ? accent : "var(--l-text-muted)",
        fontFamily: "var(--l-font-body)",
        fontSize: "0.8rem",
        fontWeight: 500,
        textDecoration: "none",
        cursor: "none",
        transition: "all 0.2s",
      }}
    >
      {isGithub ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ) : isLinkedin ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {label}
    </a>
  );
}

// ── Halaman utama ──────────────────────────────────────────────
export default function About() {
  const { dotRef, ringRef } = useCursorFollower();
  const { ref: heroRef, visible: heroVisible } = useReveal(0.05);
  const { ref: teamRef, visible: teamVisible } = useReveal(0.05);

  return (
    <div
      className="landing-root min-h-screen"
      style={{ background: "var(--l-bg)" }}
    >
      {/* Cursor */}
      <div className="l-cursor" ref={dotRef} aria-hidden="true" />
      <div className="l-cursor-follower" ref={ringRef} aria-hidden="true" />

      {/* Minimal nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          borderBottom: "1px solid var(--l-border)",
          background: "rgba(7,7,15,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-5 sm:px-8"
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--l-text-muted)",
              textDecoration: "none",
              fontFamily: "var(--l-font-body)",
              fontSize: "0.875rem",
              cursor: "none",
              transition: "color 0.2s",
            }}
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <Link
            to="/"
            style={{
              fontFamily: "var(--l-font-head)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--l-text)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
              cursor: "none",
            }}
          >
            SnapBudget
          </Link>

          <Link
            to="/register"
            className="l-btn-primary"
            style={{ padding: "8px 18px", fontSize: "0.8rem", cursor: "none" }}
          >
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero project ───────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 140,
          paddingBottom: 100,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orb dekoratif */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="max-w-4xl mx-auto px-5 sm:px-8 text-center"
          ref={heroRef}
        >
          <div
            className="l-badge"
            style={{
              display: "inline-flex",
              marginBottom: 24,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <span className="l-badge-dot" />
            Capstone Project 2025
          </div>

          <h1
            style={{
              fontFamily: "var(--l-font-head)",
              fontWeight: 800,
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              color: "var(--l-text)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: 24,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(24px)",
              transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease",
            }}
          >
            Tentang <span className="l-gradient-text">SnapBudget</span>
          </h1>

          <p
            style={{
              fontFamily: "var(--l-font-body)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "var(--l-text-muted)",
              maxWidth: 640,
              margin: "0 auto 40px",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(20px)",
              transition: "opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease",
            }}
          >
            SnapBudget adalah aplikasi manajemen keuangan berbasis AI yang
            dirancang untuk membantu pengguna memahami, merencanakan, dan
            mengelola keuangan pribadi dengan cara yang intuitif. Cukup dengan
            foto struk, AI kami akan otomatis memproses data dan memasukkannya
            ke dalam catatan tanpa perlu input pengeluaran manual. Dibangun
            sebagai proyek capstone oleh mahasiswa yang percaya bahwa teknologi
            dapat membuat literasi keuangan lebih mudah diakses semua orang.
          </p>

          {/* Tiga pilar project */}
          <div
            className="grid md:grid-cols-3 gap-4"
            style={{
              marginTop: 48,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(24px)",
              transition: "opacity 0.7s 0.3s ease, transform 0.7s 0.3s ease",
            }}
          >
            {[
              {
                label: "Scan Struk AI",
                desc: "Ekstraksi otomatis dari foto struk",
                accent: "var(--l-primary)",
              },
              {
                label: "Analitik Cerdas",
                desc: "Insight pengeluaran berbasis data",
                accent: "#818CF8",
              },
              {
                label: "Chatbot Keuangan",
                desc: "Asisten AI personal 24/7",
                accent: "var(--l-accent)",
              },
            ].map((p) => (
              <div
                key={p.label}
                className="l-card"
                style={{ padding: "20px 24px", textAlign: "left" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.accent,
                    marginBottom: 12,
                    boxShadow: `0 0 8px ${p.accent}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--l-font-head)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--l-text)",
                    marginBottom: 6,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--l-font-body)",
                    fontSize: "0.82rem",
                    color: "var(--l-text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="l-line-h" />

      {/* ── Tim ───────────────────────────────────────────────── */}
      <section style={{ padding: "100px 0", position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)",
            bottom: "0%",
            left: "-10%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div ref={teamRef} style={{ marginBottom: 60 }}>
            <div
              className="l-badge"
              style={{
                display: "inline-flex",
                marginBottom: 16,
                opacity: teamVisible ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
            >
              <span className="l-badge-dot" />
              Tim Pengembang
            </div>
            <h2
              style={{
                fontFamily: "var(--l-font-head)",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--l-text)",
                letterSpacing: "-0.03em",
                maxWidth: 480,
                opacity: teamVisible ? 1 : 0,
                transform: teamVisible ? "none" : "translateY(20px)",
                transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease",
              }}
            >
              Orang-orang di balik{" "}
              <span className="l-gradient-text">SnapBudget</span>
            </h2>
          </div>

          {/* Baris 1: 3 Anggota */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {team.slice(0, 3).map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>

          {/* Baris 2: 2 Anggota (Centered) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              className="grid md:grid-cols-2 gap-6"
              style={{
                width: "100%",
                maxWidth: "min(100%, 860px)",
              }}
            >
              {team.slice(3, 5).map((member, i) => (
                <TeamCard key={member.name} member={member} index={i + 3} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer minimal ─────────────────────────────────────── */}
      <div className="l-line-h" />
      <footer
        style={{
          padding: "40px 0",
          textAlign: "center",
          fontFamily: "var(--l-font-body)",
          fontSize: "0.82rem",
          color: "var(--l-text-muted)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          SnapBudget · Capstone Project 2025
        </div>
      </footer>
    </div>
  );
}
