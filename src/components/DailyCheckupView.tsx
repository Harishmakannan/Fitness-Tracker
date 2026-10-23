import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Save,
  CheckCircle2,
  Droplets,
  Plus,
  Smile,
  Zap,
  ActivitySquare,
  Pill,
  BarChart3,
  CalendarDays,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CheckupCompletionSummary,
  DailyCheckup,
  DailyWellnessHabit,
  HabitCompletion,
  HealthMeasurement,
  HydrationEntry,
  HydrationGoal,
  MeasurementType,
} from '../types';
import { LetterGradeBadge } from './LetterGradeBadge';
import { MeasurementCard } from './MeasurementCard';
import { HabitsChecklist } from './HabitsChecklist';
import { calculateDailyGrade } from '../utils/gradeCalculator';
import { formatDateRelative, getPastDates, getTodayDateString, storage } from '../services/storage';

interface DailyCheckupViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  hydrationEntries: HydrationEntry[];
  hydrationGoal: HydrationGoal;
  measurements: HealthMeasurement[];
  habits: DailyWellnessHabit[];
  habitCompletions: HabitCompletion[];
  checkups: DailyCheckup[];
  onRefreshData: () => void;
  onNavigateToWater: () => void;
}

export const DailyCheckupView: React.FC<DailyCheckupViewProps> = ({
  selectedDate,
  onSelectDate,
  hydrationEntries,
  hydrationGoal,
  measurements,
  habits,
  habitCompletions,
  checkups,
  onRefreshData,
  onNavigateToWater,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Retrieve or initialize daily checkup record for the selected date
  const currentCheckup = checkups.find((c) => c.date === selectedDate) || {
    id: `chk_${selectedDate}`,
    userId: storage.getCurrentUserId(),
    date: selectedDate,
    energyLevel: 0,
    moodLevel: 0,
    stressLevel: 0,
    symptomsNotes: '',
    medicationStatus: 'none_needed' as const,
    isCompleted: false,
  };

  // Form states for Checkup
  const [energyLevel, setEnergyLevel] = useState<number>(currentCheckup.energyLevel);
  const [moodLevel, setMoodLevel] = useState<number>(currentCheckup.moodLevel);
  const [stressLevel, setStressLevel] = useState<number>(currentCheckup.stressLevel);
  const [symptomsNotes, setSymptomsNotes] = useState<string>(currentCheckup.symptomsNotes || '');
  const [medicationStatus, setMedicationStatus] = useState(currentCheckup.medicationStatus || 'none_needed');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [viewHistoryModal, setViewHistoryModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customMetricType, setCustomMetricType] = useState<MeasurementType>('resting_heart_rate');

  // Sync state if selectedDate changes
  React.useEffect(() => {
    const updated = checkups.find((c) => c.date === selectedDate) || {
      id: `chk_${selectedDate}`,
      userId: storage.getCurrentUserId(),
      date: selectedDate,
      energyLevel: 0,
      moodLevel: 0,
      stressLevel: 0,
      symptomsNotes: '',
      medicationStatus: 'none_needed' as const,
      isCompleted: false,
    };
    setEnergyLevel(updated.energyLevel);
    setMoodLevel(updated.moodLevel);
    setStressLevel(updated.stressLevel);
    setSymptomsNotes(updated.symptomsNotes || '');
    setMedicationStatus(updated.medicationStatus || 'none_needed');
  }, [selectedDate, checkups]);

  // Compute daily grade dynamically
  const gradeSummary: CheckupCompletionSummary = calculateDailyGrade({
    date: selectedDate,
    userId: storage.getCurrentUserId(),
    hydrationEntries,
    hydrationGoal,
    measurements,
    habits,
    habitCompletions,
    checkup: {
      ...currentCheckup,
      energyLevel,
      moodLevel,
      stressLevel,
      symptomsNotes,
      medicationStatus,
      isCompleted: currentCheckup.isCompleted,
    },
  });

  // Calculate day's water
  const dayWaterEntries = hydrationEntries.filter((e) => e.date === selectedDate);
  const dayWaterMl = dayWaterEntries.reduce((sum, e) => sum + e.amountMl, 0);
  const waterPercent = Math.min(100, Math.round((dayWaterMl / hydrationGoal.dailyGoalMl) * 100));

  // Date navigation handlers
  const handleStepDay = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${yr}-${mo}-${da}`);
  };

  // Measurement update handler
  const handleMeasurementUpdate = (meas: Omit<HealthMeasurement, 'id' | 'userId'>) => {
    storage.setMeasurement(meas);
    onRefreshData();
  };

  // Habit toggle handler
  const handleToggleHabit = (habitId: string) => {
    storage.toggleHabitCompletion(habitId, selectedDate);
    onRefreshData();
  };

  // Save Checkup Handler
  const handleSaveCheckup = () => {
    const saved = storage.saveDailyCheckup({
      ...currentCheckup,
      date: selectedDate,
      energyLevel,
      moodLevel,
      stressLevel,
      symptomsNotes,
      medicationStatus,
      isCompleted: true,
    });

    onRefreshData();
    setSaveToast('Daily Checkup Saved & Recorded!');

    if (gradeSummary.letterGrade === 'A') {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // ignore
      }
    }

    setTimeout(() => setSaveToast(null), 3500);
  };

  // Historical past 7 dates summaries for mini-trend
  const pastDatesList = getPastDates(7);
  const pastGrades = pastDatesList.map((d) => {
    const chk = checkups.find((c) => c.date === d);
    return calculateDailyGrade({
      date: d,
      userId: storage.getCurrentUserId(),
      hydrationEntries,
      hydrationGoal,
      measurements,
      habits,
      habitCompletions,
      checkup: chk,
    });
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Date Navigation & Top Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            FitTrack Wellness System
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Daily Health Checkup
          </h1>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleStepDay(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 text-xs font-semibold text-white flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{formatDateRelative(selectedDate)}</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">({selectedDate})</span>
          </div>

          <button
            onClick={() => handleStepDay(1)}
            disabled={isToday}
            className={`p-1.5 rounded-lg transition-colors ${
              isToday ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => onSelectDate(today)}
              className="ml-1 px-2 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20"
            >
              Today
            </button>
          )}

          <button
            onClick={() => setViewHistoryModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Browse History Calendar"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero: Letter Grade Status Card */}
      <LetterGradeBadge
        grade={gradeSummary.letterGrade}
        label={gradeSummary.gradeLabel}
        scorePercent={gradeSummary.scorePercent}
        goalsMetCount={gradeSummary.goalsMetCount}
        totalGoalsTracked={gradeSummary.totalGoalsTracked}
      />

      {/* Mandatory Safety & Non-Diagnostic Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300">Safety & Educational Notice: </strong>
          This letter grade strictly reflects your personal adherence to self-selected lifestyle routines. It does not provide medical evaluation, diagnose health conditions, assess clinical safety, or replace certified healthcare advice. Clinical vitals (such as blood pressure, pulse, SpO₂, and temperature) are logged as objective records and displayed with standard reference ranges independently of the routine score.
        </div>
      </div>

      {/* Water Intake Progress Card in Daily Checkup */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Hydration Progress</h3>
              <p className="text-xs text-slate-400">
                {dayWaterMl.toLocaleString()} mL logged towards {hydrationGoal.dailyGoalMl.toLocaleString()} mL goal
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToWater}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline"
          >
            Open Bottle Tracker →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Goal Completion</span>
            <span className="text-sky-400 font-bold tabular-nums">{waterPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, waterPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clinical & Wellness Measurements Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Clinical & Wellness Measurements
            </h3>
            <p className="text-xs text-slate-400">
              Record vitals if measured today. Any unmeasured items remain strictly uninvented.
            </p>
          </div>

          <button
            onClick={() => setShowAddCustomModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add Measurement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MeasurementCard
            type="sleep_duration"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'sleep_duration')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />

          <MeasurementCard
            type="resting_heart_rate"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'resting_heart_rate')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />

          <MeasurementCard
            type="blood_pressure"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'blood_pressure')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />

          <MeasurementCard
            type="spo2"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'spo2')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />

          <MeasurementCard
            type="body_temperature"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'body_temperature')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />

          <MeasurementCard
            type="body_weight"
            measurement={measurements.find((m) => m.date === selectedDate && m.type === 'body_weight')}
            date={selectedDate}
            onUpdate={handleMeasurementUpdate}
          />
        </div>
      </div>

      {/* Daily Wellness Habits Checklist */}
      <HabitsChecklist
        habits={habits}
        completions={habitCompletions}
        date={selectedDate}
        onToggleHabit={handleToggleHabit}
      />

      {/* Subjective Well-being: Energy, Mood, Stress */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-5">
        <h3 className="text-base font-bold text-white tracking-tight">
          Subjective Wellbeing & Daily States
        </h3>

        {/* Energy Rating (1 to 5) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Daily Energy Level
            </span>
            <span className="text-slate-400 font-medium">
              {energyLevel === 0 ? 'Unrated' : ['Very Low', 'Low', 'Moderate', 'High', 'Peak Vitality'][energyLevel - 1]}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setEnergyLevel(lvl)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  energyLevel === lvl
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Rating (1 to 5) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
              Mood & Outlook
            </span>
            <span className="text-slate-400 font-medium">
              {moodLevel === 0 ? 'Unrated' : ['Downcast', 'Subdued', 'Balanced', 'Positive', 'Radiant'][moodLevel - 1]}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setMoodLevel(lvl)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  moodLevel === lvl
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Stress Rating (1 to 5) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ActivitySquare className="w-3.5 h-3.5 text-rose-400" />
              Perceived Stress
            </span>
            <span className="text-slate-400 font-medium">
              {stressLevel === 0 ? 'Unrated' : ['Very Calm', 'Mild', 'Moderate', 'Elevated', 'High Strain'][stressLevel - 1]}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setStressLevel(lvl)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  stressLevel === lvl
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Medication or Supplement Status */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-indigo-400" />
            Daily Medication & Supplements
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all_taken', label: 'All Taken' },
              { id: 'partially_taken', label: 'Partially' },
              { id: 'skipped', label: 'Skipped' },
              { id: 'none_needed', label: 'None Scheduled' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMedicationStatus(opt.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  medicationStatus === opt.id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms & Notes Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Symptoms, Observations & Personal Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={symptomsNotes}
            onChange={(e) => setSymptomsNotes(e.target.value)}
            placeholder="e.g. Mild headache after outdoor run; rested 15 min. Good hydration flow."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Save Checkup Actions */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Status: Grade {gradeSummary.letterGrade} ({gradeSummary.scorePercent}%)
              {currentCheckup.isCompleted && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  Checkup Completed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {saveToast || 'Review your entries and save today’s health record to local & cloud sync'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveCheckup}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Save className="w-4 h-4" />
          Complete Daily Checkup
        </button>
      </div>

      {/* Weekly Completion Trends Row */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Past 7 Days Wellness Completion</h4>
          </div>
          <span className="text-xs text-slate-400">Tap any day to view checkup</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {pastGrades.map((g) => {
            const isSelected = g.date === selectedDate;
            const dObj = new Date(g.date + 'T00:00:00');
            const dayName = dObj.toLocaleDateString(undefined, { weekday: 'narrow' });
            const dayNum = dObj.getDate();

            return (
              <button
                key={g.date}
                onClick={() => onSelectDate(g.date)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-medium">{dayName}</span>
                <span className="text-xs font-bold text-slate-200 tabular-nums">{dayNum}</span>

                <div
                  className={`mt-1.5 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${
                    g.letterGrade === 'A'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : g.letterGrade === 'B'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : g.letterGrade === 'C'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : g.letterGrade === 'D'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {g.letterGrade}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal: History Calendar Picker */}
      {viewHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-400" />
                Select Checkup Date
              </h3>
              <button
                onClick={() => setViewHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Pick any past date to examine historical wellness completions and clinical entries without altering previous logs.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {getPastDates(14).map((d) => {
                const chk = checkups.find((c) => c.date === d);
                const grade = calculateDailyGrade({
                  date: d,
                  userId: storage.getCurrentUserId(),
                  hydrationEntries,
                  hydrationGoal,
                  measurements,
                  habits,
                  habitCompletions,
                  checkup: chk,
                });

                return (
                  <button
                    key={d}
                    onClick={() => {
                      onSelectDate(d);
                      setViewHistoryModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      d === selectedDate
                        ? 'bg-sky-500/20 border-sky-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">
                        {formatDateRelative(d)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{d}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 tabular-nums">
                        {grade.scorePercent}%
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          grade.letterGrade === 'A'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : grade.letterGrade === 'B'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : grade.letterGrade === 'C'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {grade.letterGrade}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom / Specific Measurement */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Record Measurement</h3>
            <p className="text-xs text-slate-400 mb-4">
              Select which wellness parameter or clinical telemetry to record for {selectedDate}.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { type: 'sleep_duration' as const, label: 'Sleep Duration (Hours)' },
                { type: 'resting_heart_rate' as const, label: 'Resting Heart Rate (BPM)' },
                { type: 'blood_pressure' as const, label: 'Blood Pressure (mmHg)' },
                { type: 'spo2' as const, label: 'Blood Oxygen (SpO₂ %)' },
                { type: 'body_temperature' as const, label: 'Body Temperature' },
                { type: 'body_weight' as const, label: 'Body Weight' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setCustomMetricType(item.type);
                    setShowAddCustomModal(false);
                    // scroll to the card or notify
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs font-medium text-slate-200 transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-sky-400 text-xs font-semibold">Select →</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddCustomModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
