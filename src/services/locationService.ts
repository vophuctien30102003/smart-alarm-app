import { LocationType } from '@/types/Location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_HISTORY_KEY = 'location_history';

export interface LocationHistoryService {
  saveLocationToHistory: (location: LocationType) => Promise<void>;
  loadLocationHistory: () => Promise<LocationType[]>;
  clearLocationHistory: () => Promise<void>;
  removeLocationFromHistory: (locationId: string) => Promise<void>;
}

class LocationHistoryServiceImpl implements LocationHistoryService {
  async saveLocationToHistory(location: LocationType): Promise<void> {
    try {
      const existingHistory = await this.loadLocationHistory();
      
      // Remove duplicates based on location ID or coordinates
      const filteredHistory = existingHistory.filter(
        (item) => 
          item.id !== location.id && 
          !(item.coordinates.latitude === location.coordinates.latitude && 
            item.coordinates.longitude === location.coordinates.longitude)
      );
      
      // Add new location to the beginning of the list
      const updatedHistory = [location, ...filteredHistory].slice(0, 20); // Keep only last 20 items
      
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save location to history:', error);
      throw new Error('Failed to save location to history');
    }
  }

  async loadLocationHistory(): Promise<LocationType[]> {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      if (!historyJson) {
        return [];
      }
      
      const history = JSON.parse(historyJson);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to load location history:', error);
      return [];
    }
  }

  async clearLocationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear location history:', error);
      throw new Error('Failed to clear location history');
    }
  }

  async removeLocationFromHistory(locationId: string): Promise<void> {
    try {
      const existingHistory = await this.loadLocationHistory();
      const updatedHistory = existingHistory.filter(item => item.id !== locationId);
      
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to remove location from history:', error);
      throw new Error('Failed to remove location from history');
    }
  }
}

// Export singleton instance
export const locationHistoryService = new LocationHistoryServiceImpl();
export default locationHistoryService;
