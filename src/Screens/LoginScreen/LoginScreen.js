import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  Alert,
  Animated,
  Platform,
  Easing
} from 'react-native';
import { Snackbar, Provider as PaperProvider } from 'react-native-paper'; // Importer Snackbar

import styles from './Styles';
import splash from '../../../assets/img/splash.png';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';


export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false); // État pour gérer la visibilité du Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message du Snackbar
  const [snackbarType, setSnackbarType] = useState("default"); 
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

   // Afficher un Snackbar
   const showSnackbar = (message, type = "default") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };



  const handleLogin = async () => {
    if(email ==='' || password==='') {
      
      showSnackbar("Veuillez remplir tous les champs", "warning");
      Alert.alert("Avertissement", "Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      const { token, userRole } = await login(email.toLowerCase(), password);
      if (userRole === 'admin') {
        showSnackbar("Connexion réussie", "success");
        navigation.navigate('AdminHome');
      } else if (userRole === 'client') {
        showSnackbar("Connexion réussie", "success");
        navigation.navigate('ClientHome');
      }
    } catch (error) {
      showSnackbar("Email ou mot de passe incorrect", "error");
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
      setPassword('');
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.container1,
            { 
              transform: [{ translateY: slideAnim }], 
              opacity: fadeAnim 
            }
          ]}
        >
          <Image source={splash} style={styles.image} />
        </Animated.View>

        <Animated.View 
          style={[styles.container2, { opacity: fadeAnim }]}
        >
          <View style={styles.form}>
            <Text style={styles.title}>{t('login')}</Text>

            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Email@gmail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{t('password')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.activeButton} 
                onPress={handleLogin}
                activeOpacity={0.9}
                desabled={isLoading}
                
              >
                {isLoading ? ( 
                   
                  <ActivityIndicator color="#FFFFFF" /> 
                ) : ( 
                  <Text style={styles.activeText}>{t('login')}</Text>
                )}
                
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('signin')}
                activeOpacity={0.6}
              >
                <Text style={styles.secondaryText}>{t('signin')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('check-email')}
              activeOpacity={0.6}
            >
              <Text style={styles.linkText}>{t('forgot password')} ?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
     </KeyboardAvoidingView>

       <Snackbar
               visible={snackbarVisible}
               onDismiss={() => setSnackbarVisible(false)}
               duration={3000} // Durée d'affichage du Snackbar
               style={{
                 backgroundColor:
                   snackbarType === "success"
                     ? "#4CAF50" // Vert pour le succès
                     : snackbarType === "error"
                     ? "#F44336" // Rouge pour les erreurs
                     : snackbarType === "warning"
                     ? "#FFC107" // Jaune pour les avertissements
                     : "#333", // Couleur par défaut
               }}
               
             >
{snackbarMessage}
             </Snackbar>
        
     </PaperProvider>
  );
}