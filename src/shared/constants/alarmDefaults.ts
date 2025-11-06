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
  MIN_RADIUS_METERS: 50,
  MAX_RADIUS_METERS: 1000,
  UPDATE_INTERVAL_MS: 10000,
  DISTANCE_INTERVAL_M: 50,
} as const;

export const NOTIFICATION_CONSTANTS = {
  ALARM_CHANNEL_ID: 'alarm-notifications', // General alarm channel
  TIME_ALARM_CHANNEL_ID: 'time-alarms',
  SLEEP_ALARM_CHANNEL_ID: 'sleep-alarms',
  LOCATION_ALARM_CHANNEL_ID: 'location-alarms',
  VIBRATION_PATTERN: [0, 250, 250, 250] as const,
} as const;

export const NOTIFICATION_CONTENT = {
    TIME_ALARM: {
        title: "⏰ Alarm",
        body: "Wake up!",
    },
    SLEEP_ALARM: {
        BEDTIME: {
            title: "🛌 Bedtime Alarm",
            body: "It's time for bed. Sleep schedule: {duration} hours.",
        },
        WAKE_UP: {
            title: "☀️ Wake Up Alarm",
            body: "It's time to wake up. Have a great day!",
        },
    },
    LOCATION_ALARM: {
        ARRIVAL: "Arrived at {address}!",
        DEPARTURE: "Left {address}!",
    },
};

export const NOTIFICATION_DATA_TYPES = {
    TIME_ALARM: "time-alarm",
    SLEEP_ALARM: "sleep-alarm",
    LOCATION_ALARM: "location-alarm",
} ;