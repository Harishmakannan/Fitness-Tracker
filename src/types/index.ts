export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  unitSystem: UnitSystem;
  timezone: string;
  createdAt: string;
  weightKg: number;
  heightCm: number;
}

export interface HydrationGoal {
  userId: string;
  dailyGoalMl: number;
  remindersEnabled: boolean;
  reminderIntervalMins: number;
  personalizationNote?: string;
}

export interface HydrationEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  amountMl: number;
  containerType: 'small_glass' | 'glass' | 'bottle' | 'custom';
  note?: string;
  source: 'manual' | 'quick-add' | 'smart-bottle';
}

export type MeasurementStatus = 'recorded' | 'not_measured' | 'skipped';

export type MeasurementType =
  | 'resting_heart_rate'
  | 'blood_pressure'
  | 'body_temperature'
  | 'spo2'
  | 'body_weight'
  | 'sleep_duration';

export interface HealthMeasurement {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: MeasurementType;
  status: MeasurementStatus;
  valueNumber?: number;
  valueSecondary?: number; // e.g. diastolic blood pressure
  unit: 'bpm' | 'mmHg' | 'degC' | 'degF' | 'percent' | 'kg' | 'lb' | 'hours';
  recordedAt?: string;
  source: 'manual' | 'wearable_sync' | 'apple_health' | 'health_connect';
  notes?: string;
}

export interface DailyWellnessHabit {
  id: string;
  userId: string;
  title: string;
  category: 'activity' | 'mindfulness' | 'nutrition' | 'recovery';
  icon: string;
  active: boolean;
}

export interface HabitCompletion {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'N/A';

export interface CheckupCompletionSummary {
  date: string; // YYYY-MM-DD
  userId: string;
  letterGrade: LetterGrade;
  gradeLabel: string;
  scorePercent: number;
  goalsMetCount: number;
  totalGoalsTracked: number;
  breakdown: {
    waterGoalMet: boolean;
    waterPercentage: number;
    sleepLogged: boolean;
    sleepTargetMet: boolean;
    habitsCompletedCount: number;
    habitsTotal: number;
    clinicalVitalsRecordedCount: number;
    clinicalVitalsTotal: number;
    checkupSaved: boolean;
  };
  details: string[];
}

export interface DailyCheckup {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  energyLevel: number; // 1 to 5 (0 = unrated)
  moodLevel: number; // 1 to 5 (0 = unrated)
  stressLevel: number; // 1 to 5 (0 = unrated)
  symptomsNotes: string;
  medicationStatus: 'all_taken' | 'partially_taken' | 'none_needed' | 'skipped';
  isCompleted: boolean;
  savedAt?: string;
}

export interface ReminderSetting {
  id: string;
  userId: string;
  type: 'water' | 'checkup' | 'sleep' | 'workout';
  label: string;
  enabled: boolean;
  scheduledTime: string; // HH:mm
  repeatDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}
