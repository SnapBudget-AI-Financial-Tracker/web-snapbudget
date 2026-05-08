import { useEffect, useRef, useState } from "react";
import { Menu, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PAGE_META = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview keuangan Anda" },
  "/analytics": { title: "Analytics", subtitle: "Analisis pengeluaran" },
  "/transactions": { title: "Transaksi", subtitle: "Riwayat transaksi" },
  "/settings": { title: "Pengaturan", subtitle: "Kelola akun Anda" },
};

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const meta = PAGE_META[location.pathname] ?? {
    title: "SnapBudget",
    subtitle: "",
  };
  const initials = getInitials(user?.name);
  const firstName = user?.name?.split(" ")[0] || "Pengguna";

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function handleSignOut() {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-teal-100/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-[var(--shadow-xs)]">
      {/* ── Left: hamburger + page title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            className="text-teal-900 font-semibold text-[17px] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="text-xs text-teal-400 hidden sm:block leading-tight mt-0.5">
              {meta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Right: greeting + bell + avatar ── */}
      <div className="flex items-center gap-1.5">
        {/* Greeting — desktop only */}
        <span className="hidden lg:block text-sm text-zinc-400 mr-2 select-none">
          {getGreeting()},{" "}
          <span className="font-medium text-teal-700">{firstName}</span>!
        </span>



        {/* Avatar + dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Menu pengguna"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-1 rounded-full"
          >
            {/* Gradient ring */}
            <div className="p-[2px] rounded-full bg-gradient-to-br from-teal-400 to-teal-600">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name ?? "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-white text-xs font-semibold select-none"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white border border-teal-100 rounded-2xl shadow-[var(--shadow-xl)] animate-slideDown overflow-hidden z-50"
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 bg-gradient-to-br from-teal-50 to-white border-b border-teal-50">
                <p
                  className="text-sm font-semibold text-teal-900 truncate leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {user?.name ?? "Pengguna"}
                </p>
                <p className="text-xs text-teal-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Profile link */}
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <User size={14} className="text-teal-400" />
                Profil &amp; Pengaturan
              </Link>

              {/* Divider + sign-out */}
              <div className="border-t border-teal-50">
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  {/* Inline logout SVG to avoid re-importing LogOut */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
