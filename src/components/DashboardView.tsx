import React from 'react';
import {
  Activity,
  Flame,
  Footprints,
  Heart,
  Moon,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  DailyCheckup,
  DailyWellnessHabit,
  HabitCompletion,
  HealthMeasurement,
  HydrationEntry,
  HydrationGoal,
  UserProfile,
} from '../types';
import { WaterTrackerCard } from './WaterTrackerCard';
import { calculateDailyGrade } from '../utils/gradeCalculator';
import { formatDateRelative, getTodayDateString, storage } from '../services/storage';

interface DashboardViewProps {
  user: UserProfile;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  hydrationEntries: HydrationEntry[];
  hydrationGoal: HydrationGoal;
  measurements: HealthMeasurement[];
  habits: DailyWellnessHabit[];
  habitCompletions: HabitCompletion[];
  checkups: DailyCheckup[];
  onEntriesChange: () => void;
  onGoalChange: (newGoal: HydrationGoal) => void;
  onNavigateToCheckup: () => void;
  onNavigateToWater: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  selectedDate,
  onSelectDate,
  hydrationEntries,
  hydrationGoal,
  measurements,
  habits,
  habitCompletions,
  checkups,
  onEntriesChange,
  onGoalChange,
  onNavigateToCheckup,
  onNavigateToWater,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Grade calculation for summary card
  const checkup = checkups.find((c) => c.date === selectedDate);
  const grade = calculateDailyGrade({
    date: selectedDate,
    userId: user.id,
    hydrationEntries,
    hydrationGoal,
    measurements,
    habits,
    habitCompletions,
    checkup,
  });

  // Today's Core metrics
  const sleepMeas = measurements.find((m) => m.date === selectedDate && m.type === 'sleep_duration');
  const hrMeas = measurements.find((m) => m.date === selectedDate && m.type === 'resting_heart_rate');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            FitTrack Dashboard
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-400">
            {isToday ? "Here is your live health and wellness summary for today" : `Reviewing activity for ${formatDateRelative(selectedDate)}`}
          </p>
        </div>

        {/* Daily Grade Quick Snapshot */}
        <div
          onClick={onNavigateToCheckup}
          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center gap-3.5 group select-none self-start sm:self-auto"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-inner ${
              grade.letterGrade === 'A'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : grade.letterGrade === 'B'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : grade.letterGrade === 'C'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : grade.letterGrade === 'D'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {grade.letterGrade}
          </div>

          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
              Daily Wellness Grade: {grade.gradeLabel}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-[11px] text-slate-400">
              {grade.scorePercent}% routine completion · {grade.goalsMetCount} items met
            </div>
          </div>
        </div>
      </div>

      {/* Core Activity KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Active Calories
            </span>
            <span className="text-amber-400 font-bold tabular-nums">83%</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">540 kcal</div>
          <div className="text-[11px] text-slate-400 mt-1">Goal: 650 kcal</div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              Steps Walked
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">84%</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">8,420</div>
          <div className="text-[11px] text-slate-400 mt-1">Target: 10,000 steps</div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Resting Pulse
            </span>
            <span className="text-rose-400 font-bold">Optimal</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {hrMeas?.valueNumber ? `${hrMeas.valueNumber} BPM` : '62 BPM'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Adult resting band</div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Sleep Rest
            </span>
            <span className="text-indigo-400 font-bold">Good</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {sleepMeas?.valueNumber ? `${sleepMeas.valueNumber} hrs` : '7.6 hrs'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Restorative baseline met</div>
        </div>
      </div>

      {/* Primary Section: Daily Water Intake Tracker on Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hydration Monitoring
            </h2>
          </div>
          <button
            onClick={onNavigateToWater}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline"
          >
            Detailed Hydration View →
          </button>
        </div>

        <WaterTrackerCard
          entries={hydrationEntries}
          goal={hydrationGoal}
          selectedDate={selectedDate}
          onEntriesChange={onEntriesChange}
          onGoalChange={onGoalChange}
        />
      </div>

      {/* Daily Health Checkup Promo Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Health Checkup</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Record vitals (blood pressure, pulse, SpO₂, body temperature, weight), track wellness habits, and view your calculated Letter-Grade completion score.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToCheckup}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
        >
          Open Health Checkup
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
