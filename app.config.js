import 'dotenv/config';

export default {
  expo: {
    name: "Mwinda",
    slug: "Mwinda",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/img/icon.png",
    userInterfaceStyle: "light",
    backgroundColor: "#fec107",
    newArchEnabled: false,
    splash: {
      image: "./assets/img/splash.png",
      resizeMode: "contain",
      backgroundColor: "#fec107"
    },
    assetBundlePatterns: ["assets/img/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.coretech.mwinda",
      jsEngine: "jsc",
      infoPlist: {
        NSMicrophoneUsageDescription: "This app requires microphone access",
        NSCameraUsageDescription: "This app requires camera access"
      }
    },

    android: {
      jsEngine: "jsc",
      adaptiveIcon: {
        foregroundImage: "./assets/img/adaptive-icon.png",
        backgroundColor: "#fec107"
      },
      permissions: ["CAMERA", "RECORD_AUDIO"]
    },

    web: {
      favicon: "./assets/img/favicon.png"
    },

    plugins: [
      "expo-localization",
      [
        "expo-barcode-scanner",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access camera."
        }
      ],
      "expo-router"
    ],

    extra: {
      apiUrl: process.env.API_URL,
      eas: {
        projectId: "À compléter après `eas init`"
      }
    }
  }
};
