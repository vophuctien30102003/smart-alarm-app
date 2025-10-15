import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FavoriteLocation, LegacyLocationType } from "../shared/types";

interface LocationStore {
  currentLocation: LegacyLocationType | null;
  selectedLocation: LegacyLocationType | null;
  favoriteLocations: FavoriteLocation[];
  previewLocation: LegacyLocationType | null;
  selectedDestination: LegacyLocationType | null;

  setCurrentLocation: (location: LegacyLocationType) => void;
  setSelectedLocation: (location: LegacyLocationType) => void;
  setSelectedDestination: (location: LegacyLocationType) => void;
  addToFavorites: (location: LegacyLocationType, label: string, icon?: string) => void;
  removeFromFavorites: (id: string) => void;
  setPreviewLocation: (location: LegacyLocationType | null) => void;
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

      addToFavorites: (location, label, icon = "📍") =>
        set((state) => {
          const currentFavorites = state.favoriteLocations || [];
          if (currentFavorites.some((fav) => fav.id === location.id)) {
            return state;
          }
          return {
            favoriteLocations: [
              ...currentFavorites,
              { ...location, label, icon, isFavorite: true },
            ],
          };
        }),

      removeFromFavorites: (id) =>
        set((state) => ({
          favoriteLocations: (state.favoriteLocations || []).filter(
            (fav) => fav.id !== id
          ),
        })),

      setPreviewLocation: (location) => set({ previewLocation: location }),

      clearPreviewLocation: () => set({ previewLocation: null }),

      clearSelectedDestination: () => set({ selectedDestination: null }),

      reset: () =>
        set({
          currentLocation: null,
          selectedLocation: null,
          favoriteLocations: [],
          previewLocation: null,
          selectedDestination: null,
        }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteLocations: state.favoriteLocations,
      }),
    }
  )
);
