// Time & Sleep Alarm Defaults
export const ALARM_TIME_DEFAULTS = {
  MAX_SNOOZE_COUNT: 3,
  SNOOZE_DURATION: 5,
  VOLUME: 0.8,
} as const;

// Location Alarm Defaults
export const ALARM_LOCATION_DEFAULTS = {
  MAX_SNOOZE_COUNT: 3,
  SNOOZE_DURATION: 5,
  VOLUME: 0.8,
  RADIUS_METERS: 100,
  TIME_BEFORE_ARRIVAL: 5,
  AVERAGE_SPEED_METERS_PER_MINUTE: 83.33,
} as const;