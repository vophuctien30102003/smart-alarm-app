export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Legacy location type for backward compatibility
export interface LegacyLocationType {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  mapbox_id?: string;
  createdAt?: Date;
  isFavorite?: boolean;
  type?: 'home' | 'work' | 'other';
}
