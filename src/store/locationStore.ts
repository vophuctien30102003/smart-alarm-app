import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {  LegacyLocationType } from "../shared/types";

interface LocationStore {
  currentLocation: LegacyLocationType | null;
  selectedLocation: LegacyLocationType | null;
  previewLocation: LegacyLocationType | null;
  selectedDestination: LegacyLocationType | null;

  setCurrentLocation: (location: LegacyLocationType) => void;
  setSelectedLocation: (location: LegacyLocationType) => void;
  setSelectedDestination: (location: LegacyLocationType) => void;  setPreviewLocation: (location: LegacyLocationType | null) => void;
  clearPreviewLocation: () => void;
  clearSelectedDestination: () => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      selectedLocation: null,
      favoriteLocations: [],
      previewLocation: null,
      selectedDestination: null,

      setCurrentLocation: (location) => set({ currentLocation: location }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setSelectedDestination: (location) => set({ selectedDestination: location }),

      setPreviewLocation: (location) => set({ previewLocation: location }),

      clearPreviewLocation: () => set({ previewLocation: null }),

      clearSelectedDestination: () => set({ selectedDestination: null }),

      reset: () =>
        set({
          currentLocation: null,
          selectedLocation: null,
          previewLocation: null,
          selectedDestination: null,
        }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
