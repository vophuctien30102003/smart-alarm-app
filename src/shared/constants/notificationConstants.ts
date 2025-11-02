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