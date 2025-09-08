import { FavoriteLocationType, LocationType } from "@/types/Location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationStore {
  currentLocation: LocationType | null;
  selectedLocation: LocationType | null;
  favoriteLocations: FavoriteLocationType[];
  previewLocation: LocationType | null; 

  setCurrentLocation: (location: LocationType) => void;
  setSelectedLocation: (location: LocationType) => void;
  addToFavorites: (location: LocationType, label: string, icon?: string) => void;
  removeFromFavorites: (id: string) => void;
  setPreviewLocation: (location: LocationType | null) => void;
  clearPreviewLocation: () => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      selectedLocation: null,
      favoriteLocations: [],
      previewLocation: null,

      setCurrentLocation: (location) => set({ currentLocation: location }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),

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

      reset: () =>
        set({
          currentLocation: null,
          selectedLocation: null,
          favoriteLocations: [],
          previewLocation: null,
        }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteLocations: state.favoriteLocations,
        // previewLocation is temporary, don't persist it
      }),
    }
  )
);
