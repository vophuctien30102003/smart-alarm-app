import "dotenv/config";

export default {
  expo: {
    name: "Smart Alarm App",
    slug: "smart-alarm-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "smartalarmapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pscd.smartalarmapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "This app needs location access to show your current position and calculate distances to destinations.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "This app needs location access to show your current position and calculate distances to destinations.",
        NSUserNotificationsUsageDescription:
          "This app needs notification permissions to send alarm notifications.",
        UIBackgroundModes: ["location", "background-processing"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.pscd.smartalarmapp",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "WAKE_LOCK",
        "VIBRATE",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-audio",
      [
        "expo-notifications",
        {
          icon: "./src/assets/images/icon.png",
          color: "#ffffff",
          sounds: ["./src/assets/sound/ringtone.mp3"],
        },
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN
        },
      ],
      "expo-task-manager",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "94f218f7-6af8-42e9-b831-30e8a7015b30",
      },
    },
  },
};
