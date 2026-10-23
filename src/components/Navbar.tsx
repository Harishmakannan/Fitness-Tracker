import React from 'react';
import {
  Activity,
  Droplets,
  ShieldCheck,
  FileText,
  Settings,
  Smartphone,
  Monitor,
  User,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';
import { USERS, storage } from '../services/storage';

export type ActiveTab = 'dashboard' | 'water' | 'checkup' | 'reports' | 'settings';
export type DeviceMode = 'responsive_web' | 'iphone_16' | 'pixel_9';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onUserSwitch: (userId: string) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onUserSwitch,
  deviceMode,
  onDeviceModeChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight text-white whitespace-nowrap">
            FitTrack
          </span>

          {/* Sync Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Supabase Synced</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('water')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'water'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            Water Tracker
          </button>

          <button
            onClick={() => onTabChange('checkup')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'checkup'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Daily Health Checkup
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Reports
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings & Backend
          </button>
        </nav>

        {/* Zone 3: Controls (Device Mode Switcher & User Account) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Device Platform Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => onDeviceModeChange('responsive_web')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'responsive_web'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Responsive Web Mode (Full Desktop/Tablet)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Web</span>
            </button>

            <button
              onClick={() => onDeviceModeChange('iphone_16')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'iphone_16'
                  ? 'bg-slate-800 text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="iOS Mobile App View (iPhone 16 Pro)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">iOS</span>
            </button>

            <button
              onClick={() => onDeviceModeChange('pixel_9')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'pixel_9'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Android Mobile App View (Google Pixel 9)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Android</span>
            </button>
          </div>

          {/* User Account Switcher */}
          <div className="relative flex items-center gap-2">
            <select
              value={currentUser.id}
              onChange={(e) => onUserSwitch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.unitSystem})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
