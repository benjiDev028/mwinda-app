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
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Snackbar, Provider as PaperProvider } from 'react-native-paper';
import splash from "../../../../assets/img/splash.png";
import ResetPasswordService from "../../../Services/PasswordServices/ResetPasswordService";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./Styles";
import { useTranslation } from 'react-i18next';

export default function CheckEmailScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("default");
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const { t } = useTranslation();

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

  const showSnackbar = (message, type = "default") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleValidate = async () => {
    if (email === "") {
      showSnackbar(t('enter_email_warning'), "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await ResetPasswordService.CheckEmail(email.toLowerCase());
      if (response) {
        await AsyncStorage.setItem("reset", email);
        showSnackbar(t('code_sent_success'), "success");
        setTimeout(() => {
          navigation.navigate("verification");
        }, 2000);
      } else {
        showSnackbar(t('email_not_exist_error'), "error");
      }
    } catch (error) {
      console.log("error", error);
      showSnackbar(t('email_validation_error'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Snackbar positionné en haut avec marge pour la barre de statut */}
            <View style={styles.snackbarContainer}>
              <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={[
                  styles.snackbar,
                  snackbarType === "success" && styles.successSnackbar,
                  snackbarType === "error" && styles.errorSnackbar,
                ]}
                wrapperStyle={styles.snackbarWrapper}
              >
                <Text style={styles.snackbarText}>{snackbarMessage}</Text>
              </Snackbar>
            </View>

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
                placeholder={t('email_placeholder')}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

