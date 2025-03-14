import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Easing,
} from "react-native";
import { Snackbar, Provider as PaperProvider } from 'react-native-paper'; // Importer Snackbar
import splash from "../../../../assets/img/splash.png";
import ResetPasswordService from "../../../Services/PasswordServices/ResetPasswordService";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./Styles";
import { useTranslation } from 'react-i18next';

export default function CheckEmailScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false); // État pour gérer la visibilité du Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message du Snackbar
  const [snackbarType, setSnackbarType] = useState("default"); // Type de Snackbar (pour le style)
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const {t} = useTranslation();

  // Animation au montage du composant
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
      }),
    ]).start();
  }, []);

  // Afficher un Snackbar
  const showSnackbar = (message, type = "default") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Fonction pour valider l'email
  const handleValidate = async () => {
    if (email === "") {
      showSnackbar("Veuillez entrer un email", "warning"); // Afficher un Snackbar d'avertissement
      return;
    }

    setIsLoading(true);

    try {
      const response = await ResetPasswordService.CheckEmail(email.toLowerCase());
      if (response) {
        await AsyncStorage.setItem("reset", email);
        showSnackbar("Code envoyé dans votre email", "success"); // Afficher un Snackbar de succès
        setTimeout(() => {
          navigation.navigate("verification"); // Rediriger après un délai
        }, 2000); // Attendre 2 secondes avant la redirection
      } else {
        showSnackbar("L'email saisi n'existe pas !", "error"); // Afficher un Snackbar d'erreur
      }
    } catch (error) {
      console.log("error", error);
      showSnackbar("Erreur lors de la validation de l'email", "error"); // Afficher un Snackbar d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* Section animée du logo */}
        <Animated.View
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Image source={splash} style={styles.logo} />
        </Animated.View>

        {/* Formulaire */}
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{t('r mdp')}</Text>
          <Text style={styles.subtitle}>
            {t('entrer')}
          </Text>

          {/* Champ de saisie de l'email */}
          <TextInput
            style={styles.input}
            placeholder="Adresse email"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleValidate}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('send code btn')}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Snackbar pour afficher les messages */}
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
          action={{
            label: snackbarType === "success" ? "OK" : "Fermer",
            onPress: () => {
                if (snackbarType === "error") {
                    setSnackbarVisible(false); // Fermer le Snackbar
                } 
                }}}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}