export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationTarget {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  mapbox_id?: string;
  type?: 'home' | 'work' | 'other';
  createdAt?: Date;
  isFavorite?: boolean;
}

export interface FavoriteLocation extends LocationTarget {
  label: string;
  icon?: string;
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
