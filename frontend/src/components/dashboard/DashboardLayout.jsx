import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine title based on path
  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/transactions":
        return "Transactions";
      case "/analytics":
        return "Analytics & Insights";
      case "/settings":
        return "Settings";
      default:
        return "SnapBudget";
    }
  };

  const title = getPageTitle(location.pathname);

  // Close sidebar on route change in mobile
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [location.pathname]);
  return (
    <div className="min-h-screen bg-zinc-50 flex overflow-x-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} title={title} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
