import { useEffect, useRef, useState } from "react";
import { Bell, Menu, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard":    "Dashboard",
  "/analytics":   "Analytics",
  "/transactions": "Transactions",
  "/settings":    "Settings",
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

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] ?? "SnapBudget";
  const initials = getInitials(user?.name);

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
    <header className="h-16 bg-white border-b border-teal-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1
          className="text-zinc-900"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: notification bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Notification button */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell size={20} />
          {/* Red badge dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="cursor-pointer focus:outline-none"
          >
            {/* Gradient ring */}
            <div className="p-[2px] rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name ?? "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-white text-sm font-semibold select-none"
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
              className="absolute right-0 mt-2 w-44 bg-white border border-teal-100 rounded-xl shadow-[var(--shadow-lg)] animate-slideDown overflow-hidden z-50"
              role="menu"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-teal-50">
                <p className="text-sm font-semibold text-teal-900 truncate" style={{ fontFamily: "var(--font-heading)" }}>
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-teal-500 truncate">{user?.email}</p>
              </div>

              {/* Profile link */}
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <User size={15} className="text-teal-400" />
                Profile
              </Link>

              {/* Sign out */}
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
