import { useState, useEffect } from "react";
import { TrendingUp, Receipt, Target, Wallet } from "lucide-react";

export default function IPhoneMockup() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: Wallet,
      content: (
        <div className="space-y-3 p-4">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-4 border border-primary-300 shadow-sm">
            <p className="text-xs text-primary-700 font-semibold">
              Saldo Total
            </p>
            <p className="text-2xl font-bold text-primary-800 mt-1">
              Rp 2.500.000
            </p>
            <div className="flex justify-between mt-3 text-xs">
              <div>
                <p className="text-primary-600">Pemasukan</p>
                <p className="font-semibold text-success-600">+Rp 3.200.000</p>
              </div>
              <div className="text-right">
                <p className="text-primary-600">Pengeluaran</p>
                <p className="font-semibold text-danger-600">-Rp 700.000</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 border border-primary-200 shadow-sm">
              <TrendingUp size={16} className="text-primary-600 mb-1" />
              <p className="text-xs text-text-primary font-medium">
                Budget Health
              </p>
              <p className="text-sm font-bold text-success-600">Aman</p>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 border border-primary-200 shadow-sm">
              <Target size={16} className="text-accent-600 mb-1" />
              <p className="text-xs text-text-primary font-medium">Target</p>
              <p className="text-sm font-bold text-accent-600">65%</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "scan",
      title: "Scan Struk",
      icon: Receipt,
      content: (
        <div className="space-y-3 p-4">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-4 border-2 border-dashed border-primary-400 shadow-sm">
            <div className="text-center">
              <Receipt size={32} className="mx-auto text-primary-700 mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                Scan Struk Belanja
              </p>
              <p className="text-xs text-text-secondary mt-1">
                AI akan membaca otomatis
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-secondary">
              Scan Terakhir
            </p>
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 border border-primary-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Indomaret
                  </p>
                  <p className="text-xs text-text-secondary">Hari ini, 14:30</p>
                </div>
                <p className="text-sm font-bold text-text-primary">Rp 85.000</p>
              </div>
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs bg-primary-200 text-primary-800 px-2 py-0.5 rounded-full font-medium">
                  Makanan
                </span>
                <span className="text-xs bg-accent-200 text-accent-800 px-2 py-0.5 rounded-full font-medium">
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
        <div className="space-y-3 p-4">
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-primary-200 shadow-sm">
            <p className="text-sm font-semibold text-text-primary mb-3">
              Pengeluaran 7 Hari
            </p>

            <div className="mb-3">
              <svg viewBox="0 0 280 140" className="w-full h-32">
                <line
                  x1="0"
                  y1="35"
                  x2="280"
                  y2="35"
                  stroke="#ccfbf1"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="70"
                  x2="280"
                  y2="70"
                  stroke="#ccfbf1"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="105"
                  x2="280"
                  y2="105"
                  stroke="#ccfbf1"
                  strokeWidth="1"
                />

                {[60, 45, 80, 55, 70, 40, 65].map((height, i) => (
                  <rect
                    key={`bar-${i}`}
                    x={i * 40 + 5}
                    y={120 - height}
                    width="20"
                    height={height}
                    fill="#0d9488"
                    rx="3"
                    opacity="0.8"
                  />
                ))}

                <polyline
                  points="15,60 55,75 95,40 135,65 175,50 215,80 255,55"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {[15, 55, 95, 135, 175, 215, 255].map((x, i) => (
                  <circle
                    key={`point-${i}`}
                    cx={x}
                    cy={[60, 75, 40, 65, 50, 80, 55][i]}
                    r="3"
                    fill="#f97316"
                  />
                ))}

                {["S", "S", "R", "K", "J", "S", "M"].map((day, i) => (
                  <text
                    key={`label-${i}`}
                    x={i * 40 + 15}
                    y="135"
                    textAnchor="middle"
                    fill="#134e4a"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {day}
                  </text>
                ))}
              </svg>
            </div>

            <div className="space-y-2 pt-3 border-t border-primary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full" />
                  <span className="text-xs text-text-primary">Makanan</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  Rp 350.000
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                  <span className="text-xs text-text-primary">Transport</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  Rp 150.000
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <span className="text-xs text-text-primary">Belanja</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  Rp 200.000
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg p-3 border border-primary-300 shadow-sm">
            <p className="text-xs text-primary-700 font-semibold">
              AI Prediksi
            </p>
            <p className="text-sm font-semibold text-text-primary mt-1">
              Estimasi pengeluaran minggu depan
            </p>
            <p className="text-lg font-bold text-primary-700 mt-1">
              Rp 850.000
            </p>
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
    <div className="flex items-center justify-center h-full">
      <div className="relative w-72 sm:w-80">
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="bg-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />

            {/* Status Bar */}
            <div className="bg-white px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-text-primary">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                <div className="w-5 h-2.5 border border-gray-900 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-green-500 rounded-sm" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-100 to-primary-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center border border-primary-300">
                  <span className="font-bold text-lg text-primary-700">S</span>
                </div>
                <div>
                  <p className="text-xs text-primary-600 font-medium">
                    SnapBudget
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {screens[activeScreen].title}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-primary-50 to-bg-base min-h-[400px] relative">
              <div className="absolute inset-0 transition-all duration-500">
                {screens[activeScreen].content}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-bg-base px-4 py-3 flex justify-center gap-2">
              {screens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreen(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeScreen
                      ? "bg-primary-600 w-4"
                      : "bg-primary-300"
                  }`}
                  aria-label={`Show ${screens[index].title}`}
                />
              ))}
            </div>

            <div className="bg-gradient-to-b from-bg-base to-primary-50 pb-2 pt-1 flex justify-center">
              <div className="w-32 h-1.5 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg px-3 py-2 border border-primary-100 animate-bounce">
          <div className="flex items-center gap-2">
            <ActiveIcon size={16} className="text-primary-600" />
            <span className="text-xs font-semibold text-text-primary">
              {screens[activeScreen].title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
