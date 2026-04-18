import { useState, useRef } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Button from "../components/ui/Button";
import {
  User, Bell, Shield, Wallet, CreditCard,
  ChevronRight, Settings as SettingsIcon, LoaderCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

const inputClass =
  "w-full px-3 py-2.5 border border-teal-200 rounded-[var(--radius-md)] text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow " +
  "bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]";

const labelClass = "block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const data = await userService.uploadAvatar(file);
      if (data.user) updateUser(data.user);
    } catch (error) {
      console.error("Failed to upload avatar", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      const data = await userService.updateProfile(name);
      if (data.user) updateUser(data.user);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile",    label: "Profile Information",    icon: User       },
    { id: "preferences",label: "Preferences",            icon: Bell       },
    { id: "security",   label: "Security",               icon: Shield     },
    { id: "billing",    label: "Subscription & Billing", icon: CreditCard },
    { id: "connected",  label: "Connected Accounts",     icon: Wallet     },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)] mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Settings
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar nav */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="space-y-1" aria-label="Settings navigation">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-lg)] text-sm font-medium transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
                      isActive
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-teal-600" : "text-[var(--color-text-muted)]"}
                      />
                      {tab.label}
                    </div>
                    {isActive && <ChevronRight size={16} className="text-teal-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div
                className="bg-[var(--color-bg-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)] overflow-hidden"
                style={{ animation: "fadeIn 200ms ease both" }}
              >
                <div className="p-6 border-b border-[var(--color-border-muted)]">
                  <h2
                    className="text-lg font-semibold text-[var(--color-text-primary)] mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Profile Information
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Update your account profile details and email address.
                  </p>
                </div>

                <div className="p-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center border-2 border-dashed border-[var(--color-border-strong)] overflow-hidden relative">
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <LoaderCircle size={24} className="text-indigo-600 animate-spin" />
                        </div>
                      )}
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-[var(--color-text-muted)]" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleAvatarChange}
                        aria-label="Upload avatar image"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="mb-2 w-auto px-4"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Change Avatar"}
                      </Button>
                      <p className="text-xs text-[var(--color-text-muted)]">JPG, GIF or PNG. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Profile form */}
                  <form className="space-y-4 max-w-md" onSubmit={handleProfileSubmit}>
                    <div>
                      <label htmlFor="settings-name" className={labelClass}>Full Name</label>
                      <input
                        id="settings-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-email" className={labelClass}>Email Address</label>
                      <input
                        id="settings-email"
                        type="email"
                        className={`${inputClass} bg-[var(--color-bg-muted)] cursor-not-allowed`}
                        defaultValue={user?.email || ""}
                        readOnly
                        aria-readonly="true"
                      />
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Email cannot be changed here.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="gradient"
                        isLoading={isSaving}
                        className="w-auto px-6"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab !== "profile" && (
              <div
                className="bg-[var(--color-bg-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] shadow-[var(--shadow-sm)] p-12 flex flex-col items-center justify-center text-center"
                style={{ animation: "fadeIn 200ms ease both" }}
              >
                <div className="w-16 h-16 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center mb-4">
                  <SettingsIcon size={32} className="text-[var(--color-text-muted)]" />
                </div>
                <h3
                  className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 capitalize"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {activeTab} Settings
                </h3>
                <p className="text-[var(--color-text-muted)] text-sm max-w-sm">
                  The {activeTab} settings panel is coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
