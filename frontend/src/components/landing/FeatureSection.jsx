import { useState, useRef } from "react";
import {
  Scan,
  BarChart3,
  Target,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

/**
 * Feature Section Component
 * Requirement 4: Feature Section with Interactive 3D Animations
 *
 * Features:
 * - 4 main features with SVG icons from Lucide React
 * - 3D tilt effect on hover
 * - Expandable feature details on click
 * - Scroll-triggered animations
 */

const features = [
  {
    id: "scan",
    icon: Scan,
    title: "Scan Struk AI",
    description:
      "Cukup foto struk belanja, AI kami otomatis mengekstrak detail transaksi dan mengkategorikan pengeluaran Anda.",
    details: [
      "Mendukung berbagai format struk dari merchant populer",
      "Akurasi ekstraksi data lebih dari 95%",
      "Kategorisasi otomatis berdasarkan jenis pembelian",
      "Riwayat scan tersimpan rapi dan mudah dicari",
    ],
    color: "from-primary-500 to-primary-600",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analitik Keuangan",
    description:
      "Visualisasi interaktif membantu Anda memahami pola pengeluaran dan menemukan peluang penghematan.",
    details: [
      "Dashboard real-time dengan grafik interaktif",
      "Analisis tren pengeluaran bulanan",
      "Perbandingan budget vs aktual",
      "Insight AI untuk rekomendasi penghematan",
    ],
    color: "from-accent-500 to-accent-600",
  },
  {
    id: "goals",
    icon: Target,
    title: "Tujuan Tabungan",
    description:
      "Tetapkan target finansial dan pantau progress Anda dengan visual yang memotivasi.",
    details: [
      "Buat multiple goals dengan timeline fleksibel",
      "Tracking progress real-time dengan persentase",
      "Notifikasi milestone untuk menjaga motivasi",
      "Rekomendasi jumlah tabungan per bulan",
    ],
    color: "from-success-500 to-success-600",
  },
  {
    id: "chatbot",
    icon: MessageCircle,
    title: "Chatbot AI",
    description:
      "Asisten keuangan pintar yang siap menjawab pertanyaan dan memberikan saran personal 24/7.",
    details: [
      "Tanya jawab seputar keuangan pribadi",
      "Saran budgeting berdasarkan pola pengeluaran",
      "Peringatan jika pengeluaran melebihi batas",
      "Tips dan trik mengelola keuangan lebih baik",
    ],
    color: "from-info-500 to-info-600",
  },
];

/**
 * Individual Feature Card with 3D Tilt Effect
 * Requirement 4.3: 3D tilt effect on hover
 */
function FeatureCard({ feature, index, isVisible }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.3s ease-out",
    });
  };

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div
        className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform`}
        >
          <Icon size={28} />
        </div>

        {/* Title & Description */}
        <h3 className="font-heading text-xl lg:text-2xl font-bold text-text-primary mb-3">
          {feature.title}
        </h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          {feature.description}
        </p>

        {/* Expand/Collapse Indicator */}
        <div className="flex items-center gap-2 text-primary-600 font-medium">
          <span className="text-sm">
            {isExpanded ? "Sembunyikan detail" : "Lihat detail"}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-border-default animate-slideUp">
            <ul className="space-y-3">
              {feature.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-text-secondary text-sm leading-relaxed">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}
        />
      </div>
    </div>
  );
}

/**
 * Feature Section
 */
export default function FeatureSection() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section id="features" ref={ref} className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola keuangan dengan lebih
            cerdas dan efisien
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
