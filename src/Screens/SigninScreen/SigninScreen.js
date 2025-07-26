import React, { useState, useEffect } from 'react';
import {Alert,Image,Text,TouchableOpacity,View,TextInput,ScrollView,KeyboardAvoidingView,Platform,TouchableWithoutFeedback,Keyboard,Animated,ActivityIndicator,Easing,Modal} from 'react-native';
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

const validateDate = (dateString) => {
  // Vérifier le format DD/MM/YYYY
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) {
    return { isValid: false, message: 'Le format de la date doit être DD/MM/YYYY.' };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Vérifier la validité des valeurs
  if (month < 1 || month > 12) {
    return { isValid: false, message: 'Le mois doit être compris entre 01 et 12.' };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, message: 'Le jour doit être compris entre 01 et 31.' };
  }

  // Vérifier les jours selon le mois
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Gestion des années bissextiles
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeapYear) {
    daysInMonth[1] = 29;
  }

  if (day > daysInMonth[month - 1]) {
    return { isValid: false, message: `Le mois ${month.toString().padStart(2, '0')} ne peut pas avoir ${day} jours.` };
  }

  // Créer un objet Date pour validation finale
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { isValid: false, message: 'Date invalide.' };
  }

  // Vérifier que la date n'est pas dans le futur
  const today = new Date();
  if (date > today) {
    return { isValid: false, message: 'La date de naissance ne peut pas être dans le futur.' };
  }

  // Vérifier l'âge minimum (par exemple, 13 ans)
  const minAge = 13;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - minAge);
  
  if (date > minDate) {
    return { isValid: false, message: `Vous devez avoir au moins ${minAge} ans pour vous inscrire.` };
  }

  // Vérifier l'âge maximum raisonnable (par exemple, 120 ans)
  const maxAge = 120;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - maxAge);
  
  if (date < maxDate) {
    return { isValid: false, message: 'Veuillez vérifier votre date de naissance.' };
  }

  return { isValid: true, message: '' };
};

