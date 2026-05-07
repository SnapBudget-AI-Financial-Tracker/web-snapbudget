import { useState, useEffect } from "react";
import { TrendingUp, Receipt, Target, Wallet } from "lucide-react";

// Dark-themed inline styles — tidak bergantung pada Tailwind light tokens
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2333",
  border: "rgba(255,255,255,0.08)",
  primary: "#00d4aa",
  primaryDim: "rgba(0,212,170,0.15)",
  accent: "#f5a623",
  accentDim: "rgba(245,166,35,0.15)",
  success: "#34d399",
  danger: "#f87171",
  text: "#e8eeff",
  textMuted: "#7a8aa4",
  textDim: "#4a5568",
  indigo: "#818cf8",
  frame: "#1a1a2e",
  bezel: "#0f0f1a",
};

export default function IPhoneMockup() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Wallet,
      content: (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Balance card */}
          <div style={{
            background: `linear-gradient(135deg, ${C.primaryDim}, rgba(0,212,170,0.05))`,
            border: `1px solid rgba(0,212,170,0.3)`,
            borderRadius: 14,
            padding: "14px 16px",
          }}>
            <p style={{ fontSize: 10, color: C.primary, fontWeight: 600, marginBottom: 4 }}>
              Saldo Total
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>
              Rp 2.500.000
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <div>
                <p style={{ fontSize: 10, color: C.textMuted }}>Pemasukan</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.success }}>+Rp 3.200.000</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, color: C.textMuted }}>Pengeluaran</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.danger }}>-Rp 700.000</p>
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px",
            }}>
              <TrendingUp size={14} style={{ color: C.primary, marginBottom: 6 }} />
              <p style={{ fontSize: 10, color: C.textMuted }}>Budget Health</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.success }}>Aman</p>
            </div>
            <div style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px",
            }}>
              <Target size={14} style={{ color: C.accent, marginBottom: 6 }} />
              <p style={{ fontSize: 10, color: C.textMuted }}>Target</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>65%</p>
            </div>
          </div>

          {/* Recent transactions */}
          <div style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "12px",
          }}>
            <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 8 }}>
              Transaksi Terbaru
            </p>
            {[
              { name: "Indomaret", amount: "-Rp 85.000", cat: "Belanja", color: C.primary },
              { name: "Transfer masuk", amount: "+Rp 500.000", cat: "Pemasukan", color: C.success },
            ].map((tx) => (
              <div key={tx.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{tx.name}</p>
                  <span style={{ fontSize: 9, color: tx.color, background: `${tx.color}18`, borderRadius: 99, padding: "1px 6px" }}>
                    {tx.cat}
                  </span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: tx.amount.startsWith("+") ? C.success : C.danger }}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "scan",
      title: "Scan Struk",
      icon: Receipt,
      content: (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Scan area */}
          <div style={{
            background: C.surface2,
            border: `2px dashed rgba(0,212,170,0.4)`,
            borderRadius: 14,
            padding: "20px 16px",
            textAlign: "center",
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: C.primaryDim,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}>
              <Receipt size={24} style={{ color: C.primary }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Scan Struk Belanja</p>
            <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>AI akan membaca otomatis</p>
            <div style={{
              marginTop: 12,
              padding: "6px 16px",
              background: C.primary,
              borderRadius: 99,
              display: "inline-block",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#07070f" }}>Pilih Foto</span>
            </div>
          </div>

          {/* Last scan */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>
              Scan Terakhir
            </p>
            <div style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Indomaret</p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>Hari ini, 14:30</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Rp 85.000</p>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 9, background: C.primaryDim, color: C.primary, borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                  Makanan
                </span>
                <span style={{ fontSize: 9, background: C.accentDim, color: C.accent, borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                  Minuman
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Analisis",
      icon: TrendingUp,
      content: (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Chart */}
          <div style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "14px",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Pengeluaran 7 Hari
            </p>
            <svg viewBox="0 0 280 100" style={{ width: "100%", height: 90 }}>
              <line x1="0" y1="25" x2="280" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="50" x2="280" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="75" x2="280" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {[60, 45, 80, 55, 70, 40, 65].map((height, i) => (
                <rect
                  key={`bar-${i}`}
                  x={i * 40 + 8}
                  y={80 - height * 0.65}
                  width="22"
                  height={height * 0.65}
                  fill={`rgba(0,212,170,0.6)`}
                  rx="4"
                />
              ))}

              <polyline
                points="19,38 59,49 99,21 139,42 179,32 219,55 259,36"
                fill="none"
                stroke={C.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[19, 59, 99, 139, 179, 219, 259].map((x, i) => (
                <circle key={`pt-${i}`} cx={x} cy={[38, 49, 21, 42, 32, 55, 36][i]} r="3" fill={C.accent} />
              ))}

              {["S", "S", "R", "K", "J", "S", "M"].map((day, i) => (
                <text key={`lbl-${i}`} x={i * 40 + 19} y="96" textAnchor="middle" fill={C.textDim} fontSize="9" fontWeight="500">
                  {day}
                </text>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {[
              { label: "Makanan", amount: "Rp 350.000", color: C.primary },
              { label: "Transport", amount: "Rp 150.000", color: C.accent },
              { label: "Belanja", amount: "Rp 200.000", color: C.success },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: 11, color: C.text }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{item.amount}</span>
              </div>
            ))}
          </div>

          {/* AI Prediction */}
          <div style={{
            background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(129,140,248,0.08))`,
            border: `1px solid rgba(0,212,170,0.25)`,
            borderRadius: 12,
            padding: "12px",
          }}>
            <p style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>— AI Prediksi</p>
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Estimasi minggu depan</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, marginTop: 2 }}>Rp 850.000</p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screens.length]);

  const ActiveIcon = screens[activeScreen].icon;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 288 }}>
        {/* iPhone frame */}
        <div style={{
          background: `linear-gradient(145deg, #2a2a3e, ${C.bezel})`,
          borderRadius: "3rem",
          padding: "12px",
          boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}>
          {/* Screen */}
          <div style={{
            background: C.bg,
            borderRadius: "2.5rem",
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Dynamic island / notch */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 28,
              background: C.bezel,
              borderRadius: "0 0 18px 18px",
              zIndex: 10,
            }} />

            {/* Status bar */}
            <div style={{
              background: C.bg,
              padding: "10px 24px 6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 14,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>9:41</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.surface2, border: `1px solid rgba(255,255,255,0.15)` }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.surface2, border: `1px solid rgba(255,255,255,0.15)` }} />
                <div style={{ width: 20, height: 10, border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 3, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 2, background: C.success, borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* App header */}
            <div style={{
              background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(129,140,248,0.06))`,
              borderBottom: `1px solid rgba(0,212,170,0.15)`,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: C.primaryDim,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid rgba(0,212,170,0.3)`,
              }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>S</span>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>SnapBudget</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{screens[activeScreen].title}</p>
              </div>
            </div>

            {/* Screen content */}
            <div style={{ background: C.bg, minHeight: 380, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, transition: "all 0.5s ease" }}>
                {screens[activeScreen].content}
              </div>
            </div>

            {/* Tab dots */}
            <div style={{
              background: C.surface,
              borderTop: `1px solid ${C.border}`,
              padding: "10px",
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}>
              {screens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreen(index)}
                  style={{
                    height: 6,
                    width: index === activeScreen ? 20 : 6,
                    borderRadius: 99,
                    background: index === activeScreen ? C.primary : C.surface2,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                  aria-label={`Show ${screens[index].title}`}
                />
              ))}
            </div>

            {/* Home indicator */}
            <div style={{
              background: C.bg,
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{ width: 100, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 99 }} />
            </div>
          </div>
        </div>

        {/* Floating badge */}
        <div style={{
          position: "absolute",
          right: -16,
          top: 80,
          background: C.surface2,
          border: `1px solid rgba(0,212,170,0.3)`,
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          animation: "lFloat 5s ease-in-out 0.5s infinite",
        }}>
          <ActiveIcon size={14} style={{ color: C.primary }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
            {screens[activeScreen].title}
          </span>
        </div>
      </div>
    </div>
  );
}
