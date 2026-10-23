import {
  DailyCheckup,
  DailyWellnessHabit,
  HabitCompletion,
  HealthMeasurement,
  HydrationEntry,
  HydrationGoal,
  ReminderSetting,
  UserProfile,
} from '../types';

export const USERS: UserProfile[] = [
  {
    id: 'usr_alex_01',
    name: 'Alex Rivera',
    email: 'alex.rivera@fittrack.io',
    unitSystem: 'metric',
    timezone: 'America/Los_Angeles',
    createdAt: '2026-01-15T08:00:00Z',
    weightKg: 72.5,
    heightCm: 178,
  },
  {
    id: 'usr_jordan_02',
    name: 'Jordan Lee',
    email: 'jordan.lee@fittrack.io',
    unitSystem: 'imperial',
    timezone: 'America/New_York',
    createdAt: '2026-02-01T09:30:00Z',
    weightKg: 64.0,
    heightCm: 168,
  },
];

const DEFAULT_HABITS: Omit<DailyWellnessHabit, 'id' | 'userId'>[] = [
  { title: '30-min Cardio or Strength Session', category: 'activity', icon: 'activity', active: true },
  { title: '10-min Morning Mindful Breathwork', category: 'mindfulness', icon: 'wind', active: true },
  { title: 'Nutritious Whole-Food Nutrition', category: 'nutrition', icon: 'salad', active: true },
  { title: 'Mobility & Postural Stretches', category: 'recovery', icon: 'dumbbell', active: true },
  { title: '30-min Screen-Free Wind-Down', category: 'recovery', icon: 'moon', active: true },
];

