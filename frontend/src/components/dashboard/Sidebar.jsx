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
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/settings", label: "Settings", icon: Settings },
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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: sidebarWidth, ...transitionStyle }}
        className={`fixed md:relative top-0 left-0 z-[70] h-screen md:h-full bg-white border-r border-teal-100 flex flex-col overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 ease-in-out md:transition-none`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between min-h-[72px]">
          <div className="flex items-center gap-2 min-w-0">
            {/* Wallet icon with gradient */}
            <div className="relative flex-shrink-0 w-8 h-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                <Wallet size={16} className="text-white" />
              </div>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
                SnapBudget
              </span>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto" role="navigation">
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
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium cursor-pointer
                  transition-colors duration-150
                  ${isActive
                    ? "bg-teal-700 text-white shadow-[var(--shadow-primary)]"
                    : "text-teal-700 hover:bg-teal-50 hover:text-teal-900"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {/* Active left border indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-300 rounded-r-full"
                    aria-hidden="true"
                  />
                )}
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-teal-100 p-2 space-y-1">
          {/* User avatar + name (expanded only) */}
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-xs font-bold">
                  {getUserInitials(user)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-teal-900 truncate">
                  {user.name || user.username || "User"}
                </p>
                <p className="text-xs text-teal-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={logout}
            title={collapsed ? "Sign Out" : undefined}
            aria-label="Sign Out"
            className={`flex items-center gap-3 w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 cursor-pointer
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden md:flex items-center gap-3 w-full px-3 py-2 text-teal-500 hover:bg-teal-50 hover:text-teal-700 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 cursor-pointer
              ${collapsed ? "justify-center" : ""}
            `}
          >
            {collapsed ? (
              <ChevronRight size={18} className="flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft size={18} className="flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
