/**
 * Standard clinical reference ranges and contextual guidance.
 * DISCLAIMER: These reference ranges are strictly educational and do not
 * constitute clinical diagnosis, medical evaluation, or treatment advice.
 */

export interface ClinicalGuidanceResult {
  statusCategory: 'optimal' | 'normal' | 'borderline' | 'attention' | 'unrecorded';
  title: string;
  guidanceText: string;
  referenceRangeText: string;
}

export function getBloodPressureGuidance(systolic?: number, diastolic?: number): ClinicalGuidanceResult {
  if (!systolic || !diastolic) {
    return {
      statusCategory: 'unrecorded',
      title: 'Not Recorded',
      guidanceText: 'No blood pressure reading logged for this session.',
      referenceRangeText: 'Standard baseline: < 120 / < 80 mmHg',
    };
  }

  if (systolic < 120 && diastolic < 80) {
    return {
      statusCategory: 'optimal',
      title: 'Normal Range',
      guidanceText: 'Reading aligns with typical adult resting benchmarks.',
      referenceRangeText: '< 120 / < 80 mmHg',
    };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      statusCategory: 'borderline',
      title: 'Elevated Range',
      guidanceText: 'Systolic pressure is slightly above standard baseline with normal diastolic.',
      referenceRangeText: '120–129 / < 80 mmHg',
    };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      statusCategory: 'borderline',
      title: 'Stage 1 Range',
      guidanceText: 'Reading is within the American Heart Association Stage 1 category.',
      referenceRangeText: '130–139 / 80–89 mmHg',
    };
  } else {
    return {
      statusCategory: 'attention',
      title: 'High / Stage 2 Range',
      guidanceText: 'Reading is elevated. Retest after resting quietly for 5 minutes if unexpected.',
      referenceRangeText: '≥ 140 / ≥ 90 mmHg',
    };
  }
}

export function getHeartRateGuidance(bpm?: number): ClinicalGuidanceResult {
  if (!bpm) {
    return {
      statusCategory: 'unrecorded',
      title: 'Not Recorded',
      guidanceText: 'Resting pulse has not been recorded today.',
      referenceRangeText: 'Standard adult resting: 60–100 BPM',
    };
  }

  if (bpm >= 60 && bpm <= 100) {
    return {
      statusCategory: 'normal',
      title: 'Normal Resting Pulse',
      guidanceText: 'Falls cleanly within standard adult resting heart rate benchmarks.',
      referenceRangeText: '60–100 BPM',
    };
  } else if (bpm < 60) {
    return {
      statusCategory: 'optimal',
      title: 'Low / Athletic Baseline',
      guidanceText: 'Typical for well-conditioned aerobic endurance athletes, or restful sleep states.',
      referenceRangeText: '< 60 BPM (Bradycardia / Athlete)',
    };
  } else {
    return {
      statusCategory: 'borderline',
      title: 'Elevated Resting Pulse',
      guidanceText: 'Higher than typical resting benchmark. Can be influenced by caffeine, stress, or recent movement.',
      referenceRangeText: '> 100 BPM (Tachycardia threshold)',
    };
  }
}

export function getSpO2Guidance(spo2?: number): ClinicalGuidanceResult {
  if (!spo2) {
    return {
      statusCategory: 'unrecorded',
      title: 'Not Recorded',
      guidanceText: 'Blood oxygen saturation not measured.',
      referenceRangeText: 'Standard range: 95%–100%',
    };
  }

  if (spo2 >= 95 && spo2 <= 100) {
    return {
      statusCategory: 'optimal',
      title: 'Expected Saturation',
      guidanceText: 'Arterial oxygen saturation aligns with standard sea-level physiological norms.',
      referenceRangeText: '95%–100%',
    };
  } else if (spo2 >= 91 && spo2 <= 94) {
    return {
      statusCategory: 'borderline',
      title: 'Mild Low Saturation',
      guidanceText: 'Slightly reduced saturation; can occur at high altitudes or during respiratory congestion.',
      referenceRangeText: '91%–94%',
    };
  } else {
    return {
      statusCategory: 'attention',
      title: 'Low Oxygen Saturation',
      guidanceText: 'Noticeably below standard baseline. Confirm with a medical-grade pulse oximeter.',
      referenceRangeText: '≤ 90%',
    };
  }
}

export function getTemperatureGuidance(temp?: number, unit: 'degC' | 'degF' = 'degC'): ClinicalGuidanceResult {
  if (!temp) {
    return {
      statusCategory: 'unrecorded',
      title: 'Not Recorded',
      guidanceText: 'Body temperature not measured.',
      referenceRangeText: unit === 'degC' ? '36.1°C – 37.2°C' : '97.0°F – 99.0°F',
    };
  }

  const tempInC = unit === 'degF' ? (temp - 32) * (5 / 9) : temp;

  if (tempInC >= 36.1 && tempInC <= 37.2) {
    return {
      statusCategory: 'optimal',
      title: 'Normal Range',
      guidanceText: 'Within typical core temperature fluctuation parameters.',
      referenceRangeText: unit === 'degC' ? '36.1°C – 37.2°C' : '97.0°F – 99.0°F',
    };
  } else if (tempInC > 37.2 && tempInC < 38.0) {
    return {
      statusCategory: 'borderline',
      title: 'Low-Grade / Warm',
      guidanceText: 'Mildly elevated above typical resting core baseline.',
      referenceRangeText: unit === 'degC' ? '37.3°C – 37.9°C' : '99.1°F – 100.3°F',
    };
  } else if (tempInC >= 38.0) {
    return {
      statusCategory: 'attention',
      title: 'Fever Threshold',
      guidanceText: 'Core temperature meets standard clinical fever definition.',
      referenceRangeText: unit === 'degC' ? '≥ 38.0°C' : '≥ 100.4°F',
    };
  } else {
    return {
      statusCategory: 'borderline',
      title: 'Below Baseline',
      guidanceText: 'Slightly lower than usual resting temperature.',
      referenceRangeText: unit === 'degC' ? '< 36.1°C' : '< 97.0°F',
    };
  }
}

export function getSleepGuidance(hours?: number): ClinicalGuidanceResult {
  if (!hours || hours <= 0) {
    return {
      statusCategory: 'unrecorded',
      title: 'Not Recorded',
      guidanceText: 'Sleep duration has not been logged.',
      referenceRangeText: 'Adult recommendation: 7.0–9.0 hrs',
    };
  }

  if (hours >= 7.0 && hours <= 9.0) {
    return {
      statusCategory: 'optimal',
      title: 'Target Sleep Duration',
      guidanceText: 'Matches National Sleep Foundation recommended adult restorative window.',
      referenceRangeText: '7.0–9.0 hrs',
    };
  } else if (hours >= 6.0 && hours < 7.0) {
    return {
      statusCategory: 'borderline',
      title: 'Slightly Under Target',
      guidanceText: 'Functional duration, though slightly below the recommended 7+ hour restorative target.',
      referenceRangeText: '6.0–6.9 hrs',
    };
  } else if (hours > 9.0) {
    return {
      statusCategory: 'normal',
      title: 'Extended Sleep',
      guidanceText: 'Long restorative window, helpful during high training loads or recovery.',
      referenceRangeText: '> 9.0 hrs',
    };
  } else {
    return {
      statusCategory: 'attention',
      title: 'Short Sleep Window',
      guidanceText: 'Under 6 hours can impact cognitive recovery and hormonal balance.',
      referenceRangeText: '< 6.0 hrs',
    };
  }
}