const DEFAULT_REMINDERS: Omit<ReminderSetting, 'id' | 'userId'>[] = [
  { type: 'water', label: 'Hydration Hydrate Break', enabled: true, scheduledTime: '10:30', repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { type: 'water', label: 'Afternoon Hydration Boost', enabled: true, scheduledTime: '14:30', repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { type: 'checkup', label: 'Complete Daily Health Checkup', enabled: true, scheduledTime: '20:30', repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { type: 'sleep', label: 'Bedtime Preparation Window', enabled: true, scheduledTime: '22:15', repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { type: 'workout', label: 'Daily Movement Check-in', enabled: false, scheduledTime: '17:00', repeatDays: ['Mon', 'Wed', 'Fri'] },
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateRelative(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';
  
  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  const diffDays = Math.round((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// Generate past 7 dates including today
export function getPastDates(daysCount = 7): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

class StorageService {
  private prefix = 'fittrack_';

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  public getCurrentUserId(): string {
    return this.getItem<string>('current_user_id', 'usr_alex_01');
  }

  public setCurrentUserId(id: string): void {
    this.setItem('current_user_id', id);
  }

  public getUserProfiles(): UserProfile[] {
    return this.getItem<UserProfile[]>('user_profiles', USERS);
  }

  public getCurrentUser(): UserProfile {
    const uid = this.getCurrentUserId();
    const users = this.getUserProfiles();
    return users.find((u) => u.id === uid) || USERS[0];
  }

  public updateUserProfile(updated: Partial<UserProfile>): void {
    const uid = this.getCurrentUserId();
    const users = this.getUserProfiles().map((u) => (u.id === uid ? { ...u, ...updated } : u));
    this.setItem('user_profiles', users);
  }

  // Hydration Goals
  public getHydrationGoal(userId?: string): HydrationGoal {
    const uid = userId || this.getCurrentUserId();
    const goals = this.getItem<Record<string, HydrationGoal>>('hydration_goals', {});
    if (goals[uid]) return goals[uid];
    return {
      userId: uid,
      dailyGoalMl: 2000,
      remindersEnabled: true,
      reminderIntervalMins: 120,
      personalizationNote: 'Baseline recommendation for moderate activity. Adjust upward for intense training or hot climates.',
    };
  }

  public setHydrationGoal(goal: Partial<HydrationGoal>): HydrationGoal {
    const uid = this.getCurrentUserId();
    const existing = this.getHydrationGoal(uid);
    const updated: HydrationGoal = { ...existing, ...goal, userId: uid };
    const goals = this.getItem<Record<string, HydrationGoal>>('hydration_goals', {});
    goals[uid] = updated;
    this.setItem('hydration_goals', goals);
    return updated;
  }

  // Hydration Entries
  public getHydrationEntries(userId?: string): HydrationEntry[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<HydrationEntry[]>('hydration_entries', []);
    return all.filter((e) => e.userId === uid);
  }

  public addHydrationEntry(
    amountMl: number,
    containerType: HydrationEntry['containerType'] = 'glass',
    note?: string,
    targetDate?: string
  ): HydrationEntry {
    const uid = this.getCurrentUserId();
    const now = new Date();
    const date = targetDate || getTodayDateString();
    
    const newEntry: HydrationEntry = {
      id: `hydro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: uid,
      date,
      timestamp: now.toISOString(),
      amountMl,
      containerType,
      note,
      source: containerType === 'custom' ? 'manual' : 'quick-add',
    };

    const all = this.getItem<HydrationEntry[]>('hydration_entries', []);
    all.unshift(newEntry);
    this.setItem('hydration_entries', all);
    return newEntry;
  }

  public deleteHydrationEntry(id: string): boolean {
    const all = this.getItem<HydrationEntry[]>('hydration_entries', []);
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length !== all.length) {
      this.setItem('hydration_entries', filtered);
      return true;
    }
    return false;
  }

  // Health Measurements
  public getMeasurements(userId?: string): HealthMeasurement[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<HealthMeasurement[]>('health_measurements', []);
    return all.filter((m) => m.userId === uid);
  }

  public setMeasurement(measurement: Omit<HealthMeasurement, 'id' | 'userId'> & { id?: string }): HealthMeasurement {
    const uid = this.getCurrentUserId();
    const all = this.getItem<HealthMeasurement[]>('health_measurements', []);
    
    const existingIndex = all.findIndex(
      (m) => m.userId === uid && m.date === measurement.date && m.type === measurement.type
    );

    const updated: HealthMeasurement = {
      id: measurement.id || (existingIndex >= 0 ? all[existingIndex].id : `meas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
      userId: uid,
      date: measurement.date,
      type: measurement.type,
      status: measurement.status,
      valueNumber: measurement.valueNumber,
      valueSecondary: measurement.valueSecondary,
      unit: measurement.unit,
      source: measurement.source || 'manual',
      notes: measurement.notes,
      recordedAt: measurement.status === 'recorded' ? (measurement.recordedAt || new Date().toISOString()) : undefined,
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.push(updated);
    }

    this.setItem('health_measurements', all);
    return updated;
  }

  // Wellness Habits
  public getWellnessHabits(userId?: string): DailyWellnessHabit[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<DailyWellnessHabit[]>('wellness_habits', []);
    return all.filter((h) => h.userId === uid);
  }

  public getHabitCompletions(userId?: string): HabitCompletion[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<HabitCompletion[]>('habit_completions', []);
    return all.filter((c) => c.userId === uid);
  }

  public toggleHabitCompletion(habitId: string, date: string): boolean {
    const uid = this.getCurrentUserId();
    const all = this.getItem<HabitCompletion[]>('habit_completions', []);
    const idx = all.findIndex((c) => c.userId === uid && c.habitId === habitId && c.date === date);

    let nextState = true;
    if (idx >= 0) {
      nextState = !all[idx].completed;
      all[idx].completed = nextState;
      all[idx].completedAt = nextState ? new Date().toISOString() : undefined;
    } else {
      all.push({
        id: `hcomp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: uid,
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }

    this.setItem('habit_completions', all);
    return nextState;
  }

  // Daily Checkups
  public getDailyCheckups(userId?: string): DailyCheckup[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<DailyCheckup[]>('daily_checkups', []);
    return all.filter((c) => c.userId === uid);
  }

  public getDailyCheckupForDate(date: string, userId?: string): DailyCheckup {
    const uid = userId || this.getCurrentUserId();
    const all = this.getDailyCheckups(uid);
    const found = all.find((c) => c.date === date);
    if (found) return found;

    return {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      date,
      energyLevel: 0,
      moodLevel: 0,
      stressLevel: 0,
      symptomsNotes: '',
      medicationStatus: 'none_needed',
      isCompleted: false,
    };
  }

  public saveDailyCheckup(checkup: DailyCheckup): DailyCheckup {
    const uid = this.getCurrentUserId();
    const all = this.getItem<DailyCheckup[]>('daily_checkups', []);
    const updated: DailyCheckup = {
      ...checkup,
      userId: uid,
      isCompleted: true,
      savedAt: new Date().toISOString(),
    };

    const idx = all.findIndex((c) => c.userId === uid && c.date === checkup.date);
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }

    this.setItem('daily_checkups', all);
    return updated;
  }

  // Reminders
  public getReminders(userId?: string): ReminderSetting[] {
    const uid = userId || this.getCurrentUserId();
    const all = this.getItem<ReminderSetting[]>('user_reminders', []);
    return all.filter((r) => r.userId === uid);
  }

  public updateReminder(reminderId: string, updates: Partial<ReminderSetting>): void {
    const all = this.getItem<ReminderSetting[]>('user_reminders', []);
    const idx = all.findIndex((r) => r.id === reminderId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      this.setItem('user_reminders', all);
    }
  }

  // Initialize Seed Data if first run
  public initializeSeedData(): void {
    const hasInitialized = localStorage.getItem(this.prefix + 'seed_initialized_v2');
    if (hasInitialized) return;

    this.seedAllData();
    localStorage.setItem(this.prefix + 'seed_initialized_v2', 'true');
  }

  public resetAllToDefault(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    this.seedAllData();
    localStorage.setItem(this.prefix + 'seed_initialized_v2', 'true');
  }

  private seedAllData(): void {
    // 1. Users
    this.setItem('user_profiles', USERS);
    this.setItem('current_user_id', 'usr_alex_01');

    // 2. Hydration Goals
    const goals: Record<string, HydrationGoal> = {
      usr_alex_01: {
        userId: 'usr_alex_01',
        dailyGoalMl: 2000,
        remindersEnabled: true,
        reminderIntervalMins: 120,
        personalizationNote: '2,000 mL base goal for moderate athletic training and indoor office work.',
      },
      usr_jordan_02: {
        userId: 'usr_jordan_02',
        dailyGoalMl: 2200,
        remindersEnabled: true,
        reminderIntervalMins: 90,
        personalizationNote: 'Adjusted for warm dry weather and morning HIIT sessions.',
      },
    };
    this.setItem('hydration_goals', goals);

    // 3. Habits
    const habits: DailyWellnessHabit[] = [];
    USERS.forEach((u) => {
      DEFAULT_HABITS.forEach((h, idx) => {
        habits.push({
          id: `hab_${u.id}_${idx + 1}`,
          userId: u.id,
          ...h,
        });
      });
    });
    this.setItem('wellness_habits', habits);

    // 4. Reminders
    const reminders: ReminderSetting[] = [];
    USERS.forEach((u) => {
      DEFAULT_REMINDERS.forEach((r, idx) => {
        reminders.push({
          id: `rem_${u.id}_${idx + 1}`,
          userId: u.id,
          ...r,
        });
      });
    });
    this.setItem('user_reminders', reminders);

    // 5. Historical Data Generation (Past 7 days)
    const dates = getPastDates(7);
    const today = getTodayDateString();
    const hydrationEntries: HydrationEntry[] = [];
    const healthMeasurements: HealthMeasurement[] = [];
    const habitCompletions: HabitCompletion[] = [];
    const checkups: DailyCheckup[] = [];

    dates.forEach((date, dayIdx) => {
      const isToday = date === today;

      // Hydration for Alex
      if (isToday) {
        // Prompt specific example:
        // Goal: 2,000 mL, Consumed: 1,250 mL, Remaining: 750 mL, Progress: 62.5%
        hydrationEntries.push(
          {
            id: 'entry_today_1',
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T07:45:00Z`,
            amountMl: 250,
            containerType: 'glass',
            note: 'Morning wake-up hydration',
            source: 'quick-add',
          },
          {
            id: 'entry_today_2',
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T09:30:00Z`,
            amountMl: 500,
            containerType: 'bottle',
            note: 'Post-commute workout flask',
            source: 'quick-add',
          },
          {
            id: 'entry_today_3',
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T12:15:00Z`,
            amountMl: 500,
            containerType: 'bottle',
            note: 'Lunch table water',
            source: 'quick-add',
          }
        );
      } else {
        // Realistic historical water
        const historicalAmounts = [2100, 1850, 2250, 1950, 2400, 2050];
        const dayTotal = historicalAmounts[dayIdx % historicalAmounts.length];
        hydrationEntries.push(
          {
            id: `entry_hist_${dayIdx}_1`,
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T08:10:00Z`,
            amountMl: 250,
            containerType: 'glass',
            source: 'quick-add',
          },
          {
            id: `entry_hist_${dayIdx}_2`,
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T11:30:00Z`,
            amountMl: 500,
            containerType: 'bottle',
            source: 'quick-add',
          },
          {
            id: `entry_hist_${dayIdx}_3`,
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T15:20:00Z`,
            amountMl: 500,
            containerType: 'bottle',
            source: 'quick-add',
          },
          {
            id: `entry_hist_${dayIdx}_4`,
            userId: 'usr_alex_01',
            date,
            timestamp: `${date}T19:00:00Z`,
            amountMl: dayTotal - 1250,
            containerType: 'custom',
            source: 'manual',
          }
        );
      }

      // Health measurements
      // Sleep
      healthMeasurements.push({
        id: `m_sleep_${date}`,
        userId: 'usr_alex_01',
        date,
        type: 'sleep_duration',
        status: 'recorded',
        valueNumber: isToday ? 7.6 : [7.2, 6.8, 8.1, 7.5, 6.4, 7.8][dayIdx % 6],
        unit: 'hours',
        source: 'wearable_sync',
        notes: 'Restful recovery window',
        recordedAt: `${date}T07:15:00Z`,
      });

      // Resting Heart Rate
      healthMeasurements.push({
        id: `m_rhr_${date}`,
        userId: 'usr_alex_01',
        date,
        type: 'resting_heart_rate',
        status: 'recorded',
        valueNumber: [58, 61, 59, 63, 62, 60, 59][dayIdx],
        unit: 'bpm',
        source: 'wearable_sync',
        recordedAt: `${date}T07:20:00Z`,
      });

      // Blood Pressure
      if (dayIdx % 2 === 0 || isToday) {
        healthMeasurements.push({
          id: `m_bp_${date}`,
          userId: 'usr_alex_01',
          date,
          type: 'blood_pressure',
          status: 'recorded',
          valueNumber: 118,
          valueSecondary: 76,
          unit: 'mmHg',
          source: 'manual',
          notes: 'Standard morning cuff reading after 5 min rest',
          recordedAt: `${date}T08:00:00Z`,
        });
      } else {
        healthMeasurements.push({
          id: `m_bp_${date}`,
          userId: 'usr_alex_01',
          date,
          type: 'blood_pressure',
          status: 'not_measured',
          unit: 'mmHg',
          source: 'manual',
        });
      }

      // SpO2
      healthMeasurements.push({
        id: `m_spo2_${date}`,
        userId: 'usr_alex_01',
        date,
        type: 'spo2',
        status: isToday ? 'recorded' : (dayIdx === 2 ? 'skipped' : 'recorded'),
        valueNumber: [98, 99, 0, 98, 97, 98, 99][dayIdx],
        unit: 'percent',
        source: 'wearable_sync',
        recordedAt: `${date}T07:25:00Z`,
      });

      // Body Temperature
      healthMeasurements.push({
        id: `m_temp_${date}`,
        userId: 'usr_alex_01',
        date,
        type: 'body_temperature',
        status: isToday ? 'recorded' : (dayIdx === 4 ? 'not_measured' : 'recorded'),
        valueNumber: 36.6,
        unit: 'degC',
        source: 'manual',
        recordedAt: `${date}T08:05:00Z`,
      });

      // Weight
      healthMeasurements.push({
        id: `m_wt_${date}`,
        userId: 'usr_alex_01',
        date,
        type: 'body_weight',
        status: isToday ? 'recorded' : 'not_measured',
        valueNumber: 72.4,
        unit: 'kg',
        source: 'manual',
        recordedAt: `${date}T07:30:00Z`,
      });

      // Habit completions
      const alexHabits = habits.filter((h) => h.userId === 'usr_alex_01');
      alexHabits.forEach((hab, habIdx) => {
        // Complete 3-4 habits for today, and varied for historical
        const isDone = isToday ? (habIdx <= 3) : ((dayIdx + habIdx) % 5 !== 0);
        habitCompletions.push({
          id: `hcomp_${date}_${hab.id}`,
          userId: 'usr_alex_01',
          habitId: hab.id,
          date,
          completed: isDone,
          completedAt: isDone ? `${date}T18:00:00Z` : undefined,
        });
      });

      // Daily checkup
      checkups.push({
        id: `chk_${date}`,
        userId: 'usr_alex_01',
        date,
        energyLevel: isToday ? 4 : [4, 3, 5, 4, 3, 4, 5][dayIdx],
        moodLevel: isToday ? 4 : [4, 4, 5, 3, 4, 4, 4][dayIdx],
        stressLevel: isToday ? 2 : [2, 3, 1, 2, 3, 2, 2][dayIdx],
        symptomsNotes: isToday ? 'Feeling hydrated and energized after morning mobility.' : 'Solid routine adherence.',
        medicationStatus: 'all_taken',
        isCompleted: true,
        savedAt: `${date}T19:30:00Z`,
      });
    });

    this.setItem('hydration_entries', hydrationEntries);
    this.setItem('health_measurements', healthMeasurements);
    this.setItem('habit_completions', habitCompletions);
    this.setItem('daily_checkups', checkups);
  }
}

export const storage = new StorageService();
