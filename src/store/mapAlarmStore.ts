import { LocationType } from '@/types/Location';
import { MapAlarm, ViewMode } from '@/types/MapAlarm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORAGE_KEY = 'map_alarms';

interface MapAlarmStore {
  // UI State
  currentView: ViewMode;
  selectedLocation: LocationType | null;
  editingAlarm: MapAlarm | null;
  
  // Alarms Data
  alarms: MapAlarm[];
  recentAlarms: MapAlarm[];
  
  // Actions
  setCurrentView: (view: ViewMode) => void;
  setSelectedLocation: (location: LocationType | null) => void;
  setEditingAlarm: (alarm: MapAlarm | null) => void;
  
  // Alarm Management
  addAlarm: (alarm: Omit<MapAlarm, 'id' | 'timestamp'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<MapAlarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarmActive: (id: string) => Promise<void>;
  
  // Recent Alarms (last 10)
  loadRecentAlarms: () => Promise<void>;
  getRecentAlarms: () => MapAlarm[];
  
  // Helper
  reset: () => void;
}

export const useMapAlarmStore = create<MapAlarmStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentView: 'search',
      selectedLocation: null,
      editingAlarm: null,
      alarms: [],
      recentAlarms: [],

      // UI Actions
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setEditingAlarm: (alarm) => set({ editingAlarm: alarm }),

      // Alarm Management
      addAlarm: async (alarmData) => {
        const newAlarm: MapAlarm = {
          ...alarmData,
          id: `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        const currentAlarms = get().alarms;
        const updatedAlarms = [...currentAlarms, newAlarm];
        
        set({ alarms: updatedAlarms });
        
        // Save to AsyncStorage separately for recent alarms
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlarms));
          get().loadRecentAlarms();
        } catch (error) {
          console.error('Error saving alarm to storage:', error);
        }
      },

      updateAlarm: async (id, updates) => {
        const currentAlarms = get().alarms;
        const updatedAlarms = currentAlarms.map(alarm =>
          alarm.id === id ? { ...alarm, ...updates } : alarm
        );
        
        set({ alarms: updatedAlarms });
        
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlarms));
          get().loadRecentAlarms();
        } catch (error) {
          console.error('Error updating alarm:', error);
        }
      },

      deleteAlarm: async (id) => {
        const currentAlarms = get().alarms;
        const updatedAlarms = currentAlarms.filter(alarm => alarm.id !== id);
        
        set({ alarms: updatedAlarms });
        
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlarms));
          get().loadRecentAlarms();
        } catch (error) {
          console.error('Error deleting alarm:', error);
        }
      },

      toggleAlarmActive: async (id) => {
        const currentAlarms = get().alarms;
        const updatedAlarms = currentAlarms.map(alarm =>
          alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
        );
        
        set({ alarms: updatedAlarms });
        
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlarms));
        } catch (error) {
          console.error('Error toggling alarm:', error);
        }
      },

      // Recent Alarms
      loadRecentAlarms: async () => {
        try {
          const alarmsData = await AsyncStorage.getItem(STORAGE_KEY);
          if (alarmsData) {
            const allAlarms: MapAlarm[] = JSON.parse(alarmsData);
            // Get last 10 alarms, sorted by timestamp
            const recent = allAlarms
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10);
            
            set({ recentAlarms: recent });
          }
        } catch (error) {
          console.error('Error loading recent alarms:', error);
        }
      },

      getRecentAlarms: () => {
        return get().recentAlarms;
      },

      reset: () => set({
        currentView: 'search',
        selectedLocation: null,
        editingAlarm: null,
        alarms: [],
        recentAlarms: [],
      }),
    }),
    {
      name: 'map-alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        alarms: state.alarms,
        // Don't persist UI state and recent alarms (loaded separately)
      }),
    }
  )
);
