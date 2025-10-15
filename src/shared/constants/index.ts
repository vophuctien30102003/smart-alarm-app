export { colors } from './colors';
export * from './sounds';

export const ALARM_CONSTANTS = {
  DEFAULT_VOLUME: 0.8,
  DEFAULT_SNOOZE_DURATION: 5, // minutes
  MAX_SNOOZE_COUNT: 3,
  DEFAULT_RADIUS_METERS: 100,
  MIN_RADIUS_METERS: 50,
  MAX_RADIUS_METERS: 1000,
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  LOCATION_DISTANCE_INTERVAL: 50, // 50 meters
} as const;

// Notification related constants
export const NOTIFICATION_CONSTANTS = {
  ALARM_CHANNEL_ID: 'alarms',
  LOCATION_ALARM_CHANNEL_ID: 'location-alarms',
  VIBRATION_PATTERN: [0, 250, 250, 250],
} as const;
