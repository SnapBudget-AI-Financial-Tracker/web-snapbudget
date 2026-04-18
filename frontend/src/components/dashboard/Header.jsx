import { Menu, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-zinc-900">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 shadow-sm cursor-pointer hover:bg-zinc-200 transition-colors overflow-hidden">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-zinc-600" />
          )}
        </div>
      </div>
    </header>
  );
}
