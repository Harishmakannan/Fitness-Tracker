import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Calendar,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Flame,
  Sun,
  Scale,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HydrationEntry, HydrationGoal } from '../types';
import { WaterBottleVisual } from './WaterBottleVisual';
import { formatDateRelative, getPastDates, getTodayDateString, storage } from '../services/storage';

interface WaterTrackerDetailViewProps {
  entries: HydrationEntry[];
  goal: HydrationGoal;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onEntriesChange: () => void;
  onGoalChange: (newGoal: HydrationGoal) => void;
}

export const WaterTrackerDetailView: React.FC<WaterTrackerDetailViewProps> = ({
  entries,
  goal,
  selectedDate,
  onSelectDate,
  onEntriesChange,
  onGoalChange,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Selected date entries
  const dayEntries = entries.filter((e) => e.date === selectedDate);
  const totalConsumedMl = dayEntries.reduce((sum, e) => sum + e.amountMl, 0);
  const percentage = Math.round((totalConsumedMl / (goal.dailyGoalMl || 2000)) * 100);
  const remainingMl = Math.max(0, goal.dailyGoalMl - totalConsumedMl);

  // States
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('350');
  const [customNote, setCustomNote] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [editingGoalAmount, setEditingGoalAmount] = useState(goal.dailyGoalMl.toString());
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<string | null>(null);

  // Personalization calculator states
  const [calcWeightKg, setCalcWeightKg] = useState('72');
  const [calcActivityLevel, setCalcActivityLevel] = useState<'sedentary' | 'moderate' | 'intense'>('moderate');
  const [calcClimate, setCalcClimate] = useState<'temperate' | 'hot_dry'>('temperate');

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#0ea5e9', '#22c55e', '#60a5fa'],
      });
    } catch {
      // ignore
    }
  };

  const handleQuickAdd = (amount: number, container: HydrationEntry['containerType']) => {
    const prev = totalConsumedMl;
    const entry = storage.addHydrationEntry(amount, container, undefined, selectedDate);
    setLastAddedId(entry.id);
    setUndoToast(`Added ${amount} mL`);
    onEntriesChange();

    if (prev < goal.dailyGoalMl && prev + amount >= goal.dailyGoalMl) {
      triggerCelebration();
    }

    setTimeout(() => setUndoToast(null), 4000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > 3000) return;

    const prev = totalConsumedMl;
    const entry = storage.addHydrationEntry(
      amount,
      'custom',
      customNote.trim() ? customNote.trim() : undefined,
      selectedDate
    );
    setLastAddedId(entry.id);
    setUndoToast(`Added ${amount} mL`);
    setShowCustomModal(false);
    setCustomNote('');
    onEntriesChange();

    if (prev < goal.dailyGoalMl && prev + amount >= goal.dailyGoalMl) {
      triggerCelebration();
    }

    setTimeout(() => setUndoToast(null), 4000);
  };

  const handleUndo = () => {
    if (!lastAddedId) return;
    storage.deleteHydrationEntry(lastAddedId);
    setLastAddedId(null);
    setUndoToast('Entry undone');
    onEntriesChange();
    setTimeout(() => setUndoToast(null), 2500);
  };

  const handleDeleteEntry = (id: string) => {
    storage.deleteHydrationEntry(id);
    if (lastAddedId === id) setLastAddedId(null);
    onEntriesChange();
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseInt(editingGoalAmount, 10);
    if (isNaN(newTarget) || newTarget < 500 || newTarget > 6000) return;

    const updated = storage.setHydrationGoal({ dailyGoalMl: newTarget });
    onGoalChange(updated);
    setShowGoalModal(false);
  };

  // Compute calculated personalized target
  const calculatePersonalizedGoal = () => {
    const wt = parseFloat(calcWeightKg) || 70;
    // Standard formula: ~35 mL per kg bodyweight
    let base = wt * 35;
    if (calcActivityLevel === 'moderate') base += 500;
    if (calcActivityLevel === 'intense') base += 1000;
    if (calcClimate === 'hot_dry') base += 400;
    return Math.round(base / 50) * 50;
  };

  // Past 7 days hydration trend data
  const past7Dates = getPastDates(7);
  const weeklyTrendData = past7Dates.map((d) => {
    const dayLogs = entries.filter((e) => e.date === d);
    const dayTotal = dayLogs.reduce((sum, e) => sum + e.amountMl, 0);
    const dayGoal = goal.dailyGoalMl || 2000;
    const dayPercent = Math.min(125, Math.round((dayTotal / dayGoal) * 100));
    return {
      date: d,
      total: dayTotal,
      goal: dayGoal,
      percent: dayPercent,
      isGoalMet: dayTotal >= dayGoal,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" />
            FitTrack Hydration Engine
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Daily Water Intake Tracker
          </h1>
          <p className="text-xs text-slate-400">
            Real-time liquid tracking, goal visualization, and multi-device hydration history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPersonalizationModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Personalize Target
          </button>

          <button
            onClick={() => {
              setEditingGoalAmount(goal.dailyGoalMl.toString());
              setShowGoalModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-bold text-sky-300 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Goal: {goal.dailyGoalMl.toLocaleString()} mL
          </button>
        </div>
      </div>

      {/* Main Hydration Display Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Water Bottle Visual with wave animation */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          <div className="text-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {formatDateRelative(selectedDate)}
            </span>
          </div>

          <WaterBottleVisual
            consumedMl={totalConsumedMl}
            goalMl={goal.dailyGoalMl}
            percentage={percentage}
          />

          <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Consumed</div>
              <div className="font-bold text-white tabular-nums">{totalConsumedMl} mL</div>
              <div className="text-[10px] text-sky-400">{(totalConsumedMl / 1000).toFixed(2)} L</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Daily Target</div>
              <div className="font-bold text-white tabular-nums">{goal.dailyGoalMl} mL</div>
              <div className="text-[10px] text-slate-400">{(goal.dailyGoalMl / 1000).toFixed(1)} L</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Remaining</div>
              <div className="font-bold text-emerald-400 tabular-nums">
                {remainingMl > 0 ? `${remainingMl} mL` : 'Goal Met!'}
              </div>
              <div className="text-[10px] text-slate-400">
                {remainingMl > 0 ? `${(remainingMl / 1000).toFixed(2)} L` : '100%+'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Logging Controls and Today's History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Quick Water Log</h3>
                <p className="text-xs text-slate-400">Tap to record hydration directly into your daily log</p>
              </div>

              {undoToast && (
                <span className="text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-3 py-1 rounded-full animate-pulse">
                  {undoToast}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickAdd(150, 'small_glass')}
                className="h-20 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Small Cup</div>
                <div className="text-lg font-black text-white group-hover:text-sky-200 tabular-nums">
                  +150 mL
                </div>
              </button>

              <button
                onClick={() => handleQuickAdd(250, 'glass')}
                className="h-20 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Glass</div>
                <div className="text-lg font-black text-white group-hover:text-sky-200 tabular-nums">
                  +250 mL
                </div>
              </button>

              <button
                onClick={() => handleQuickAdd(500, 'bottle')}
                className="h-20 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Sports Bottle</div>
                <div className="text-lg font-black text-white group-hover:text-sky-200 tabular-nums">
                  +500 mL
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                Custom Volume Entry
              </button>

              {lastAddedId && (
                <button
                  onClick={handleUndo}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Undo Last
                </button>
              )}
            </div>

            {/* Explanatory note on hydration variance */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-300">Individual Baseline: </strong>
                Hydration requirements are not identical for every individual. Needs fluctuate with training intensity, ambient temperature, elevation, and metabolic rate.
              </div>
            </div>
          </div>

          {/* Today's Intake History Table with Delete / Timestamps */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Intake Timeline ({dayEntries.length} entries)
                </h3>
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                Total: <strong className="text-white">{totalConsumedMl.toLocaleString()} mL</strong>
              </span>
            </div>

            {dayEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
                No hydration entries recorded for this date yet. Log an intake above to populate the timeline.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {dayEntries.map((entry) => {
                  const time = new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tabular-nums">
                              +{entry.amountMl} mL
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ({(entry.amountMl / 1000).toFixed(2)} L)
                            </span>
                            {entry.note && (
                              <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                                {entry.note}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{time}</span>
                            <span>·</span>
                            <span className="capitalize">{entry.containerType.replace('_', ' ')}</span>
                            <span>·</span>
                            <span className="text-slate-400">{entry.source}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Hydration Trends and Goal Completion */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Weekly Hydration Trends & Goals</h3>
              <p className="text-xs text-slate-400">
                Daily goal consistency across the past 7 days
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
              <span>Consumed mL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block border-t border-dashed" />
              <span>Target Benchmark ({goal.dailyGoalMl} mL)</span>
            </div>
          </div>
        </div>

        {/* 7-day Bar Chart */}
        <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6 pb-2 px-2 border-b border-slate-800 relative">
          {/* Target line at 100% */}
          <div className="absolute top-[35%] left-0 right-0 border-b border-dashed border-emerald-500/40 pointer-events-none flex items-center justify-end pr-2">
            <span className="text-[10px] text-emerald-400 font-mono bg-slate-900 px-1">
              Goal: {goal.dailyGoalMl} mL
            </span>
          </div>

          {weeklyTrendData.map((d) => {
            const isSelected = d.date === selectedDate;
            const dObj = new Date(d.date + 'T00:00:00');
            const dayLabel = dObj.toLocaleDateString(undefined, { weekday: 'short' });
            const heightPercent = Math.min(100, (d.total / (goal.dailyGoalMl * 1.35)) * 100);

            return (
              <div
                key={d.date}
                onClick={() => onSelectDate(d.date)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div className="text-[10px] text-slate-400 mb-1 font-mono tabular-nums group-hover:text-white">
                  {d.total > 0 ? `${(d.total / 1000).toFixed(1)}L` : '0L'}
                </div>

                <div className="w-full max-w-[42px] bg-slate-950 rounded-t-xl overflow-hidden relative h-full flex items-end p-0.5 border border-slate-800">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      d.isGoalMet
                        ? 'bg-gradient-to-t from-sky-600 to-emerald-400'
                        : 'bg-gradient-to-t from-sky-700 to-sky-400'
                    } ${isSelected ? 'ring-2 ring-white' : ''}`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                  />
                </div>

                <div className="mt-2 text-center">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                    {dayLabel}
                  </span>
                  <div className="flex justify-center mt-0.5">
                    {d.isGoalMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-400 tabular-nums">{d.percent}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Custom Amount Entry */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Custom Hydration Amount</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter exact amount consumed in milliliters (mL).
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount in mL
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="3000"
                    step="10"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-base font-semibold focus:outline-none focus:border-sky-500 tabular-nums"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                    mL
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Note or Drink Type (Optional)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g. Infused cucumber water, coconut water"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customize Daily Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Update Hydration Target</h3>
            <p className="text-xs text-slate-400 mb-4">
              Adjust your daily baseline goal for FitTrack.
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Daily Target (mL)
                </label>
                <input
                  type="number"
                  min="500"
                  max="6000"
                  step="100"
                  value={editingGoalAmount}
                  onChange={(e) => setEditingGoalAmount(e.target.value)}
                  required
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white text-base font-semibold focus:outline-none focus:border-sky-500 tabular-nums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hydration Personalization Calculator */}
      {showPersonalizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Personalized Hydration Calculator
              </h3>
              <button
                onClick={() => setShowPersonalizationModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hydration needs are unique to each person. We calibrate your baseline around body weight, activity output, and environmental heat.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  Body Weight (kg)
                </label>
                <input
                  type="number"
                  min="35"
                  max="200"
                  value={calcWeightKg}
                  onChange={(e) => setCalcWeightKg(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-sky-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Daily Activity / Training
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sedentary', label: 'Light', desc: '+0 mL' },
                    { id: 'moderate', label: 'Moderate', desc: '+500 mL' },
                    { id: 'intense', label: 'Intense', desc: '+1000 mL' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setCalcActivityLevel(act.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        calcActivityLevel === act.id
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{act.label}</div>
                      <div className="text-[10px] text-slate-400">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  Climate & Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'temperate', label: 'Temperate / AC' },
                    { id: 'hot_dry', label: 'Hot / Arid / Humid (+400 mL)' },
                  ].map((clim) => (
                    <button
                      key={clim.id}
                      type="button"
                      onClick={() => setCalcClimate(clim.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs transition-all ${
                        calcClimate === clim.id
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {clim.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Recommendation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Recommended Calibrated Target:</div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {calculatePersonalizedGoal().toLocaleString()} mL
              </div>
              <div className="text-xs text-sky-400">
                ({(calculatePersonalizedGoal() / 1000).toFixed(2)} Liters / Day)
              </div>
            </div>

            <button
              onClick={() => {
                const target = calculatePersonalizedGoal();
                const updated = storage.setHydrationGoal({ dailyGoalMl: target });
                onGoalChange(updated);
                setShowPersonalizationModal(false);
              }}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-colors"
            >
              Apply Recommended Target ({calculatePersonalizedGoal()} mL)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
