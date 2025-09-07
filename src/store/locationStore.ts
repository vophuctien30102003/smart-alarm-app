import { FavoriteLocationType, LocationType } from "@/types/Location";
import { generateId } from "@/utils/idUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationStore {
  currentLocation: LocationType | null;
  selectedLocation: LocationType | null;
  favoriteLocations: FavoriteLocationType[];
  searchHistory: LocationType[];

  setCurrentLocation: (location: LocationType) => void;
  setSelectedLocation: (location: LocationType) => void;
  addToFavorites: (location: LocationType, label: string, icon?: string) => void;
  removeFromFavorites: (id: string) => void;
  addToSearchHistory: (location: LocationType) => void;
  clearSearchHistory: () => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      selectedLocation: null,
      favoriteLocations: [],
      searchHistory: [],

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

      addToSearchHistory: (location) =>
        set((state) => {
          const currentHistory = state.searchHistory || [];
          
          const filtered = currentHistory.filter(
            (item) => item.id !== location.id
          );
          return {
            searchHistory: [
              { ...location, id: generateId() },
              ...filtered,
            ].slice(0, 10),
          };
        }),

      clearSearchHistory: () => set({ searchHistory: [] }),

      reset: () =>
        set({
          currentLocation: null,
          selectedLocation: null,
          favoriteLocations: [],
          searchHistory: [],
        }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteLocations: state.favoriteLocations,
        searchHistory: state.searchHistory,
      }),
    }
  )
);