export default function SignIn() {
  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [date_birth, setDate_birth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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

  // Fonction pour formater automatiquement la date pendant la saisie
  const handleDateChange = (text) => {
    // Supprimer tous les caractères non numériques
    let cleanText = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres
    if (cleanText.length > 8) {
      cleanText = cleanText.substring(0, 8);
    }
    
    // Ajouter les slashes automatiquement
    if (cleanText.length >= 3 && cleanText.length <= 4) {
      cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
    } else if (cleanText.length > 4) {
      cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2, 4) + '/' + cleanText.substring(4);
    }
    
    setDate_birth(cleanText);
  };

  const handleLogin = async () => {
    if (Firstname === '' || Lastname === '' || Email === '' || Password === '' || date_birth === '') {
      Alert.alert('Avertissement', 'Tous les champs sont obligatoires.');
      return;
    }

    if (!validateEmail(Email)) {
      Alert.alert('Avertissement', 'Veuillez entrer un email valide.');
      return;
    }

    // Validation de la date de naissance
    const dateValidation = validateDate(date_birth);
    if (!dateValidation.isValid) {
      Alert.alert('Avertissement', dateValidation.message);
      return;
    }

    if (!validatePassword(Password)) {
      Alert.alert('Avertissement', 'Le mot de passe doit contenir au moins 6 caractères, une lettre, un chiffre et un caractère spécial.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Avertissement', 'Vous devez accepter les termes et conditions d\'utilisation.');
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
    } finally {
      setIsLoading(false);
    }
  };

  const renderTermsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Termes et Conditions d'Utilisation</Text>
              <TouchableOpacity 
                onPress={() => setShowTermsModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.termsText}>

                <Text style={styles.termsTitle}>1. Acceptation des Termes{'\n\n'}</Text>
                En utilisant cette application fournie par Mwinda, SARL, dont le siège est à Kinshasa (République Démocratique du Congo), vous acceptez d'être lié par ces conditions générales d'utilisation, ainsi que par notre Politique de Confidentialité.{'\n\n'}

                <Text style={styles.termsTitle}>2. Description du Service{'\n\n'}</Text>
                Cette application permet à Mwinda de gérer sa clientèle et d'assurer un système de fidélité par accumulation de points après chaque service. À l'atteinte d'un certain nombre de points, vous pouvez bénéficier de services gratuits, selon le barème défini dans l'app.{'\n\n'}

                <Text style={styles.termsTitle}>3. Compte Utilisateur & Sécurité{'\n\n'}</Text>
                Vous êtes responsable de la confidentialité de vos identifiants. Toute activité sous votre compte vous est imputable : signalez immédiatement toute utilisation non autorisée à notre support.{'\n\n'}

                <Text style={styles.termsTitle}>4. Utilisation Acceptable{'\n\n'}</Text>
                Vous vous engagez à utiliser l'application légalement, sans porter atteinte aux droits des tiers, ni introduire de code malveillant ou perturber le service.{'\n\n'}

                <Text style={styles.termsTitle}>5. Propriété Intellectuelle{'\n\n'}</Text>
                Tous les contenus (logos, textes, codes sources, designs) sont la propriété exclusive de Mwinda. Toute reproduction, distribution ou rediffusion est interdite sans autorisation écrite préalable.{'\n\n'}

                <Text style={styles.termsTitle}>6. Programme de Fidélité{'\n\n'}</Text>
                Les points sont cumulés automatiquement après chaque service effectué. À l'atteinte du **seuil de points** que vous définissez dans l'app, vous pourrez échanger vos points contre des services gratuits. Les modalités (seuil, type de service) sont consultables dans la section « Mon compte » de l'app.{'\n\n'}

                <Text style={styles.termsTitle}>7. Confidentialité & Données Personnelles{'\n\n'}</Text>
                Nous collectons et traitons vos données conformément à notre Politique de Confidentialité. Les données ne seront **ni vendues, ni échangées**, ni cédées à des tiers sans votre consentement explicite.{'\n\n'}

                <Text style={styles.termsTitle}>8. Cookies & Technologies Similaires{'\n\n'}</Text>
                Nous utilisons des cookies et technologies similaires pour optimiser votre expérience. Vous pouvez configurer ou désactiver ces traitements depuis les paramètres de votre appareil.{'\n\n'}

                <Text style={styles.termsTitle}>9. Limitation de Responsabilité{'\n\n'}</Text>
                L'application est fournie « en l'état », sans aucune garantie expresse ou implicite. Notre responsabilité est limitée au montant des frais que vous avez payés au cours des 12 derniers mois.{'\n\n'}

                <Text style={styles.termsTitle}>10. Indemnisation{'\n\n'}</Text>
                Vous vous engagez à indemniser Mwinda contre toute réclamation, dommage ou dépense résultant de votre utilisation non conforme de l'application.{'\n\n'}

                <Text style={styles.termsTitle}>11. Durée & Résiliation{'\n\n'}</Text>
                Ces conditions s'appliquent dès votre première connexion. Nous nous réservons le droit de suspendre ou résilier votre accès en cas de violation, sans préavis et sans remboursement.{'\n\n'}

                <Text style={styles.termsTitle}>12. Loi Applicable & Litiges{'\n\n'}</Text>
                Ces CGU sont régies par le droit de la République Démocratique du Congo. Tout litige sera soumis à la compétence exclusive des tribunaux de Kinshasa.{'\n\n'}

                <Text style={styles.termsTitle}>13. Contact & Support{'\n\n'}</Text>
                Pour toute question ou réclamation, contactez-nous à mwindaphotographie@gmail.com ou via l'assistance intégrée à l'application.
              </Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
            >
              <Text style={styles.acceptButtonText}>J'accepte les termes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
                value={Firstname}
              />

              <Text style={styles.label}>{t('lastname')}</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={setLastname} 
                placeholder={t('lastname')}
                placeholderTextColor="#999"
                value={Lastname}
              />

              <Text style={styles.label}>{t('email')}</Text>
              <TextInput 
                style={styles.input} 
                onChangeText={setEmail} 
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={Email}
                autoCapitalize="none"
              />

              <Text style={styles.label}>{t('date_birth')}</Text>
              <TextInput 
                style={styles.input}
                onChangeText={handleDateChange}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={date_birth}
                maxLength={10}
              />

              <Text style={styles.label}>{t('password')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                onChangeText={setPassword}
                secureTextEntry
                value={Password}
              />

              {/* Section Termes et Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    J'accepte les{' '}
                    <Text 
                      style={styles.termsLink}
                      onPress={() => setShowTermsModal(true)}
                    >
                      termes et conditions d'utilisation
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.activeButton, (!acceptedTerms || isLoading) && styles.disabledButton]} 
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : ( 
                  <Text style={styles.activeText}>{t('create account button')}</Text>
                )}
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

          {renderTermsModal()}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}