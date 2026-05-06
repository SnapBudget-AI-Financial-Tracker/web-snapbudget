import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import IPhoneMockup from "./IPhoneMockup";

export default function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-bg-base via-primary-50 to-bg-base"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div
            className={`space-y-8 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-text-primary">Kelola Keuangan</span>
                <span className="block text-text-primary">Lebih Cerdas</span>
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-xl">
                Cukup foto struk belanja, AI SnapBudget akan otomatis mencatat,
                mengkategorikan, dan menganalisis pengeluaran Anda tanpa perlu
                input manual yang merepotkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-success-600 text-success-600 font-semibold rounded-full hover:bg-success-50 transition-all text-lg"
              >
                Daftar Gratis
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-full hover:bg-primary-50 transition-all text-lg"
              >
                Sudah Punya Akun
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="text-sm text-text-primary font-medium">
                  Gratis selamanya
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="text-sm text-text-primary font-medium">
                  Tanpa kartu kredit
                </span>
              </div>
            </div>
          </div>

          {/* Right: iPhone Mockup */}
          <div
            className={`relative h-80 sm:h-96 lg:h-[500px] transition-all duration-700 delay-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <IPhoneMockup />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-600 rounded-full" />
        </div>
      </div>
    </section>
  );
}
