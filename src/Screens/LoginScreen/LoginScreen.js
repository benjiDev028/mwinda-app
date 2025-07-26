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
  Easing,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Snackbar, Provider as PaperProvider } from 'react-native-paper';
import styles from './Styles';
import splash from '../../../assets/img/splash.png';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import AdminTabs from '../../navigation/admin/AdminTabs';

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
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

  const showSnackbar = (message, type = "default") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    if(email === '' || password === '') {
      showSnackbar(t('Veuillez remplir tous les champs'), "warning");
      return;
    }
    
    setIsLoading(true);
    try {
      const { token, userRole } = await login(email.toLowerCase(), password);
      if (userRole === 'admin' || 'superadmin') {
        showSnackbar(t('login_success'), "success");
        navigation.navigate(AdminStack,'Home');
      } else if (userRole === 'client') {
        showSnackbar(t('login_success'), "success");
        navigation.navigate('ClientTabs', 'home');
      }
    } catch (error) {
      showSnackbar(t('Mot de passe ou email incorrect'), "error");
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        {/* Snackbar positionné en haut */}
        <View style={customStyles.snackbarContainer}>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            style={[
              customStyles.snackbar,
              snackbarType === "success" && customStyles.successSnackbar,
              snackbarType === "error" && customStyles.errorSnackbar,
              snackbarType === "warning" && customStyles.warningSnackbar,
            ]}
            wrapperStyle={customStyles.snackbarWrapper}
          >
            <Text style={customStyles.snackbarText}>{snackbarMessage}</Text>
          </Snackbar>
        </View>

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

            <Animated.View style={[styles.container2, { opacity: fadeAnim }]}>
              <View style={styles.form}>
                <Text style={styles.title}>{t('login')}</Text>

                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('joe@example.com')}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  importantForAutofill="yes"
                  autoComplete="email"
                  textContentType="emailAddress"
                />

                <Text style={styles.label}>{t('password')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('password')}
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  importantForAutofill="yes"
                  autoComplete="password"
                  textContentType="password"
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.activeButton} 
                    onPress={handleLogin}
                    activeOpacity={0.9}
                    disabled={isLoading}
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
    </PaperProvider>
  );
}

const customStyles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  snackbarWrapper: {
    top: 0,
    bottom: 'auto',
  },
  snackbar: {
    backgroundColor: '#333',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  warningSnackbar: {
    backgroundColor: '#F44336',
  },
  snackbarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});