export interface LocationType {
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

export interface FavoriteLocationType extends LocationType {
  label: string;
  icon?: string;
}
