import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View, Text, Image, Platform, Keyboard, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Alert,
  ActivityIndicator, StyleSheet
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResponsive } from '../../../Utils/responsive';
import splash from '../../../../assets/splash.png';

import { AuthContext } from '../../../context/AuthContext';
import UserService from '../../../Services/UserServices/UserService';
import Constants from 'expo-constants';

// ⚠️ key est réservé par React -> on utilise name
const INPUT_FIELDS = [
  { label: 'Firstname',     name: 'firstname',   placeholder: 'Firstname',         secure: false, required: true },
  { label: 'Lastname',      name: 'lastname',    placeholder: 'Lastname',          secure: false, required: true },
  { label: 'Email',         name: 'email',       placeholder: 'johndoe@gmail.com', secure: false, required: true },
  { label: 'Date of Birth', name: 'date_birth',  placeholder: 'DD/MM/YYYY',        secure: false, required: true },
];

export default function ClientProfileScreen() {
  const { authToken, id, logout } = useContext(AuthContext);
  const r = useResponsive();
  const styles = useMemo(() => makeStyles(r), [r]);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? 'https://mwinda.core-techs.ca';
  //const apiUrl = "http://192.168.2.13:8002";

  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    date_birth: '',      // affichage masqué "DD/MM/YYYY"
    date_birth_iso: '',  // "YYYY-MM-DD" prêt pour l'API
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState({});

  // ————— helpers date —————
  const formatDateForAPI = (s) => {
    // "DD/MM/YYYY" -> "YYYY-MM-DD"
    if (!s || s.length !== 10) return '';
    const [d,m,y] = s.split('/');
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  };

  const formatDateFromAPI = (s) => {
    // "YYYY-MM-DD" (ou "YYYY-MM-DDTHH:mm:ssZ") -> "DD/MM/YYYY"
    if (!s || typeof s !== 'string') return '';
    if (s.includes('T')) s = s.split('T')[0];
    const parts = s.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
    }
    if (s.includes('/')) return s; // si déjà "DD/MM/YYYY"
    return '';
  };

  const isValidDate = (s) => {
    if (!s || s.length !== 10) return false;
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return false;
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const ok =
      d.getFullYear() === Number(yyyy) &&
      d.getMonth() === Number(mm) - 1 &&
      d.getDate() === Number(dd);
    if (!ok) return false;
    if (Number(yyyy) < 1900) return false;
    if (d > new Date()) return false; // pas dans le futur
    return true;
  };

  const setError = (name, message) => {
    setErrors(prev => ({ ...prev, [name]: message || '' }));
  };

  const updateField = (name, value) => {
    setUserData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handler pour MaskedTextInput (date)
  const handleDateChange = (formatted /* "DD/MM/YYYY" */, raw /* "DDMMYYYY" */) => {
    updateField('date_birth', formatted);
    setError('date_birth', null);

    if (formatted.length === 10 && isValidDate(formatted)) {
      updateField('date_birth_iso', formatDateForAPI(formatted)); // "YYYY-MM-DD"
    } else {
      updateField('date_birth_iso', '');
    }
  };

  const validateForm = () => {
    const e = {};
    INPUT_FIELDS.forEach(({ name, required }) => {
      if (required && !String(userData[name] ?? '').trim()) e[name] = 'This field is required';
    });
    if (!userData.email?.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) e.email = 'Please enter a valid email address';

    if (!userData.date_birth?.trim()) e.date_birth = 'Date of birth is required';
    else if (!isValidDate(userData.date_birth)) e.date_birth = 'Please enter a valid date in DD/MM/YYYY format';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleEditing = () => {
    if (isEditing) handleSaveChanges();
    else { setIsEditing(true); setErrors({}); }
  };

  const handleSaveChanges = useCallback(async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const dobISO = userData.date_birth_iso || formatDateForAPI(userData.date_birth);
      const updateUser = await UserService.updateUser(
        id,
        {
          first_name: userData.firstname,
          last_name:  userData.lastname,
          email:      userData.email,
          date_birth: dobISO, // "YYYY-MM-DD"
        },
        authToken
      );
      if (updateUser) {
        Alert.alert("Success", "Your profile has been updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [userData, id, authToken]);

  const confirmDeleteUser = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await UserService.deleteUser(id);
              if (response) {
                Alert.alert("Succès", "Votre compte a été supprimé avec succès.");
                logout();
              }
            } catch (error) {
              Alert.alert("Erreur", error.message || "Échec de la suppression. Veuillez réessayer.");
            }
          }
        }
      ]
    );
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrors({});
    getUserData();
  };

  const getUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/identity/get_user_by_id/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to load user data');
      const data = await response.json();
      const displayDOB = formatDateFromAPI(data.date_birth);
      setUserData({
        firstname:  data.first_name ?? '',
        lastname:   data.last_name ?? '',
        email:      data.email ?? '',
        date_birth: displayDOB ?? '',
        date_birth_iso: displayDOB ? formatDateForAPI(displayDOB) : '',
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, authToken, apiUrl]);

  useEffect(() => { if (authToken && id) getUserData(); }, [authToken, id, getUserData]);

  // ————— champ générique ; date utilise MaskedTextInput —————
  const renderInputField = ({ label, name, placeholder, secure, required }) => (
    <View key={name} style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>

      {name === 'date_birth' ? (
        <MaskedTextInput
          mask="99/99/9999" // DD/MM/YYYY
          style={[
            styles.input,
            errors[name] && styles.inputError,
            !isEditing && styles.inputDisabled
          ]}
          placeholder={placeholder ?? 'DD/MM/YYYY'}
          value={userData[name]}
          onChangeText={handleDateChange}
          editable={isEditing}
          keyboardType="numeric"
          maxLength={10}
          placeholderTextColor="#999"
        />
      ) : (
        <TextInput
          style={[
            styles.input,
            errors[name] && styles.inputError,
            !isEditing && styles.inputDisabled
          ]}
          placeholder={placeholder}
          value={userData[name]}
          onChangeText={(v) => updateField(name, v)}
          editable={isEditing}
          secureTextEntry={!!secure}
          placeholderTextColor="#999"
          keyboardType={name === 'email' ? 'email-address' : 'default'}
          autoCapitalize={name === 'email' ? 'none' : 'sentences'}
        />
      )}

      {errors[name] ? <Text style={styles.errorText}>{errors[name]}</Text> : null}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEC109" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={r.isIOS ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={splash} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity onPress={logout} style={styles.logoutButton} accessibilityLabel="Logout">
              <MaterialCommunityIcons name="logout" size={r.ms(20)} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://www.pngall.com/wp-content/uploads/5/Profile-Avatar-PNG-Free-Image.png' }}
              style={styles.profileImage}
              accessible accessibilityLabel="Profile picture"
            />
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={() => Alert.alert("Photo Upload", "Photo upload functionality coming soon!")}
            >
              <MaterialCommunityIcons name="camera" size={r.ms(16)} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Form wrapper */}
          <View style={styles.formOuter}>
            <View style={styles.formContainer}>
              {INPUT_FIELDS.map(renderInputField)}

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  onPress={toggleEditing}
                  style={[styles.button, styles.primaryButton, isSaving && styles.buttonDisabled]}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <>
                        <MaterialCommunityIcons name={isEditing ? "check" : "pencil"} size={r.ms(18)} color="#fff" />
                        <Text style={styles.buttonText}>{isEditing ? "Save Changes" : "Edit Profile"}</Text>
                      </>
                  }
                </TouchableOpacity>

                {isEditing && (
                  <TouchableOpacity onPress={cancelEditing} style={[styles.button, styles.secondaryButton]}>
                    <MaterialCommunityIcons name="close" size={r.ms(18)} color="#333" />
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmDeleteUser}
                >
                  <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (r) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { paddingBottom: r.space.lg },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },

  // Header responsive
  header: {
    height: r.isTablet ? r.vscale(220) : r.vscale(180),
    backgroundColor: '#FEC109',
    borderBottomLeftRadius: r.ms(28),
    borderBottomRightRadius: r.ms(28),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: r.isIOS ? r.space.lg : r.space.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    paddingHorizontal: r.containerPadding,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  deleteButtonText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  logo: { width: r.isTablet ? r.scale(260) : r.scale(160), height: r.isTablet ? r.vscale(80) : r.vscale(60) },

  logoutButton: {
    position: 'absolute',
    top: r.isIOS ? r.space.lg : r.space.md,
    right: r.containerPadding,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: r.ms(20),
    padding: r.space.xs,
  },

  // Avatar
  profileImageContainer: {
    alignSelf: 'center',
    marginTop: -r.ms(60),
    marginBottom: r.space.md,
    width: r.isTablet ? r.ms(140) : r.ms(120),
    height: r.isTablet ? r.ms(140) : r.ms(120),
    borderRadius: r.isTablet ? r.ms(70) : r.ms(60),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 999 },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0, right: 0,
    backgroundColor: '#FEC109',
    width: r.ms(34), height: r.ms(34), borderRadius: r.ms(17),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  // Form centré + maxWidth
  formOuter: { paddingHorizontal: r.containerPadding, marginTop: r.space.md },
  formContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: r.isTablet ? 720 : '100%',
    backgroundColor: '#fff',
    borderRadius: r.ms(14),
    padding: r.space.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  inputContainer: { marginBottom: r.space.md },
  label: { fontSize: r.font.sm, color: '#555', marginBottom: r.space.xs, fontWeight: '500' },
  required: { color: '#F44336' },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: r.ms(8),
    padding: r.ms(14), fontSize: r.font.md, color: '#333', backgroundColor: '#f8f8f8',
  },
  inputError: { borderColor: '#F44336', backgroundColor: '#fff9f9' },
  inputDisabled: { backgroundColor: '#f0f0f0', color: '#666' },
  errorText: { color: '#F44336', fontSize: r.font.xs, marginTop: r.space.xs, marginLeft: r.space.xs },

  buttonGroup: { marginTop: r.space.sm },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: r.ms(14), borderRadius: r.ms(8), marginBottom: r.space.sm,
    gap: r.space.xs,
  },
  primaryButton: { backgroundColor: '#FEC109' },
  secondaryButton: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: r.font.md, fontWeight: '600' },
  secondaryButtonText: { color: '#333' },
});
