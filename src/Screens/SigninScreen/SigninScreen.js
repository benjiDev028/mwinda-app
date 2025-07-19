import React, { useState, useEffect } from 'react';
import {Alert,Image,Text,TouchableOpacity,View,TextInput,ScrollView,KeyboardAvoidingView,Platform,TouchableWithoutFeedback,Keyboard,Animated,ActivityIndicator,Easing} from 'react-native';
import splash from '../../../assets/img/splash.png';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';
import { useTranslation } from 'react-i18next';
import UserService from '../../Services/UserServices/UserService';

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

export default function SignIn() {
  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [date_birth, setDate_birth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();

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

 const handleLogin = async () => {
    if (Firstname === '' || Lastname === '' || Email === '' || Password === '' || date_birth === '') {
      Alert.alert('Avertissement', 'Tous les champs sont obligatoires.');
      return;
    }

    if (!validateEmail(Email)) {
      Alert.alert('Avertissement', 'Veuillez entrer un email valide.');
      return;
    }

    if (!validatePassword(Password)) {
      Alert.alert('Avertissement', 'Le mot de passe doit contenir au moins 6 caractères, une lettre, un chiffre et un caractère spécial.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await UserService.Register(Firstname, Lastname, Email.toLowerCase(), Password, date_birth);

      if (response.success) {
        alert("Vous êtes bien inscrit");
        navigation.navigate("Login");
      } else {
        if (response.status === "EMAIL_ALREADY_REGISTERED") {
          Alert.alert('Avertissement', 'L\'email est déjà enregistré. Veuillez utiliser un autre email.');
        } else {
          Alert.alert('Avertissement', response.error || "Une erreur est survenue, veuillez réessayer.");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert('Avertissement', "Une erreur est survenue. Veuillez vérifier votre connexion ou réessayer plus tard.");
    }finally{
      setIsLoading(false);
    }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

          <ScrollView 
            contentContainerStyle={styles.container2}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
              <Text style={styles.title}>{t('signin')}</Text>

              <Text style={styles.label}>{t('firstname')}</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={setFirstname} 
                placeholder={t('firstname')}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{t('lastname')}</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={setLastname} 
                placeholder={t('lastname')}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{t('email')}</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={setEmail} 
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />

              <Text style={styles.label}>{t('date_birth')}</Text>
              <TextInput 
                style={styles.input}
                onChangeText={setDate_birth}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>{t('password')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.activeButton} 
                onPress={handleLogin}
                activeOpacity={0.9}
                desabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ):( <Text style={styles.activeText}>{t('create account button')}</Text>)}
                
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.6}
              >
                <Text style={styles.already}>
                {t('already have an account')}{' '}
                  <Text style={styles.connexion}>{t('connexion')}</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

