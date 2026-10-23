import React from 'react';
import { Sparkles, Droplets } from 'lucide-react';

interface WaterBottleVisualProps {
  consumedMl: number;
  goalMl: number;
  percentage: number;
  interactive?: boolean;
  onBottleClick?: () => void;
}

export const WaterBottleVisual: React.FC<WaterBottleVisualProps> = ({
  consumedMl,
  goalMl,
  percentage,
  interactive = false,
  onBottleClick,
}) => {
  // Clamp fill percentage between 0 and 100 for SVG geometry
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const remainingMl = Math.max(0, goalMl - consumedMl);
  const isGoalAchieved = consumedMl >= goalMl;

  // The water body interior height is 240px (from y=50 to y=290)
  const bodyHeight = 240;
  const fillHeight = (clampedPercentage / 100) * bodyHeight;
  const liquidTopY = 290 - fillHeight;

  return (
    <div
      onClick={interactive ? onBottleClick : undefined}
      className={`relative flex flex-col items-center justify-center p-4 transition-transform select-none ${
        interactive ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]' : ''
      }`}
    >
      {/* SVG Water Bottle Graphic */}
      <div className="relative w-44 h-80 sm:w-52 sm:h-96">
        <svg
          viewBox="0 0 200 360"
          className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(2,132,199,0.25)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bottleGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <linearGradient id="liquidDeepGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
            </linearGradient>

            {/* Clipping path for liquid strictly inside bottle walls */}
            <clipPath id="bottleInnerClip">
              <path
                d="M 68 55
                   C 68 62, 50 75, 42 95
                   C 36 110, 36 120, 36 140
                   L 36 280
                   C 36 305, 52 320, 80 320
                   L 120 320
                   C 148 320, 164 305, 164 280
                   L 164 140
                   C 164 120, 164 110, 158 95
                   C 150 75, 132 62, 132 55
                   Z"
              />
            </clipPath>
          </defs>

          {/* Bottle Cap & Spout */}
          <rect x="80" y="8" width="40" height="14" rx="4" fill="url(#capGradient)" stroke="#64748b" strokeWidth="1.5" />
          <rect x="72" y="22" width="56" height="16" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <line x1="76" y1="26" x2="124" y2="26" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="76" y1="32" x2="124" y2="32" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
          {/* Loop handle */}
          <path
            d="M 124 16 C 145 16, 148 34, 128 34"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Bottle Neck Ring */}
          <rect x="66" y="38" width="68" height="15" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* Bottle Outer Body Silhouette */}
          <path
            d="M 68 53
               C 68 62, 48 76, 40 98
               C 34 114, 34 125, 34 140
               L 34 282
               C 34 310, 50 324, 80 324
               L 120 324
               C 150 324, 166 310, 166 282
               L 166 140
               C 166 125, 166 114, 160 98
               C 152 76, 132 62, 132 53
               Z"
            fill="url(#bottleGlass)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="2.5"
          />

          {/* Water Liquid Fill (Inside clip) */}
          <g clipPath="url(#bottleInnerClip)">
            {clampedPercentage > 0 && (
              <>
                {/* Background base liquid */}
                <rect
                  x="20"
                  y={liquidTopY}
                  width="160"
                  height={fillHeight + 40}
                  fill="url(#liquidDeepGradient)"
                />

                {/* Animated Primary Wave */}
                <path
                  d={`M 10 ${liquidTopY}
                      Q 55 ${liquidTopY - 6}, 100 ${liquidTopY}
                      T 190 ${liquidTopY}
                      L 190 330
                      L 10 330
                      Z`}
                  fill="url(#liquidGradient)"
                  className="animate-wave-fast"
                />

                {/* Secondary Counter Wave */}
                <path
                  d={`M 10 ${liquidTopY + 2}
                      Q 60 ${liquidTopY + 6}, 110 ${liquidTopY + 2}
                      T 190 ${liquidTopY + 2}
                      L 190 330
                      L 10 330
                      Z`}
                  fill="#38bdf8"
                  opacity="0.5"
                  className="animate-wave-slow"
                />

                {/* Rising Bubbles */}
                <circle cx="70" cy={Math.min(300, liquidTopY + 70)} r="3" fill="#ffffff" opacity="0.6" className="bubble-1" />
                <circle cx="120" cy={Math.min(290, liquidTopY + 110)} r="2.5" fill="#ffffff" opacity="0.5" className="bubble-2" />
                <circle cx="95" cy={Math.min(310, liquidTopY + 40)} r="4" fill="#ffffff" opacity="0.4" className="bubble-3" />
              </>
            )}
          </g>

          {/* Volume Measurement Graduations */}
          <g stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2">
            {/* 2000 mL mark (near top y=80) */}
            <line x1="44" y1="80" x2="56" y2="80" />
            <text x="60" y="83" fill="#94a3b8" fontSize="8" fontFamily="sans-serif" fontWeight="600">
              {goalMl} mL
            </text>

            {/* 1500 mL mark (y=135) */}
            <line x1="44" y1="135" x2="52" y2="135" />
            <text x="56" y="138" fill="#64748b" fontSize="7.5" fontFamily="sans-serif">
              {Math.round(goalMl * 0.75)}
            </text>

            {/* 1000 mL mark (y=190) */}
            <line x1="44" y1="190" x2="56" y2="190" />
            <text x="60" y="193" fill="#94a3b8" fontSize="8" fontFamily="sans-serif" fontWeight="600">
              {Math.round(goalMl * 0.5)} mL
            </text>

            {/* 500 mL mark (y=245) */}
            <line x1="44" y1="245" x2="52" y2="245" />
            <text x="56" y="248" fill="#64748b" fontSize="7.5" fontFamily="sans-serif">
              {Math.round(goalMl * 0.25)}
            </text>

            {/* 0 mL baseline (y=300) */}
            <line x1="44" y1="300" x2="56" y2="300" stroke="rgba(255, 255, 255, 0.25)" />
          </g>

          {/* Glass Specular Reflection Streak */}
          <path
            d="M 44 110
               C 42 125, 42 150, 42 265
               C 42 280, 44 290, 48 300"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 52 115
               L 52 270"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Brand Mark on Bottle */}
          <text
            x="100"
            y="295"
            fill="rgba(255,255,255,0.25)"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="2"
            textAnchor="middle"
          >
            FITTRACK·HYDRA
          </text>
        </svg>

        {/* Floating Percentage Indicator on Bottle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-center shadow-lg shadow-cyan-950/40">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {percentage}%
            </span>
            <div className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">
              {isGoalAchieved ? 'Goal Reached' : 'Hydration'}
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Intake Breakdown */}
      <div className="mt-3 text-center">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {consumedMl.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ {goalMl.toLocaleString()} mL</span>
          <span className="text-xs text-sky-400 font-medium ml-1">
            ({(consumedMl / 1000).toFixed(2)} L)
          </span>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 text-xs">
          {isGoalAchieved ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Daily goal achieved! +{consumedMl - goalMl} mL surplus
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              {remainingMl.toLocaleString()} mL remaining to reach target
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
