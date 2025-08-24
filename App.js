import './src/translations/i18n';
import './src/Configurations/ReactotronConfig';
import SplashScreen from './src/Screens/SplashScreenView';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { useEffect, useState } from 'react';
import MainNavigator from './src/navigation/MainNavigator';
import { NavigationContainer } from '@react-navigation/native';

// 👉 ajoute ça
import { useRateApp } from './src/hooks/useReteApp';

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  // 👉 hook pour la note
  const { incrementLaunch, maybeAskForReview } = useRateApp();

  // Compter chaque lancement d’app
  useEffect(() => {
    incrementLaunch();
  }, []);

  // Masquer le splash après 3s
  useEffect(() => {
    const t = setTimeout(() => setIsShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Quand le splash disparaît, tenter un prompt (respecte MIN_LAUNCHES + cooldown)
  useEffect(() => {
    if (!isShowSplash) {
      // tu peux déplacer cet appel après une action “succès” si tu veux être plus fin
      maybeAskForReview();
    }
  }, [isShowSplash]);

  console.tron?.log?.('Reactotron works');

  return (
    <AuthProvider>
      <NavigationContainer>
        {isShowSplash ? <SplashScreen /> : <MainNavigator />}
      </NavigationContainer>
    </AuthProvider>
  );
}
