import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Platform, 
  Keyboard, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { API_URL, PORT_USER } from '@env'
import splash from '../../../../assets/splash.png';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../../context/AuthContext';
import AuthService from '../../../Services/UserServices/AuthService';
import UserService from '../../../Services/UserServices/UserService';

const { width } = Dimensions.get('window');

import AsyncStorage from '@react-native-async-storage/async-storage';

// const url = "http://192.168.2.13:8002";
const url = `${API_URL}${PORT_USER}`

const INPUT_FIELDS = [
  { label: 'Firstname', key: 'firstname', placeholder: 'Firstname', secure: false, required: true },
  { label: 'Lastname', key: 'lastname', placeholder: 'Lastname', secure: false, required: true },
  { label: 'Email', key: 'email', placeholder: 'johndoe@gmail.com', secure: false, required: true },
  { label: 'Date of Birth', key: 'date_birth', placeholder: 'DD/MM/YYYY', secure: false, required: true },
];

export default function ClientProfileScreen() {
  const { authToken, id, logout } = useContext(AuthContext);
  
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    date_birth: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Fonction pour formater automatiquement la date pendant la saisie
  const handleDateChange = (text) => {
    // Supprimer tous les caractères non numériques
    let cleanText = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres
    if (cleanText.length > 8) {
      cleanText = cleanText.substring(0, 8);
    }
    
    // Ajouter les slashes automatiquement pour le format DD/MM/YYYY
    if (cleanText.length >= 3 && cleanText.length <= 4) {
      cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
    } else if (cleanText.length > 4) {
      cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2, 4) + '/' + cleanText.substring(4);
    }
    
    updateField('date_birth', cleanText);
  };

  // Fonction pour convertir DD/MM/YYYY vers YYYY-MM-DD
  const formatDateForAPI = (dateString) => {
    if (!dateString || dateString.length !== 10) return '';
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Fonction pour convertir YYYY-MM-DD vers DD/MM/YYYY
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return '';
    
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  // Fonction pour valider le format de date DD/MM/YYYY
  const isValidDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return false;
    
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const [, day, month, year] = match;
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() == year && 
           date.getMonth() == month - 1 && 
           date.getDate() == day;
  };

  const updateField = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    INPUT_FIELDS.forEach(({ key, required }) => {
      if (required && !userData[key].trim()) {
        newErrors[key] = 'This field is required';
      }
    });
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!userData.date_birth.trim()) {
      newErrors.date_birth = 'Date of birth is required';
    } else if (!isValidDate(userData.date_birth)) {
      newErrors.date_birth = 'Please enter a valid date in DD/MM/YYYY format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEditing = () => {
    if (isEditing) {
      handleSaveChanges();
    } else {
      setIsEditing(true);
      setErrors({});
    }
  };

  const handleSaveChanges = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    
    try {
      const updateUser = await UserService.updateUser(id, {
        first_name: userData.firstname,
        last_name: userData.lastname,
        email: userData.email,
        date_birth: formatDateForAPI(userData.date_birth), // Convertir vers YYYY-MM-DD pour l'API
      }, authToken);

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

  const cancelEditing = () => {
    setIsEditing(false);
    setErrors({});
    getUserData();
  };
  
  const getUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/identity/get_user_by_id/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          firstname: data.first_name || '',
          lastname: data.last_name || '',
          email: data.email || '',
          date_birth: formatDateFromAPI(data.date_birth) || '', // Convertir vers DD/MM/YYYY pour l'affichage
        });
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, authToken]);

  useEffect(() => {
    if (authToken && id) {
      getUserData();
    }
  }, [authToken, id, getUserData]);

  const renderInputField = ({ label, key, placeholder, secure, required }) => (
    <View key={key} style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          errors[key] && styles.inputError,
          !isEditing && styles.inputDisabled
        ]}
        placeholder={placeholder}
        value={userData[key]}
        onChangeText={key === 'date_birth' ? handleDateChange : (value) => updateField(key, value)}
        editable={isEditing}
        secureTextEntry={secure}
        placeholderTextColor="#999"
        keyboardType={key === 'date_birth' ? 'numeric' : 'default'}
        maxLength={key === 'date_birth' ? 10 : undefined}
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image source={splash} style={styles.logo} />
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <MaterialCommunityIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://www.pngall.com/wp-content/uploads/5/Profile-Avatar-PNG-Free-Image.png' }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.editPhotoButton}
              onPress={() => Alert.alert("Photo Upload", "Photo upload functionality coming soon!")}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {INPUT_FIELDS.map(renderInputField)}
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                onPress={toggleEditing} 
                style={[
                  styles.button, 
                  styles.primaryButton,
                  isSaving && styles.buttonDisabled
                ]}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={isEditing ? "check" : "pencil"}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.buttonText}>
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              {isEditing && (
                <TouchableOpacity 
                  onPress={cancelEditing} 
                  style={[styles.button, styles.secondaryButton]}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#333" />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback> 
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 180,
    backgroundColor: '#FEC109',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.2,
    resizeMode: 'contain',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginTop: -60,
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
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
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FEC109',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    marginHorizontal: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#fff9f9',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonGroup: {
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#FEC109',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#333',
  },
});