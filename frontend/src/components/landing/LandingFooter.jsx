import { Link } from "react-router-dom";

const footerLinks = {
  Produk: [
    { label: "Fitur", to: "#features" },
    { label: "Harga", to: "/pricing" },
    { label: "Roadmap", to: "/roadmap" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Karir", to: "/careers" },
  ],
  Dukungan: [
    { label: "Pusat Bantuan", to: "/help" },
    { label: "Kontak", to: "/contact" },
    { label: "Status", to: "/status" },
  ],
};

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--l-bg)",
        borderTop: "1px solid var(--l-border)",
        padding: "80px 0 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: "20%", right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--l-primary-glow), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--l-primary), #059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px var(--l-primary-glow)",
                }}
              >
                <span style={{ fontFamily: "var(--l-font-head)", fontWeight: 800, fontSize: 16, color: "#07070F" }}>
                  S
                </span>
              </div>
              <span style={{ fontFamily: "var(--l-font-head)", fontWeight: 700, fontSize: "1.1rem", color: "var(--l-text)" }}>
                SnapBudget
              </span>
            </div>
            <p style={{ fontFamily: "var(--l-font-body)", fontSize: "0.85rem", color: "var(--l-text-muted)", lineHeight: 1.7, maxWidth: 220, marginBottom: 24 }}>
              AI-powered financial tracker yang membantu Anda mengelola keuangan lebih cerdas.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "in", "yt"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "var(--l-surface)",
                    border: "1px solid var(--l-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--l-text-muted)",
                    fontFamily: "var(--l-font-head)", fontWeight: 600, fontSize: "0.75rem",
                    transition: "border-color 0.2s, color 0.2s",
                    textDecoration: "none",
                  }}
                  aria-label={icon}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4
                style={{
                  fontFamily: "var(--l-font-head)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--l-text)",
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {cat}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{
                        fontFamily: "var(--l-font-body)",
                        fontSize: "0.875rem",
                        color: "var(--l-text-muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "var(--l-primary)")}
                      onMouseLeave={(e) => (e.target.style.color = "var(--l-text-muted)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--l-border)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontFamily: "var(--l-font-body)", fontSize: "0.8rem", color: "var(--l-text-muted)" }}>
            © {year} SnapBudget. Dibuat dengan ❤️ di Indonesia.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Privasi", to: "/privacy" },
              { label: "Ketentuan", to: "/terms" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  fontFamily: "var(--l-font-body)",
                  fontSize: "0.8rem",
                  color: "var(--l-text-muted)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
