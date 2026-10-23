import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Moon,
  Scale,
  Percent,
  Check,
  MinusCircle,
  HelpCircle,
  Edit2,
  Info,
} from 'lucide-react';
import { HealthMeasurement, MeasurementStatus, MeasurementType } from '../types';
import {
  getBloodPressureGuidance,
  getHeartRateGuidance,
  getSleepGuidance,
  getSpO2Guidance,
  getTemperatureGuidance,
} from '../utils/clinicalGuidance';

interface MeasurementCardProps {
  type: MeasurementType;
  measurement?: HealthMeasurement;
  date: string;
  onUpdate: (measurement: Omit<HealthMeasurement, 'id' | 'userId'>) => void;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({
  type,
  measurement,
  date,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Default values
  const currentStatus: MeasurementStatus = measurement?.status || 'not_measured';
  const val1 = measurement?.valueNumber;
  const val2 = measurement?.valueSecondary;

  // Local form inputs
  const [inputVal1, setInputVal1] = useState(val1?.toString() || '');
  const [inputVal2, setInputVal2] = useState(val2?.toString() || '');
  const [tempUnit, setTempUnit] = useState<'degC' | 'degF'>('degC');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [notes, setNotes] = useState(measurement?.notes || '');

  // Metric configs
  const config = {
    resting_heart_rate: {
      label: 'Resting Heart Rate',
      icon: Heart,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      defaultUnit: 'bpm' as const,
      guidance: getHeartRateGuidance(val1),
      placeholder: 'e.g. 62',
    },
    blood_pressure: {
      label: 'Blood Pressure',
      icon: Activity,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      defaultUnit: 'mmHg' as const,
      guidance: getBloodPressureGuidance(val1, val2),
      placeholder: 'Systolic / Diastolic',
    },
    body_temperature: {
      label: 'Body Temperature',
      icon: Thermometer,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      defaultUnit: tempUnit,
      guidance: getTemperatureGuidance(val1, tempUnit),
      placeholder: 'e.g. 36.6',
    },
    spo2: {
      label: 'Blood Oxygen (SpO₂)',
      icon: Percent,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      defaultUnit: 'percent' as const,
      guidance: getSpO2Guidance(val1),
      placeholder: 'e.g. 98',
    },
    body_weight: {
      label: 'Body Weight',
      icon: Scale,
      iconColor: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      defaultUnit: weightUnit,
      guidance: {
        statusCategory: val1 ? 'optimal' : 'unrecorded',
        title: val1 ? 'Weight Logged' : 'Optional',
        guidanceText: 'Track weight trends at regular times for consistent hydration/fluid baseline.',
        referenceRangeText: 'Individual baseline',
      },
      placeholder: 'e.g. 72.5',
    },
    sleep_duration: {
      label: 'Sleep Duration',
      icon: Moon,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      defaultUnit: 'hours' as const,
      guidance: getSleepGuidance(val1),
      placeholder: 'e.g. 7.5',
    },
  }[type];

  const Icon = config.icon;

  // Handle status toggle directly
  const handleStatusChange = (newStatus: MeasurementStatus) => {
    if (newStatus === 'recorded') {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      onUpdate({
        date,
        type,
        status: newStatus,
        valueNumber: undefined,
        valueSecondary: undefined,
        unit: config.defaultUnit,
        source: 'manual',
        notes: newStatus === 'skipped' ? 'Marked as skipped for today' : undefined,
      });
    }
  };

  // Submit recorded values
  const handleSaveValues = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed1 = parseFloat(inputVal1);
    const parsed2 = inputVal2 ? parseFloat(inputVal2) : undefined;

    if (isNaN(parsed1)) return;

    onUpdate({
      date,
      type,
      status: 'recorded',
      valueNumber: parsed1,
      valueSecondary: parsed2,
      unit: type === 'body_temperature' ? tempUnit : type === 'body_weight' ? weightUnit : config.defaultUnit,
      source: 'manual',
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    });

    setIsEditing(false);
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 transition-all hover:border-slate-700">
      {/* Header with Title and Segmented Status Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center ${config.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">{config.label}</h4>
            <div className="text-[11px] text-slate-400">
              Ref: {config.guidance.referenceRangeText}
            </div>
          </div>
        </div>

        {/* Segmented Status Selector: Recorded | Not Measured | Skipped */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleStatusChange('recorded')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              currentStatus === 'recorded'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recorded
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('not_measured')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              currentStatus === 'not_measured'
                ? 'bg-slate-800 text-slate-200 font-semibold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Not measured
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('skipped')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              currentStatus === 'skipped'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Skipped
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <form onSubmit={handleSaveValues} className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Enter Measurement:</span>
            {type === 'body_temperature' && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTempUnit('degC')}
                  className={`px-2 py-0.5 text-[10px] rounded ${tempUnit === 'degC' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('degF')}
                  className={`px-2 py-0.5 text-[10px] rounded ${tempUnit === 'degF' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  °F
                </button>
              </div>
            )}
            {type === 'body_weight' && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2 py-0.5 text-[10px] rounded ${weightUnit === 'kg' ? 'bg-violet-500/20 text-violet-300 font-bold' : 'text-slate-400'}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lb')}
                  className={`px-2 py-0.5 text-[10px] rounded ${weightUnit === 'lb' ? 'bg-violet-500/20 text-violet-300 font-bold' : 'text-slate-400'}`}
                >
                  lb
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                step="any"
                required
                placeholder={type === 'blood_pressure' ? 'Systolic (e.g. 120)' : config.placeholder}
                value={inputVal1}
                onChange={(e) => setInputVal1(e.target.value)}
                className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-sky-500 tabular-nums"
              />
            </div>

            {type === 'blood_pressure' && (
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Diastolic (e.g. 80)"
                  value={inputVal2}
                  onChange={(e) => setInputVal2(e.target.value)}
                  className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-sm text-white focus:outline-none focus:border-sky-500 tabular-nums"
                />
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Optional measurement context or note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Save Value
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          {/* Display State */}
          <div>
            {currentStatus === 'recorded' && val1 !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white tabular-nums">
                  {type === 'blood_pressure' ? `${val1} / ${val2 || '—'}` : val1}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {measurement?.unit || config.defaultUnit}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Edit value"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            ) : currentStatus === 'skipped' ? (
              <span className="text-xs text-rose-400/80 italic flex items-center gap-1">
                <MinusCircle className="w-3.5 h-3.5" />
                Measurement marked as skipped
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Not measured today
              </span>
            )}
          </div>

          {currentStatus === 'not_measured' && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium hover:underline"
            >
              + Record
            </button>
          )}
        </div>
      )}

      {/* Clinical Guidance Reference Banner (Strictly separated from Letter Grade) */}
      {currentStatus === 'recorded' && val1 !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2 text-[11px]">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-normal">
            <span className="font-semibold text-slate-200">{config.guidance.title}: </span>
            {config.guidance.guidanceText}
          </div>
        </div>
      )}
    </div>
  );
};
