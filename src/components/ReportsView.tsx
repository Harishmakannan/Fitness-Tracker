import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Droplets,
  Moon,
  Heart,
  CheckCircle2,
  Download,
  Calendar,
  Filter,
  Activity,
} from 'lucide-react';
import {
  DailyCheckup,
  DailyWellnessHabit,
  HabitCompletion,
  HealthMeasurement,
  HydrationEntry,
  HydrationGoal,
} from '../types';
import { getPastDates, storage } from '../services/storage';

interface ReportsViewProps {
  hydrationEntries: HydrationEntry[];
  hydrationGoal: HydrationGoal;
  measurements: HealthMeasurement[];
  habits: DailyWellnessHabit[];
  habitCompletions: HabitCompletion[];
  checkups: DailyCheckup[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  hydrationEntries,
  hydrationGoal,
  measurements,
  habits,
  habitCompletions,
  checkups,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const daysCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
  const dates = getPastDates(daysCount);

  // Aggregate Hydration
  let totalHydrationMl = 0;
  let daysGoalHit = 0;
  const hydrationPerDay: { date: string; amountMl: number; hit: boolean }[] = [];

  dates.forEach((d) => {
    const dayTotal = hydrationEntries
      .filter((e) => e.date === d)
      .reduce((sum, e) => sum + e.amountMl, 0);
    totalHydrationMl += dayTotal;
    const hit = dayTotal >= hydrationGoal.dailyGoalMl;
    if (hit) daysGoalHit++;
    hydrationPerDay.push({ date: d, amountMl: dayTotal, hit });
  });

  const avgHydrationMl = Math.round(totalHydrationMl / daysCount);
  const hydrationGoalHitRate = Math.round((daysGoalHit / daysCount) * 100);

  // Aggregate Sleep
  const sleepMeasurements = measurements.filter(
    (m) => m.type === 'sleep_duration' && m.status === 'recorded' && dates.includes(m.date)
  );
  const avgSleep =
    sleepMeasurements.length > 0
      ? (
          sleepMeasurements.reduce((sum, m) => sum + (m.valueNumber || 0), 0) /
          sleepMeasurements.length
        ).toFixed(1)
      : '0.0';

  // Aggregate Heart Rate
  const hrMeasurements = measurements.filter(
    (m) => m.type === 'resting_heart_rate' && m.status === 'recorded' && dates.includes(m.date)
  );
  const avgHr =
    hrMeasurements.length > 0
      ? Math.round(
          hrMeasurements.reduce((sum, m) => sum + (m.valueNumber || 0), 0) /
            hrMeasurements.length
        )
      : null;

  // Aggregate Habits
  const activeHabits = habits.filter((h) => h.active);
  const habitCompletionsInRange = habitCompletions.filter(
    (c) => c.completed && dates.includes(c.date)
  );
  const totalHabitOpportunities = activeHabits.length * daysCount;
  const habitAdherenceRate =
    totalHabitOpportunities > 0
      ? Math.round((habitCompletionsInRange.length / totalHabitOpportunities) * 100)
      : 0;

  // Export Data Handler
  const handleExportData = () => {
    const exportBundle = {
      user: storage.getCurrentUser(),
      timeframe,
      generatedAt: new Date().toISOString(),
      hydrationGoal,
      summaryStats: {
        totalHydrationMl,
        avgHydrationMl,
        hydrationGoalHitRate: `${hydrationGoalHitRate}%`,
        avgSleepHours: avgSleep,
        avgRestingPulse: avgHr,
        habitAdherenceRate: `${habitAdherenceRate}%`,
      },
      hydrationEntries: hydrationEntries.filter((e) => dates.includes(e.date)),
      measurements: measurements.filter((m) => dates.includes(m.date)),
      checkups: checkups.filter((c) => dates.includes(c.date)),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fittrack_health_report_${timeframe}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            FitTrack Analytics & Records
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Health & Wellness Reports
          </h1>
          <p className="text-xs text-slate-400">
            Multi-day trends across hydration consistency, sleep restorative windows, and habits
          </p>
        </div>

        {/* Timeframe selector & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            {(['7d', '14d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  timeframe === tf
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === '7d' ? 'Past 7 Days' : tf === '14d' ? 'Past 14 Days' : 'Monthly (30d)'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Avg Daily Water</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {avgHydrationMl.toLocaleString()} mL
          </div>
          <div className="text-[11px] text-sky-400 font-medium mt-1">
            Goal hit in {daysGoalHit} of {daysCount} days ({hydrationGoalHitRate}%)
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Average Sleep</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">{avgSleep} hrs</div>
          <div className="text-[11px] text-indigo-400 font-medium mt-1">
            {sleepMeasurements.length} sleep logs recorded
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Resting Heart Rate</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {avgHr ? `${avgHr} BPM` : '—'}
          </div>
          <div className="text-[11px] text-rose-400 font-medium mt-1">
            Within healthy resting adult band
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Habit Adherence</span>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {habitAdherenceRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {habitCompletionsInRange.length} checks logged
          </div>
        </div>
      </div>

      {/* Hydration History Breakdown Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2">Hydration History & Goal Adherence</h3>
        <p className="text-xs text-slate-400 mb-4">
          Breakdown of logged fluid volume versus the target goal ({hydrationGoal.dailyGoalMl} mL)
        </p>

        <div className="space-y-2">
          {hydrationPerDay.map((item) => {
            const dObj = new Date(item.date + 'T00:00:00');
            const dayFormatted = dObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const percent = Math.min(100, Math.round((item.amountMl / hydrationGoal.dailyGoalMl) * 100));

            return (
              <div
                key={item.date}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold text-white">{dayFormatted}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.date}</div>
                </div>

                <div className="flex-1 max-w-md hidden sm:block">
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.hit ? 'bg-emerald-400' : 'bg-sky-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="text-xs font-bold text-white tabular-nums">
                    {item.amountMl.toLocaleString()} mL
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.hit
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.hit ? 'Goal Met' : `${percent}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
