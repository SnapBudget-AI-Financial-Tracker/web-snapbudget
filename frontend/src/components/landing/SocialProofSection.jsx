import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import useReducedMotion from "../../hooks/useReducedMotion";

function useCountUpAnimation(
  targetValue,
  duration = 2000,
  startAnimation = false
) {
  const reducedMotion = useReducedMotion();
  const [currentValue, setCurrentValue] = useState(
    !startAnimation || reducedMotion ? targetValue : 0
  );
  const animationRef = useRef(null);

  useEffect(() => {
    if (!startAnimation || reducedMotion) {
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const value = easedProgress * targetValue;

      setCurrentValue(Math.floor(value));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, startAnimation, reducedMotion]);

  return currentValue;
}

function StatCard({
  value,
  label,
  prefix = "",
  suffix = "",
  isVisible,
  delay = 0,
}) {
  const animatedValue = useCountUpAnimation(value, 2000, isVisible);

  return (
    <div
      className={`text-center transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 mb-2">
        {prefix}
        {animatedValue.toLocaleString("id-ID")}
        {suffix}
      </div>
      <div className="text-text-primary text-lg font-medium">{label}</div>
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={testimonial.avatar}
          alt={`Foto ${testimonial.name}`}
          className="w-12 h-12 rounded-full object-cover bg-gradient-to-br from-primary-100 to-primary-200"
        />
        <div>
          <h4 className="font-semibold text-text-primary">
            {testimonial.name}
          </h4>
          <p className="text-sm text-text-muted">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-text-secondary leading-relaxed">
        {testimonial.content}
      </p>
      <div className="mt-4 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < testimonial.rating ? "text-accent-500" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

const testimonials = [
  {
    id: 1,
    name: "Sarah Amelia",
    role: "Freelance Designer",
    avatar: "",
    content:
      "SnapBudget membantu saya menghemat 30% pengeluaran bulanan. Fitur scan struknya luar biasa akurat!",
    rating: 5,
  },
  {
    id: 2,
    name: "Budi Santoso",
    role: "Software Engineer",
    avatar: "",
    content:
      "Analitik keuangannya sangat membantu saya memahami pola pengeluaran. Sekarang saya bisa budgeting lebih baik.",
    rating: 5,
  },
  {
    id: 3,
    name: "Diana Putri",
    role: "Marketing Manager",
    avatar: "",
    content:
      "Chatbot AI-nya seperti punya asisten keuangan pribadi. Sangat responsif dan sarannya praktis!",
    rating: 5,
  },
  {
    id: 4,
    name: "Andi Pratama",
    role: "Mahasiswa",
    avatar: "",
    content:
      "Sebagai mahasiswa, SnapBudget membantu saya mengatur uang saku dengan lebih bijak. Recommended!",
    rating: 4,
  },
  {
    id: 5,
    name: "Maya Sari",
    role: "Business Owner",
    avatar: "",
    content:
      "Fitur tujuan tabungan memotivasi saya untuk konsisten menabung. UI-nya juga sangat intuitif.",
    rating: 5,
  },
];

const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=14b8a6&color=fff&size=128`;
};

export default function SocialProofSection() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: true,
  });

  const carouselRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused || reducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, reducedMotion]);

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = 384;
      const gap = 24;
      carouselRef.current.scrollTo({
        left: currentIndex * (cardWidth + gap),
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-20 md:py-32 bg-gradient-to-br from-primary-50 to-bg-base"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="mb-20">
          <h2
            className={`font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary text-center mb-12 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Dipercaya Ribuan Pengguna
          </h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <StatCard
              value={15000}
              label="Pengguna Aktif"
              suffix="+"
              isVisible={isVisible}
              delay={0}
            />
            <StatCard
              value={500000}
              label="Transaksi Tercatat"
              suffix="+"
              isVisible={isVisible}
              delay={200}
            />
            <StatCard
              value={4.8}
              label="Rating Rata-rata"
              suffix="/5"
              isVisible={isVisible}
              delay={400}
            />
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
              Apa Kata Mereka
            </h3>
            <div className="flex items-center gap-2">
              {/* Pause/Play Button (Requirement 8.7) */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                aria-label={
                  isPaused ? "Lanjutkan carousel" : "Hentikan carousel"
                }
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                aria-label="Testimoni sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                aria-label="Testimoni selanjutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={{
                  ...testimonial,
                  avatar: getAvatarUrl(testimonial.name),
                }}
              />
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary-600 w-6"
                    : "bg-primary-300 hover:bg-primary-400"
                }`}
                aria-label={`Lihat testimoni ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
