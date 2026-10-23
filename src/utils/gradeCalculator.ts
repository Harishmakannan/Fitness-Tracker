import { CheckupCompletionSummary, DailyCheckup, DailyWellnessHabit, HabitCompletion, HealthMeasurement, HydrationEntry, HydrationGoal, LetterGrade } from '../types';

export function calculateDailyGrade(params: {
  date: string;
  userId: string;
  hydrationEntries: HydrationEntry[];
  hydrationGoal: HydrationGoal;
  measurements: HealthMeasurement[];
  habits: DailyWellnessHabit[];
  habitCompletions: HabitCompletion[];
  checkup?: DailyCheckup;
}): CheckupCompletionSummary {
  const { date, userId, hydrationEntries, hydrationGoal, measurements, habits, habitCompletions, checkup } = params;

  // 1. Water Goal Calculation
  const todaysWaterMl = hydrationEntries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amountMl, 0);

  const goalMl = hydrationGoal.dailyGoalMl > 0 ? hydrationGoal.dailyGoalMl : 2000;
  const waterPercentage = Math.min(100, Math.round((todaysWaterMl / goalMl) * 100));
  const waterGoalMet = todaysWaterMl >= goalMl;

  // 2. Sleep Tracking
  const sleepMeasurement = measurements.find((m) => m.date === date && m.type === 'sleep_duration');
  const sleepLogged = !!sleepMeasurement && sleepMeasurement.status === 'recorded' && (sleepMeasurement.valueNumber ?? 0) > 0;
  const sleepTargetMet = sleepLogged && (sleepMeasurement?.valueNumber ?? 0) >= 7.0;

  // 3. Habits Completion
  const activeHabits = habits.filter((h) => h.active);
  const todaysCompletions = habitCompletions.filter((c) => c.date === date && c.completed);
  const habitsCompletedCount = activeHabits.filter((h) =>
    todaysCompletions.some((c) => c.habitId === h.id)
  ).length;
  const habitsTotal = activeHabits.length;

  // 4. Clinical Vitals Recorded
  const clinicalTypes: HealthMeasurement['type'][] = ['resting_heart_rate', 'blood_pressure', 'body_temperature', 'spo2'];
  const relevantVitals = measurements.filter((m) => m.date === date && clinicalTypes.includes(m.type));
  const recordedVitalsCount = relevantVitals.filter((m) => m.status === 'recorded').length;
  const totalVitalsConfigured = 4;

  // 5. Checkup Saved / Logged
  const checkupSaved = !!checkup && checkup.isCompleted;

  // Trackable goals inventory:
  // - Hydration Goal (Weight: 25%)
  // - Sleep Goal (Weight: 20%)
  // - Wellness Habits (Weight: 35%)
  // - Checkup / Vitals Review (Weight: 20%)

  // Check if we have enough data (at least 2 tracking areas attempted or data present)
  let itemsAttempted = 0;
  if (todaysWaterMl > 0) itemsAttempted++;
  if (sleepLogged || (sleepMeasurement && sleepMeasurement.status !== 'not_measured')) itemsAttempted++;
  if (habitsCompletedCount > 0) itemsAttempted++;
  if (recordedVitalsCount > 0) itemsAttempted++;
  if (checkup && (checkup.energyLevel > 0 || checkup.symptomsNotes.trim().length > 0 || checkupSaved)) itemsAttempted++;

  // Calculate discrete goals met
  let goalsMetCount = 0;
  let totalGoalsTracked = 0;

  // Goal 1: Hydration
  totalGoalsTracked++;
  if (waterGoalMet) goalsMetCount++;

  // Goal 2: Sleep
  totalGoalsTracked++;
  if (sleepLogged && (sleepMeasurement?.valueNumber ?? 0) >= 6.5) goalsMetCount++;

  // Goal 3: Habits (pass if >= 70% habits done, or proportional)
  if (habitsTotal > 0) {
    totalGoalsTracked += habitsTotal;
    goalsMetCount += habitsCompletedCount;
  }

  // Goal 4: Checkup saved / Daily checkin
  totalGoalsTracked++;
  if (checkupSaved || (checkup && checkup.energyLevel > 0)) goalsMetCount++;

  // Compute percentage score (0 - 100)
  // Weighted transparent scoring formula:
  const waterScore = Math.min(25, (todaysWaterMl / goalMl) * 25);
  const sleepScore = sleepLogged ? ((sleepMeasurement?.valueNumber ?? 0) >= 7 ? 20 : 12) : 0;
  const habitsScore = habitsTotal > 0 ? (habitsCompletedCount / habitsTotal) * 35 : 25;
  const checkupScore = checkupSaved ? 20 : (checkup && checkup.energyLevel > 0 ? 10 : 0);

  const rawScore = Math.round(waterScore + sleepScore + habitsScore + checkupScore);
  const scorePercent = Math.min(100, Math.max(0, rawScore));

  let letterGrade: LetterGrade = 'N/A';
  let gradeLabel = 'Not Enough Data';

  if (itemsAttempted < 2 && todaysWaterMl === 0 && habitsCompletedCount === 0 && !sleepLogged) {
    letterGrade = 'N/A';
    gradeLabel = 'Not Enough Data';
  } else if (scorePercent >= 85) {
    letterGrade = 'A';
    gradeLabel = 'Excellent';
  } else if (scorePercent >= 70) {
    letterGrade = 'B';
    gradeLabel = 'Good';
  } else if (scorePercent >= 50) {
    letterGrade = 'C';
    gradeLabel = 'Fair';
  } else {
    letterGrade = 'D';
    gradeLabel = 'Needs Attention';
  }

  // Generate detailed human feedback
  const details: string[] = [];
  if (waterGoalMet) {
    details.push(`Daily water target reached (${todaysWaterMl} / ${goalMl} mL)`);
  } else if (todaysWaterMl > 0) {
    details.push(`Hydration in progress: ${todaysWaterMl} mL (${goalMl - todaysWaterMl} mL remaining)`);
  } else {
    details.push(`No water logged yet for today`);
  }

  if (sleepLogged) {
    details.push(`Rest recorded: ${sleepMeasurement?.valueNumber} hours`);
  } else {
    details.push(`Sleep duration pending`);
  }

  if (habitsTotal > 0) {
    details.push(`${habitsCompletedCount} of ${habitsTotal} wellness habits checked`);
  }

  if (checkupSaved) {
    details.push(`Daily health checkup saved`);
  }

  return {
    date,
    userId,
    letterGrade,
    gradeLabel,
    scorePercent,
    goalsMetCount,
    totalGoalsTracked,
    breakdown: {
      waterGoalMet,
      waterPercentage,
      sleepLogged,
      sleepTargetMet,
      habitsCompletedCount,
      habitsTotal,
      clinicalVitalsRecordedCount: recordedVitalsCount,
      clinicalVitalsTotal: totalVitalsConfigured,
      checkupSaved,
    },
    details,
  };
}
