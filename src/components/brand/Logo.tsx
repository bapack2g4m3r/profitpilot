'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function ProfitPilotLogo({ size = 36, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Brand Icon Badge */}
      <div
        className="relative flex items-center justify-center rounded-2xl shrink-0 overflow-hidden shadow-lg shadow-blue-500/20"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Aerodynamic Pilot Wing + Ascending Growth Chart SVG */}
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white drop-shadow-md"
        >
          {/* Flight Wing Path */}
          <path
            d="M2.5 19L11 4.5L14.5 10.5L21.5 3"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow Head */}
          <path
            d="M16.5 3H21.5V8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pilot Wing Accent */}
          <path
            d="M4 14.5L8.5 12L12 17"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="min-w-0">
          <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
            Profit<span className="text-blue-400">Pilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-1">
            Shopee Affiliate × Meta
          </p>
        </div>
      )}
    </div>
  );
}
