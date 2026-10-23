import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Globe,
  Database,
  RotateCcw,
  Check,
  Copy,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { ReminderSetting, UserProfile } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../services/supabaseSchema';
import { storage } from '../services/storage';

interface RemindersSettingsViewProps {
  reminders: ReminderSetting[];
  user: UserProfile;
  onRemindersChange: () => void;
  onUserChange: () => void;
}

export const RemindersSettingsView: React.FC<RemindersSettingsViewProps> = ({
  reminders,
  user,
  onRemindersChange,
  onUserChange,
}) => {
  const [selectedTimezone, setSelectedTimezone] = useState(user.timezone);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'reminders' | 'supabase_db' | 'profile'>('reminders');
  const [testNotification, setTestNotification] = useState<{ title: string; body: string } | null>(null);

  // Toggle reminder
  const handleToggle = (id: string, currentState: boolean) => {
    storage.updateReminder(id, { enabled: !currentState });
    onRemindersChange();
  };

  // Change time
  const handleTimeChange = (id: string, newTime: string) => {
    storage.updateReminder(id, { scheduledTime: newTime });
    onRemindersChange();
  };

  // Change Timezone
  const handleTimezoneSave = (tz: string) => {
    setSelectedTimezone(tz);
    storage.updateUserProfile({ timezone: tz });
    onUserChange();
  };

  // Trigger simulated push notification
  const handleTestReminder = (label: string, time: string) => {
    setTestNotification({
      title: `🔔 FitTrack Reminder (${time})`,
      body: `Time for your scheduled: ${label}. Stay consistent with your daily wellness goals!`,
    });
    setTimeout(() => {
      setTestNotification(null);
    }, 6000);
  };

  // Copy Supabase SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Reset all data
  const handleResetData = () => {
    if (window.confirm('Reset all FitTrack data back to initial seed state? This restores the default 7-day history.')) {
      storage.resetAllToDefault();
      onRemindersChange();
      onUserChange();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            FitTrack Configuration & Backend
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Reminders & System Settings
          </h1>
          <p className="text-xs text-slate-400">
            Notification schedules, timezone calibration, and Supabase database schema
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'reminders'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reminders & Alerts
          </button>
          <button
            onClick={() => setActiveTab('supabase_db')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'supabase_db'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supabase SQL & RLS
          </button>
        </div>
      </div>

      {/* Simulated In-App Notification Toast */}
      {testNotification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm rounded-2xl bg-slate-900 border-2 border-emerald-500 p-4 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">{testNotification.title}</div>
              <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                {testNotification.body}
              </div>
            </div>
            <button
              onClick={() => setTestNotification(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab: Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Reminders List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Daily Wellness Reminders</h3>
                <p className="text-xs text-slate-400">
                  Control custom alerts for hydration, evening checkups, sleep prep, and movement
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        rem.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{rem.label}</div>
                      <div className="text-[11px] text-slate-400">
                        Repeats: {rem.repeatDays.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Time input */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={rem.scheduledTime}
                        onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                        className="bg-transparent text-white font-mono focus:outline-none"
                      />
                    </div>

                    {/* Test simulation button */}
                    <button
                      onClick={() => handleTestReminder(rem.label, rem.scheduledTime)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Test Alert"
                    >
                      <Play className="w-3.5 h-3.5 text-sky-400" />
                    </button>

                    {/* Toggle switch */}
                    <button
                      onClick={() => handleToggle(rem.id, rem.enabled)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        rem.enabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          rem.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timezone Preference */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-bold text-white">Preferred Local Timezone</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Daily metrics automatically roll over at 00:00 midnight according to your configured timezone.
            </p>

            <div className="max-w-md">
              <select
                value={selectedTimezone}
                onChange={(e) => handleTimezoneSave(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="America/Los_Angeles">Pacific Time (US & Canada) - America/Los_Angeles</option>
                <option value="America/Denver">Mountain Time (US & Canada) - America/Denver</option>
                <option value="America/Chicago">Central Time (US & Canada) - America/Chicago</option>
                <option value="America/New_York">Eastern Time (US & Canada) - America/New_York</option>
                <option value="Europe/London">Greenwich Mean Time - Europe/London</option>
                <option value="Europe/Paris">Central European Time - Europe/Paris</option>
                <option value="Asia/Tokyo">Japan Standard Time - Asia/Tokyo</option>
                <option value="Asia/Singapore">Singapore Standard Time - Asia/Singapore</option>
              </select>
            </div>
          </div>

          {/* Danger Zone / Reset */}
          <div className="bg-slate-900 rounded-2xl border border-rose-950/60 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Restore Seed Data
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Re-populates the 7-day realistic demo dataset for testing.
                </p>
              </div>

              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Supabase SQL & RLS Schema */}
      {activeTab === 'supabase_db' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Supabase Database DDL & RLS Policies</h3>
              </div>
              <p className="text-xs text-slate-400">
                Schema definition covering hydration entries, goals, daily checkups, habits, and Row Level Security.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md shadow-emerald-500/20"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              All 9 tables enforce strict Row Level Security (RLS) guaranteeing user-isolated persistence: <code className="font-mono bg-emerald-950/60 px-1 py-0.5 rounded">auth.uid() = user_id</code>.
            </span>
          </div>

          {/* Syntax highlighted SQL viewer */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>supabase_fittrack_schema.sql</span>
              <span>PostgreSQL 15+</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
