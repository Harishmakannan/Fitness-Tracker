import React from 'react';
import {
  Activity,
  Droplets,
  ShieldCheck,
  FileText,
  Settings,
  Wifi,
  Battery,
} from 'lucide-react';
import { ActiveTab, DeviceMode } from './Navbar';

interface MobileDeviceWrapperProps {
  deviceMode: DeviceMode;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const MobileDeviceWrapper: React.FC<MobileDeviceWrapperProps> = ({
  deviceMode,
  activeTab,
  onTabChange,
  children,
}) => {
  // If Responsive Web mode is selected, render full-bleed web layout
  if (deviceMode === 'responsive_web') {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Mobile-only Bottom Tab Bar for small screen browser viewports */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
          <div className="grid grid-cols-5 items-center h-16 px-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              onClick={() => onTabChange('water')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'water' ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Droplets className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Hydration</span>
            </button>

            <button
              onClick={() => onTabChange('checkup')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'checkup' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Checkup</span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'reports' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Reports</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Device Simulator Frame (iPhone 16 Pro or Google Pixel 9)
  const isIPhone = deviceMode === 'iphone_16';

  return (
    <div className="min-h-screen bg-slate-950/80 py-8 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-4 text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>
          Previewing native {isIPhone ? 'Apple iOS' : 'Google Android'} App Environment · Touch Ergonomics Active
        </span>
      </div>

      {/* Realistic Hardware Bezel */}
      <div
        className={`relative w-full max-w-[412px] h-[850px] bg-[#090d16] rounded-[52px] border-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ${
          isIPhone ? 'border-slate-800 ring-2 ring-slate-700/60' : 'border-slate-800 ring-2 ring-emerald-900/40'
        }`}
      >
        {/* Device Status Bar */}
        <div className="h-11 bg-slate-950/90 text-white flex items-center justify-between px-7 shrink-0 select-none z-30">
          <span className="text-xs font-bold font-mono">9:41</span>

          {/* iPhone Dynamic Island or Pixel Hole-Punch */}
          {isIPhone ? (
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 border border-slate-900">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>
          ) : (
            <div className="w-4 h-4 bg-black rounded-full border border-slate-800 mx-auto" />
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
          {children}
        </div>

        {/* Native Mobile Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 pb-2">
          <div className="grid grid-cols-5 items-center h-16 px-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              onClick={() => onTabChange('water')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'water' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplets className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Hydration</span>
            </button>

            <button
              onClick={() => onTabChange('checkup')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'checkup' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Checkup</span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'reports' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Reports</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Settings</span>
            </button>
          </div>

          {/* Bottom Home Indicator Line */}
          <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-1" />
        </div>
      </div>
    </div>
  );
};
