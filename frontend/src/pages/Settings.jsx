import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { User, Bell, Shield, Wallet, CreditCard, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
    { id: "connected", label: "Connected Accounts", icon: Wallet },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Settings</h1>
          <p className="text-sm text-zinc-500">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-zinc-900" : "text-zinc-500"} />
                      {tab.label}
                    </div>
                    {isActive && <ChevronRight size={16} className="text-zinc-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200">
                  <h2 className="text-lg font-semibold text-zinc-900 mb-1">Profile Information</h2>
                  <p className="text-sm text-zinc-500">Update your account profile details and email address.</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-300">
                      <User size={32} className="text-zinc-400" />
                    </div>
                    <div>
                      <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm mb-2 cursor-pointer">
                        Change Avatar
                      </button>
                      <p className="text-xs text-zinc-500">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <form className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow"
                        defaultValue={user?.name || "John Doe"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow bg-zinc-50"
                        defaultValue={user?.email || "john@example.com"}
                        readOnly
                      />
                      <p className="text-xs text-zinc-500 mt-1">Your email address is used for sign in and cannot be changed here.</p>
                    </div>
                    
                    <div className="pt-4">
                      <button type="button" className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== "profile" && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <SettingsIcon size={32} className="text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2 capitalize">
                  {activeTab} Settings
                </h3>
                <p className="text-zinc-500 text-sm max-w-sm">
                  The {activeTab} settings panel is currently under construction. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
