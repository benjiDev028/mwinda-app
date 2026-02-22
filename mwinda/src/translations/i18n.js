import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'; // Correct import
import * as Localization from 'expo-localization';
import en from './en.json'; // Langue anglaise
import fr from './fr.json'; // Langue française

// Détecter la langue du téléphone
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'fr'; // Utiliser "fr" par défaut si non détectée

// Initialiser i18n
i18n
  .use(initReactI18next) // Intégration avec React
  .init({
    resources: {
      en: { translation: en }, // Traductions en anglais
      fr: { translation: fr }, // Traductions en français
    },
    lng: deviceLanguage, // Langue détectée
    fallbackLng: 'fr', // Utiliser "fr" si la langue détectée n'est pas configurée
    interpolation: {
      escapeValue: false, // Pas besoin d'échapper les valeurs dans React
    },
  });

export default i18n;
