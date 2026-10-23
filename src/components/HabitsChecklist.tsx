import React from 'react';
import {
  CheckSquare,
  Square,
  Activity,
  Wind,
  Salad,
  Dumbbell,
  Moon,
  Sparkles,
} from 'lucide-react';
import { DailyWellnessHabit, HabitCompletion } from '../types';

interface HabitsChecklistProps {
  habits: DailyWellnessHabit[];
  completions: HabitCompletion[];
  date: string;
  onToggleHabit: (habitId: string) => void;
}

export const HabitsChecklist: React.FC<HabitsChecklistProps> = ({
  habits,
  completions,
  date,
  onToggleHabit,
}) => {
  const activeHabits = habits.filter((h) => h.active);
  const completedHabitIds = new Set(
    completions.filter((c) => c.date === date && c.completed).map((c) => c.habitId)
  );

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'activity':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-teal-400" />;
      case 'salad':
        return <Salad className="w-4 h-4 text-lime-400" />;
      case 'dumbbell':
        return <Dumbbell className="w-4 h-4 text-amber-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Daily Wellness Habits
          </h3>
          <p className="text-xs text-slate-400">
            Check off self-selected habits as you complete them throughout the day
          </p>
        </div>

        <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full tabular-nums">
          {completedHabitIds.size} / {activeHabits.length} Done
        </div>
      </div>

      <div className="space-y-2.5">
        {activeHabits.map((habit) => {
          const isDone = completedHabitIds.has(habit.id);
          return (
            <div
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                isDone
                  ? 'bg-slate-950/80 border-emerald-500/30 text-white'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Toggle habit ${habit.title}`}
                  className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0">
                  {getHabitIcon(habit.icon)}
                </div>

                <div>
                  <div
                    className={`text-sm font-medium transition-all ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {habit.title}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {habit.category} · Daily Routine
                  </div>
                </div>
              </div>

              {isDone && (
                <span className="text-[11px] text-emerald-400/90 font-medium px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20">
                  Completed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
