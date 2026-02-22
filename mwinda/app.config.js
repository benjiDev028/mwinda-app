import 'dotenv/config';

export default {
  expo: {
    name: "Mwinda",
    slug: "Mwinda",
    version: "1.2.0",
    owner: "benjidev028",
    orientation: "portrait",
    icon: "./assets/img/iconf.jpg",
    userInterfaceStyle: "light",
    backgroundColor: "#fec107",
    newArchEnabled: false,

    splash: {
      image: "./assets/img/splash.png",
      resizeMode: "contain",
      backgroundColor: "#fec107"
    },

    updates: {
      url: "https://u.expo.dev/15ade672-1b0e-4fce-b3e9-2652f5d3f486"
    },
    runtimeVersion: { policy: "appVersion" },   // ← MANQUAIT

    assetBundlePatterns: ["assets/img/*"],

    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.coretech.mwinda",
      jsEngine: "jsc",
      buildNumber: "16",
      infoPlist: {
        NSMicrophoneUsageDescription: "This app requires microphone access",
        NSCameraUsageDescription: "This app requires camera access",
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "mwinda.core-techs.ca": {
              NSExceptionAllowsInsecureHTTPLoads: false,
              NSExceptionMinimumTLSVersion: "TLSv1.2",
              NSIncludesSubdomains: true
            }
          }
        }
      }
    },

    android: {
      package: "com.coretech.mwinda.android",
      versionCode: 19,
     jsEngine: "jsc",
      adaptiveIcon: {
        foregroundImage: "./assets/img/adaptive-icon.png",
        backgroundColor: "#fec107"
      },
      permissions: ["CAMERA", "RECORD_AUDIO"]
    },
    runtimeVersion: {
      policy: "appVersion" // ← Important pour la gestion des updates
    },
   

    web: { favicon: "./assets/img/favicon.png" },

    plugins: [
      "expo-localization",
    ],

    extra: {
      apiUrl: process.env.API_URL || "https://mwinda.core-techs.ca",
      eas: { projectId: "15ade672-1b0e-4fce-b3e9-2652f5d3f486" }
    }
  }
};
