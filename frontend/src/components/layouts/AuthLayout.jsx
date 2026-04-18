import useReducedMotion from "../../hooks/useReducedMotion";

export default function AuthLayout({
  children,
  title,
  subtitle,
  brandingTitle,
  brandingSubtitle,
  reverse = false,
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4 sm:p-8">
      <div
        className={`w-full max-w-[1040px] bg-white subtle-shadow rounded-[24px] flex ${
          reverse ? "flex-row-reverse" : "flex-row"
        } overflow-hidden relative border border-zinc-100/80`}
      >
        {/* Branding Side */}
        <div className="hidden lg:flex lg:w-1/2 p-14 flex-col justify-between relative overflow-hidden text-zinc-50">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #134e4a, #0d9488, #0f766e, #f97316, #134e4a)",
              backgroundSize: "300% 300%",
              animation: reducedMotion ? "none" : "gradientShift 10s ease infinite",
            }}
          />

          {/* Decorative blobs */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #2dd4bf, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #14b8a6, transparent 70%)" }}
          />

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-lg leading-none text-white">S</span>
              </div>
              <span className="text-xl font-medium tracking-tight">SnapBudget</span>
            </div>

            <h1
              className="text-[2.5rem] font-medium mb-6 leading-[1.1] tracking-tight"
              dangerouslySetInnerHTML={{ __html: brandingTitle }}
            />
            <p className="text-zinc-300 text-lg leading-relaxed max-w-md font-light">
              {brandingSubtitle}
            </p>
          </div>

          <div className="relative z-10 text-sm text-zinc-400 font-light tracking-wide">
            &copy; {new Date().getFullYear()} SnapBudget AI. All rights reserved.
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-14 lg:p-16 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-[380px] w-full mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2
                className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-2 tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h2>
              <p className="text-zinc-500 text-sm sm:text-base">{subtitle}</p>
            </div>
            {/* Staggered children wrapper */}
            <div className="auth-form-fields">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
