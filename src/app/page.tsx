import Link from "next/link";
import Image from "next/image";
import { textsTR } from "@/lib/texts.tr";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
        {/* Combined Logo and Mascot */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Combined Logo and Mascot Image */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl shadow-white/10 flex items-center justify-center backdrop-blur-sm">
                <Image
                  src="/logo-mascot.png"
                  alt={textsTR.a11y.appLogoAlt}
                  width={320}
                  height={320}
                  priority
                  className="w-full h-full object-contain p-4 sm:p-6"
                />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl opacity-50 -z-10" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              {textsTR.home.title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-300 tracking-wide">
              {textsTR.home.mainSlogan}
            </p>
            <p className="text-sm sm:text-base text-zinc-500 mt-1 sm:mt-2 font-medium">
              {textsTR.home.mainSloganEn}
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="w-full max-w-4xl">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl p-8 sm:p-12 lg:p-16 shadow-2xl">
            {/* Description */}
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <div className="space-y-4 sm:space-y-5 text-base sm:text-lg lg:text-xl text-zinc-300 leading-relaxed">
                {textsTR.home.description.split('\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "font-semibold text-white" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link
                href="/login"
                className="group w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center rounded-2xl bg-white text-black px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold hover:bg-zinc-200 active:scale-95 transition-all duration-200 shadow-lg shadow-white/20 hover:shadow-white/30"
              >
                <span>{textsTR.home.primaryCta}</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="group w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center rounded-2xl border-2 border-white/20 bg-white/5 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all duration-200"
              >
                {textsTR.home.secondaryCta}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer decoration */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <p className="text-sm sm:text-base text-zinc-600 font-medium">
            5N 1Dedektif
          </p>
        </div>
      </main>
    </div>
  );
}
