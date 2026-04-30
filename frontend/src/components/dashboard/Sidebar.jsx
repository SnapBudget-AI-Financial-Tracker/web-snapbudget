import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  LogOut,
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Bot,
} from "lucide-react";
import { Trophy } from "lucide-react";


import useReducedMotion from "../../hooks/useReducedMotion";
import { PiggyBank } from "lucide-react";
const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { path: "/chatbot", label: "AI Chat", icon: Bot },
  { path: "/saving-goals", label: "Goals", icon: PiggyBank },
  { path: "/gamification", label: "Gamifikasi", icon: Trophy },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

function getUserInitials(user) {
  if (!user) return "U";
  const name = user.name || user.username || user.email || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "U";
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  const transitionStyle = prefersReducedMotion
    ? {}
    : { transition: "width 250ms ease-in-out" };

  const sidebarWidth = collapsed ? "64px" : "256px";

  return (
    <>
      {/* ── Mobile backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        style={{ width: sidebarWidth, ...transitionStyle }}
        className={[
          "fixed md:relative top-0 left-0 z-[70]",
          "h-screen md:h-full flex flex-col overflow-hidden",
          // Dark teal gradient background
          "bg-gradient-to-b from-teal-900 to-teal-800",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-300 ease-in-out md:transition-none",
        ].join(" ")}
        aria-label="Navigasi utama"
      >
        {/* ══ Logo area ══ */}
        <div className="flex items-center justify-between min-h-[72px] px-4 border-b border-teal-700/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Icon badge */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-[var(--shadow-primary)]">
                <Wallet size={17} className="text-white" />
              </div>
              {/* Soft glow ring */}
              <div
                className="absolute inset-0 rounded-xl opacity-30 blur-sm -z-10"
                style={{ background: "rgba(20,184,166,0.6)" }}
                aria-hidden="true"
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <span
                  className="font-bold text-[17px] text-white leading-tight block truncate"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  SnapBudget
                </span>
                <p className="text-[10px] text-teal-300/80 leading-tight">
                  AI Financial Tracker
                </p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-teal-300 hover:bg-teal-700/50 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ══ Section label ══ */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-bold text-teal-400/60 uppercase tracking-widest">
              Menu
            </p>
          </div>
        )}

        {/* ══ Navigation ══ */}
        <nav
          className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto"
          role="navigation"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                title={collapsed ? link.label : undefined}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onClose()}
                className={[
                  "relative flex items-center gap-3 px-3 py-2.5",
                  "rounded-[var(--radius-md)] text-sm font-medium cursor-pointer",
                  "transition-all duration-150",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-teal-100/70 hover:bg-white/10 hover:text-white",
                  collapsed ? "justify-center" : "",
                ].join(" ")}
              >
                {/* Active left-edge indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-300 rounded-r-full"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  size={17}
                  className={[
                    "flex-shrink-0",
                    isActive ? "text-teal-300" : "text-teal-400/70",
                  ].join(" ")}
                />

                {!collapsed && <span className="truncate">{link.label}</span>}

                {/* Active dot at the far right */}
                {isActive && !collapsed && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-300 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ══ Bottom: user card + sign-out + collapse ══ */}
        <div className="p-3 space-y-1 border-t border-teal-700/40">
          {/* User profile card */}
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-[var(--radius-md)] bg-teal-800/70 border border-teal-700/40">
              {/* Avatar */}
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full shadow-sm bg-gradient-to-br from-teal-400 to-teal-600">
                <span className="text-xs font-bold text-white">
                  {getUserInitials(user)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + PRO badge */}
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-sm font-semibold leading-tight text-white truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {user.name || user.username || "User"}
                  </p>
                  <span className="flex-shrink-0 text-[9px] font-bold bg-teal-400/25 text-teal-200 px-1.5 py-0.5 rounded-full leading-tight tracking-wide">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-teal-300/60 truncate leading-tight mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Collapsed avatar (no text) */}
          {collapsed && user && (
            <div className="flex justify-center mb-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm bg-gradient-to-br from-teal-400 to-teal-600">
                <span className="text-xs font-bold text-white">
                  {getUserInitials(user)}
                </span>
              </div>
            </div>
          )}

          {/* Sign-out */}
          <button
            onClick={logout}
            title={collapsed ? "Keluar" : undefined}
            aria-label="Keluar"
            className={[
              "flex items-center gap-3 w-full px-3 py-2.5",
              "text-rose-300/80 hover:bg-rose-500/15 hover:text-rose-200",
              "rounded-[var(--radius-md)] text-sm font-medium",
              "transition-colors duration-150 cursor-pointer",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className={[
              "hidden md:flex items-center gap-3 w-full px-3 py-2",
              "text-teal-300/50 hover:bg-white/10 hover:text-teal-200",
              "rounded-[var(--radius-md)] text-sm font-medium",
              "transition-colors duration-150 cursor-pointer",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronRight size={16} className="flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft size={16} className="flex-shrink-0" />
                <span className="text-xs">Ciutkan</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
