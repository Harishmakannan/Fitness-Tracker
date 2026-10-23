import React from 'react';
import { LetterGrade } from '../types';

interface LetterGradeBadgeProps {
  grade: LetterGrade;
  label: string;
  scorePercent: number;
  goalsMetCount: number;
  totalGoalsTracked: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LetterGradeBadge: React.FC<LetterGradeBadgeProps> = ({
  grade,
  label,
  scorePercent,
  goalsMetCount,
  totalGoalsTracked,
  size = 'lg',
}) => {
  // Color & border tokens based on grade with high contrast
  const gradeStyles: Record<
    LetterGrade,
    { badgeBg: string; textColor: string; borderColor: string; ringColor: string }
  > = {
    A: {
      badgeBg: 'bg-emerald-950/70',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/60',
      ringColor: '#10b981',
    },
    B: {
      badgeBg: 'bg-sky-950/70',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-500/60',
      ringColor: '#0ea5e9',
    },
    C: {
      badgeBg: 'bg-amber-950/70',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/60',
      ringColor: '#f59e0b',
    },
    D: {
      badgeBg: 'bg-rose-950/70',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/60',
      ringColor: '#f43f5e',
    },
    'N/A': {
      badgeBg: 'bg-slate-900',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-700',
      ringColor: '#64748b',
    },
  };

  const style = gradeStyles[grade];

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg border ${style.borderColor} ${style.badgeBg} flex items-center justify-center font-black ${style.textColor} text-xs`}
        >
          {grade}
        </div>
        <div className="text-xs">
          <span className="font-semibold text-slate-200">{label}</span>
          {grade !== 'N/A' && (
            <span className="text-slate-400 ml-1.5 tabular-nums">({scorePercent}%)</span>
          )}
        </div>
      </div>
    );
  }

  // Circular progress math
  const strokeWidth = 8;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: style.ringColor }}
      />

      {/* Circular Progress Gauge with Centered Letter Badge */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Track background */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated active stroke */}
          {grade !== 'N/A' && (
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={style.ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Badge Core */}
        <div
          className={`absolute inset-4 rounded-full border-2 ${style.borderColor} ${style.badgeBg} flex flex-col items-center justify-center shadow-inner`}
        >
          <span className={`text-4xl font-black ${style.textColor} tracking-tight leading-none`}>
            {grade}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            Grade
          </span>
        </div>
      </div>

      {/* Summary Narrative & Rules */}
      <div className="flex-1 text-center sm:text-left space-y-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{label}</span>
          {grade !== 'N/A' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 tabular-nums">
              {scorePercent}% Routine Completion
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {grade === 'A' &&
            'Outstanding adherence! You have accomplished the substantial majority of your personalized daily wellness routines.'}
          {grade === 'B' &&
            'Strong consistent momentum. Most target goals are recorded and met with only a few remaining.'}
          {grade === 'C' &&
            'Fair wellness completion. Several core health checkpoints remain pending for today.'}
          {grade === 'D' &&
            'Low completion today. Dedicate a moment to review and log your basic daily habits.'}
          {grade === 'N/A' &&
            'Insufficient data recorded yet to compute a meaningful completion score. Record your water, sleep, or daily habits to generate today’s grade.'}
        </p>

        {/* Transparent Goals Met breakdown */}
        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 font-medium">Routine Target:</span>
            <strong className="text-white font-bold tabular-nums">
              {goalsMetCount} of {totalGoalsTracked} items
            </strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 font-medium">Evaluation standard:</span>
            <span className="text-slate-400 font-medium">Self-configured habits</span>
          </div>
        </div>
      </div>
    </div>
  );
};
