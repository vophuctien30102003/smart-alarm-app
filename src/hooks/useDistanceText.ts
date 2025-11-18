import { calculateDistance } from '@/shared/utils/locationUtils';
import { useCallback } from 'react';

interface UseDistanceTextParams {
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

export const useDistanceText = ({ currentLocation }: UseDistanceTextParams) => {
  const getDistanceText = useCallback(
    (targetLat: number, targetLng: number): string => {
      if (!currentLocation) return '';

      const distance = calculateDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: targetLat, longitude: targetLng }
      );

      if (distance < 1) {
        return `${(distance * 1000).toFixed(0)}m away`;
      }

      return `${distance.toFixed(1)}km away`;
    },
    [currentLocation]
  );

  return getDistanceText;
};

