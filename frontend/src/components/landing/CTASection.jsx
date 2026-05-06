import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section
      id="cta"
      ref={ref}
      className="py-20 md:py-32 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Siap Mengelola Keuangan
            <span className="block mt-2">Dengan Lebih Baik?</span>
          </h2>
          <p className="text-lg sm:text-xl text-white mb-10 max-w-2xl mx-auto font-medium">
            Bergabung dengan ribuan pengguna yang telah mencapai tujuan
            finansial mereka bersama SnapBudget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary-600 font-bold rounded-full hover:shadow-2xl transition-all hover:scale-105 text-lg"
            >
              Mulai Gratis Sekarang
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
          <p className="mt-6 text-sm text-white font-medium">
            Tidak perlu kartu kredit · Gratis selamanya · Batal kapan saja
          </p>
        </div>
      </div>
    </section>
  );
}
