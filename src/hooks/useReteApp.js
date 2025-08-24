// hooks/useRateApp.js
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ton Apple ID numérique (vu sur ta capture)
const APPLE_ID = '6749178696';
// Ton package Android (vérifie qu'il matche app.config.js)
const ANDROID_PACKAGE = 'com.coretech.mwinda';

const IOS_REVIEW_URL = `itms-apps://apps.apple.com/app/id${APPLE_ID}?action=write-review`;
const ANDROID_REVIEW_URL = `market://details?id=${ANDROID_PACKAGE}`;
const ANDROID_WEB_FALLBACK = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

const KEYS = {
  launches: 'rate_launches',
  lastPrompt: 'rate_last_prompt_ts',
};

const MIN_LAUNCHES = 5;      // pas de spam à froid
const DAYS_COOLDOWN = 7;     // délai entre 2 prompts

export function useRateApp() {
  const incrementLaunch = async () => {
    const n = parseInt((await AsyncStorage.getItem(KEYS.launches)) || '0', 10);
    await AsyncStorage.setItem(KEYS.launches, String(n + 1));
  };

  const openStorePage = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(IOS_REVIEW_URL);
      } else {
        const can = await Linking.canOpenURL(ANDROID_REVIEW_URL);
        await Linking.openURL(can ? ANDROID_REVIEW_URL : ANDROID_WEB_FALLBACK);
      }
    } catch {}
  };

  const maybeAskForReview = async () => {
    // garde-fous basiques
    const n = parseInt((await AsyncStorage.getItem(KEYS.launches)) || '0', 10);
    const last = parseInt((await AsyncStorage.getItem(KEYS.lastPrompt)) || '0', 10);
    const enoughLaunches = n >= MIN_LAUNCHES;
    const enoughTime = Date.now() - last > DAYS_COOLDOWN * 864e5;
    if (!enoughLaunches || !enoughTime) return;

    const available = await StoreReview.isAvailableAsync();
    if (available) {
      // Apple/Google peuvent décider de NE PAS afficher la popup (quota/heuristiques)
      await StoreReview.requestReview();
      await AsyncStorage.setItem(KEYS.lastPrompt, String(Date.now()));
    } else {
      // Fallback (utile en Expo Go / TestFlight)
      await openStorePage();
      await AsyncStorage.setItem(KEYS.lastPrompt, String(Date.now()));
    }
  };

  return { incrementLaunch, maybeAskForReview, openStorePage };
}
