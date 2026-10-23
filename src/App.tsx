import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  DeviceMode,
  Navbar,
} from './components/Navbar';
import { MobileDeviceWrapper } from './components/MobileDeviceWrapper';
import { DashboardView } from './components/DashboardView';
import { WaterTrackerDetailView } from './components/WaterTrackerDetailView';
import { DailyCheckupView } from './components/DailyCheckupView';
import { ReportsView } from './components/ReportsView';
import { RemindersSettingsView } from './components/RemindersSettingsView';
import {
  DailyCheckup,
  DailyWellnessHabit,
  HabitCompletion,
  HealthMeasurement,
  HydrationEntry,
  HydrationGoal,
  ReminderSetting,
  UserProfile,
} from './types';
import { getTodayDateString, storage } from './services/storage';

export default function App() {
  // Initialize sample/seed database on first load
  useEffect(() => {
    storage.initializeSeedData();
  }, []);

  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive_web');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Store data states
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getCurrentUser());
  const [hydrationGoal, setHydrationGoal] = useState<HydrationGoal>(() => storage.getHydrationGoal());
  const [hydrationEntries, setHydrationEntries] = useState<HydrationEntry[]>(() =>
    storage.getHydrationEntries()
  );
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>(() =>
    storage.getMeasurements()
  );
  const [habits, setHabits] = useState<DailyWellnessHabit[]>(() => storage.getWellnessHabits());
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(() =>
    storage.getHabitCompletions()
  );
  const [checkups, setCheckups] = useState<DailyCheckup[]>(() => storage.getDailyCheckups());
  const [reminders, setReminders] = useState<ReminderSetting[]>(() => storage.getReminders());

  // Refresh data from storage
  const refreshAllData = useCallback(() => {
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    setHydrationGoal(storage.getHydrationGoal(user.id));
    setHydrationEntries(storage.getHydrationEntries(user.id));
    setMeasurements(storage.getMeasurements(user.id));
    setHabits(storage.getWellnessHabits(user.id));
    setHabitCompletions(storage.getHabitCompletions(user.id));
    setCheckups(storage.getDailyCheckups(user.id));
    setReminders(storage.getReminders(user.id));
  }, []);

  // User Switch Handler
  const handleUserSwitch = (newUserId: string) => {
    storage.setCurrentUserId(newUserId);
    refreshAllData();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
      />

      {/* Main Responsive / Mobile Frame Content Container */}
      <MobileDeviceWrapper
        deviceMode={deviceMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            user={currentUser}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            hydrationEntries={hydrationEntries}
            hydrationGoal={hydrationGoal}
            measurements={measurements}
            habits={habits}
            habitCompletions={habitCompletions}
            checkups={checkups}
            onEntriesChange={refreshAllData}
            onGoalChange={(newGoal) => {
              setHydrationGoal(newGoal);
              refreshAllData();
            }}
            onNavigateToCheckup={() => setActiveTab('checkup')}
            onNavigateToWater={() => setActiveTab('water')}
          />
        )}

        {activeTab === 'water' && (
          <WaterTrackerDetailView
            entries={hydrationEntries}
            goal={hydrationGoal}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onEntriesChange={refreshAllData}
            onGoalChange={(newGoal) => {
              setHydrationGoal(newGoal);
              refreshAllData();
            }}
          />
        )}

        {activeTab === 'checkup' && (
          <DailyCheckupView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            hydrationEntries={hydrationEntries}
            hydrationGoal={hydrationGoal}
            measurements={measurements}
            habits={habits}
            habitCompletions={habitCompletions}
            checkups={checkups}
            onRefreshData={refreshAllData}
            onNavigateToWater={() => setActiveTab('water')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            hydrationEntries={hydrationEntries}
            hydrationGoal={hydrationGoal}
            measurements={measurements}
            habits={habits}
            habitCompletions={habitCompletions}
            checkups={checkups}
          />
        )}

        {activeTab === 'settings' && (
          <RemindersSettingsView
            reminders={reminders}
            user={currentUser}
            onRemindersChange={refreshAllData}
            onUserChange={refreshAllData}
          />
        )}
      </MobileDeviceWrapper>
    </div>
  );
}
