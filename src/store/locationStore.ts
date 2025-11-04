import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LocationType } from "../shared/types/alarmLocation.type";

interface LocationStore {
    currentLocation: LocationType | null;
    selectedLocation: LocationType | null;
    selectedDestination: LocationType | null;
    setCurrentLocation: (location: LocationType) => void;
    setSelectedLocation: (location: LocationType) => void;
    setSelectedDestination: (location: LocationType) => void;
    clearSelectedDestination: () => void;
    reset: () => void;
}

export const useLocationStore = create<LocationStore>()(
    persist(
        (set) => ({
            currentLocation: null,
            selectedLocation: null,
            selectedDestination: null,

            setCurrentLocation: (location) => set({ currentLocation: location }),
            setSelectedLocation: (location) => set({ selectedLocation: location }),
            setSelectedDestination: (location) => set({ selectedDestination: location }),
            clearSelectedDestination: () => set({ selectedDestination: null }),

            reset: () => set({
                currentLocation: null,
                selectedLocation: null,
                selectedDestination: null,
            }),
        }),
        {
            name: "location-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
