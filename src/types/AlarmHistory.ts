export interface AlarmHistory {
  id: string;
  name: string;
  address: string;
  distance: number;
  timestamp: Date;
  radius: number;
  timeBeforeArrival: number;
  sound: string;
  repeat: string;
  lineName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
