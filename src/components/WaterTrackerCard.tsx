import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HydrationEntry, HydrationGoal } from '../types';
import { WaterBottleVisual } from './WaterBottleVisual';
import { getTodayDateString, storage } from '../services/storage';

interface WaterTrackerCardProps {
  entries: HydrationEntry[];
  goal: HydrationGoal;
  selectedDate?: string;
  onEntriesChange: () => void;
  onGoalChange: (newGoal: HydrationGoal) => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  entries,
  goal,
  selectedDate,
  onEntriesChange,
  onGoalChange,
}) => {
  const activeDate = selectedDate || getTodayDateString();
  const isToday = activeDate === getTodayDateString();

  // Filter entries for the selected date
  const dayEntries = entries.filter((e) => e.date === activeDate);
  const totalConsumedMl = dayEntries.reduce((sum, e) => sum + e.amountMl, 0);
  const percentage = Math.round((totalConsumedMl / (goal.dailyGoalMl || 2000)) * 100);

  // States
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('300');
  const [customNote, setCustomNote] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalAmount, setEditingGoalAmount] = useState(goal.dailyGoalMl.toString());
  const [showHistory, setShowHistory] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<string | null>(null);

  // Trigger celebration
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#0ea5e9', '#22c55e', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  };

  // Quick Action Handler
  const handleQuickAdd = (amount: number, container: HydrationEntry['containerType']) => {
    const previousTotal = totalConsumedMl;
    const entry = storage.addHydrationEntry(amount, container, undefined, activeDate);
    setLastAddedId(entry.id);
    setUndoToast(`Added ${amount} mL`);
    onEntriesChange();

    if (previousTotal < goal.dailyGoalMl && previousTotal + amount >= goal.dailyGoalMl) {
      triggerCelebration();
    }

    setTimeout(() => {
      setUndoToast(null);
    }, 4500);
  };

  // Custom Add Handler
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > 3000) return;

    const previousTotal = totalConsumedMl;
    const entry = storage.addHydrationEntry(
      amount,
      'custom',
      customNote.trim() ? customNote.trim() : undefined,
      activeDate
    );
    setLastAddedId(entry.id);
    setUndoToast(`Added ${amount} mL`);
    setShowCustomModal(false);
    setCustomNote('');
    onEntriesChange();

    if (previousTotal < goal.dailyGoalMl && previousTotal + amount >= goal.dailyGoalMl) {
      triggerCelebration();
    }

    setTimeout(() => {
      setUndoToast(null);
    }, 4500);
  };

  // Undo Last Added Entry
  const handleUndo = () => {
    if (!lastAddedId) return;
    storage.deleteHydrationEntry(lastAddedId);
    setLastAddedId(null);
    setUndoToast('Entry undone');
    onEntriesChange();
    setTimeout(() => setUndoToast(null), 2500);
  };

  // Delete specific entry
  const handleDeleteEntry = (id: string) => {
    storage.deleteHydrationEntry(id);
    if (lastAddedId === id) setLastAddedId(null);
    onEntriesChange();
  };

  // Update Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseInt(editingGoalAmount, 10);
    if (isNaN(newTarget) || newTarget < 500 || newTarget > 6000) return;

    const updated = storage.setHydrationGoal({ dailyGoalMl: newTarget });
    onGoalChange(updated);
    setShowGoalModal(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative backdrop-blur-md">
      {/* Top Banner & Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              Daily Water Intake
              {totalConsumedMl >= goal.dailyGoalMl && (
                <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Met
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {isToday ? "Today's hydration tracking" : `Logged for ${activeDate}`}
            </p>
          </div>
        </div>

        {/* Goal Settings Trigger */}
        <button
          onClick={() => {
            setEditingGoalAmount(goal.dailyGoalMl.toString());
            setShowGoalModal(true);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          title="Customize hydration target"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Goal: {goal.dailyGoalMl.toLocaleString()} mL</span>
        </button>
      </div>

      {/* Main Visual & Interactive Section */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Visual Water Bottle */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <WaterBottleVisual
            consumedMl={totalConsumedMl}
            goalMl={goal.dailyGoalMl}
            percentage={percentage}
          />
        </div>

        {/* Right Column: Quick Add Actions & Progress Summary */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-5">
          {/* Progress Bar & Stats */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Hydration Completion</span>
              <span className="text-sky-400 font-bold tabular-nums">{percentage}%</span>
            </div>
            {/* Progress track */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>0 mL</span>
              <span>1,000 mL</span>
              <span>Goal: {goal.dailyGoalMl.toLocaleString()} mL</span>
            </div>
          </div>

          {/* Quick-Action Logging Buttons */}
          <div>
            <div className="text-xs font-medium text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Quick Log Amount:</span>
              {undoToast && (
                <span className="text-xs text-sky-300 font-medium animate-pulse">
                  {undoToast}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickAdd(150, 'small_glass')}
                className="h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-sky-500/50 flex flex-col items-center justify-center text-slate-200 transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Small Cup</div>
                <div className="text-sm font-bold text-white group-hover:text-sky-200 tabular-nums">
                  +150 mL
                </div>
              </button>

              <button
                onClick={() => handleQuickAdd(250, 'glass')}
                className="h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-sky-500/50 flex flex-col items-center justify-center text-slate-200 transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Glass</div>
                <div className="text-sm font-bold text-white group-hover:text-sky-200 tabular-nums">
                  +250 mL
                </div>
              </button>

              <button
                onClick={() => handleQuickAdd(500, 'bottle')}
                className="h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-sky-500/50 flex flex-col items-center justify-center text-slate-200 transition-all active:scale-[0.98] group"
              >
                <div className="text-xs text-slate-400 group-hover:text-sky-300">Water Bottle</div>
                <div className="text-sm font-bold text-white group-hover:text-sky-200 tabular-nums">
                  +500 mL
                </div>
              </button>
            </div>

            {/* Custom Amount & Undo Row */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Custom Amount...
              </button>

              {lastAddedId && (
                <button
                  onClick={handleUndo}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Undo last logged water"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Undo
                </button>
              )}
            </div>
          </div>

          {/* Personalization Note Accordion */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium">Individual Hydration Advisory: </span>
              Hydration requirements vary with physical activity, environmental temperature, diet, and physiological state. The default 2,000 mL benchmark serves as a guide and can be customized in settings.
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Toggle for Today's Intake History */}
      <div className="border-t border-slate-800/80 px-5 py-3 bg-slate-950/40 flex items-center justify-between">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Today's Log History ({dayEntries.length} entries)</span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>

        <span className="text-xs text-slate-400 tabular-nums">
          Total: <strong className="text-white font-semibold">{totalConsumedMl.toLocaleString()} mL</strong> ({(totalConsumedMl / 1000).toFixed(2)} L)
        </span>
      </div>

      {/* Expanded History List */}
      {showHistory && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/50 bg-slate-950/20 max-h-64 overflow-y-auto">
          {dayEntries.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No hydration logged yet for this date. Tap any quick button above to log your first water intake.
            </div>
          ) : (
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tabular-nums">
                            +{entry.amountMl} mL
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({(entry.amountMl / 1000).toFixed(2)} L)
                          </span>
                          {entry.note && (
                            <span className="text-[11px] text-slate-300 bg-slate-700/40 px-1.5 py-0.2 rounded">
                              {entry.note}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{timeStr}</span>
                          <span>·</span>
                          <span className="capitalize">{entry.containerType.replace('_', ' ')}</span>
                          <span>·</span>
                          <span>{entry.source}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Custom Amount Entry */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Log Custom Water Intake</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter any custom volume consumed in milliliters (mL).
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
                {/* Quick Presets */}
                <div className="flex gap-2 mt-2">
                  {['100', '200', '350', '650', '1000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomAmount(preset)}
                      className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Optional Note (e.g. Sparkling, Electrolytes)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g. With electrolyte mix, post-walk"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-sky-500/20"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customize Hydration Target */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Customize Daily Water Goal</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Default is 2,000 mL. Tailor your target according to workout duration, environmental heat, and health needs.
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Volume (mL)
                </label>
                <div className="relative">
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
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                    mL
                  </span>
                </div>
              </div>

              {/* Quick Goal Recommendations */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-medium">Common Baseline Targets:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Light', val: 1800 },
                    { label: 'Standard', val: 2000 },
                    { label: 'Athletic', val: 2800 },
                  ].map((rec) => (
                    <button
                      key={rec.label}
                      type="button"
                      onClick={() => setEditingGoalAmount(rec.val.toString())}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        editingGoalAmount === rec.val.toString()
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">{rec.label}</div>
                      <div className="text-xs font-bold tabular-nums">{rec.val} mL</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-sky-500/20"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
