import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from 'react-i18next';

import splash from '../../../../assets/splash.png';
import { Snackbar, Provider as PaperProvider } from 'react-native-paper'; // Importer Snackbar

import ResetPasswordService from "../../../Services/PasswordServices/ResetPasswordService";
import styles from './Styles';
import { validatePassword } from "../../../Configurations/Validators";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation pour le formulaire
  const buttonScale = useState(new Animated.Value(1))[0]; // Animation pour le bouton

  const [snackbarVisible, setSnackbarVisible] = useState(false); // État pour gérer la visibilité du Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message du Snackbar
  const [snackbarType, setSnackbarType] = useState("default"); 

  const {t} = useTranslation();

  // Animation d'apparition du formulaire
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

    // Afficher un Snackbar
    const showSnackbar = (message, type = "default") => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
      };
    

  const handleValidate = async () => {
    if (!validatePassword(password)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères, une lettre, un chiffre et un caractère spécial.');
      showSnackbar("Le mot de passe doit contenir au moins 6 caractères, une lettre, un chiffre et un caractère spécial.", "warning");
      return;
    }

    setIsLoading(true);

    // Animation du bouton lors du clic
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const resetEmail = await AsyncStorage.getItem("reset");
    try {
      const response = await ResetPasswordService.NewPassword(resetEmail.toLowerCase(), password);
      if (response) {
        // Alert.alert("Succès", "Mot de passe mis à jour !", [
        //   { text: "OK", onPress: () => navigation.navigate('Login') }
        // ]);
        showSnackbar("Mot de passe mis à jour !", "success");
        navigation.navigate('Login');

        await AsyncStorage.removeItem("reset");
      } else {
        // Alert.alert("Erreur", "Erreur lors de la mise à jour du mot de passe.");
        showSnackbar("Erreur lors de la mise à jour du mot de passe.", "error");
      }
    } catch (error) {
      console.error("Erreur", error);
    //   Alert.alert("Erreur", "Erreur lors de la mise à jour du mot de passe.");
        showSnackbar("Erreur lors de la mise à jour du mot de passe.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
 <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.container1}>
        <Image source={splash} style={styles.image} />
      </View>

      <Animated.View style={[styles.container2, { opacity: fadeAnim }]}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('new password')}</Text>
          <Text style={styles.subtitle}>{t('enter new mdp')}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.activeButton}
              onPress={handleValidate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.activeText}>{t('valide btn')}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
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