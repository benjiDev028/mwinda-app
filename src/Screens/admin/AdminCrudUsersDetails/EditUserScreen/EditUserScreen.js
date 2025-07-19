import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  ActivityIndicator, 
  Text, 
  Snackbar,
  Avatar,
  IconButton,
  HelperText
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import UserService from '../../../../Services/UserServices/UserService';
import { AuthContext } from '../../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const EditUserScreen = ({ route }) => {
  const navigation = useNavigation();
  const { authToken } = useContext(AuthContext);
  const { id } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_birth: '',
    role: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Validation
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = () => {
    return (
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      isEmailValid(formData.email) &&
      formData.role.trim()
    );
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await UserService.GetUserById(id);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          date_birth: userData.date_birth || '',
          role: userData.role || ''
        });
        setOriginalData(userData);
      } catch (error) {
        setError("Erreur lors de la récupération des données utilisateur.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('date_birth', formattedDate);
    }
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      setError("Veuillez remplir tous les champs requis correctement.");
      return;
    }

    setSaving(true);
    try {
      await UserService.updateUser(id, formData, authToken);
      setSuccess("Modifications enregistrées avec succès !");
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setError("Erreur lors de la mise à jour de l'utilisateur.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#FEC109" />
        <Text style={styles.loadingText}>Chargement des données utilisateur...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.header}>Modifier le profil</Text>
          <Avatar.Icon 
            size={48} 
            icon="account-edit" 
            style={styles.avatar} 
            color="#FEC109"
          />
        </View>

        <TextInput
          label="Prénom *"
          mode="outlined"
          value={formData.first_name}
          onChangeText={(text) => handleChange('first_name', text)}
          style={styles.input}
          error={touchedFields.first_name && !formData.first_name.trim()}
          left={<TextInput.Icon name="account" color="#9E9E9E" />}
        />
        {touchedFields.first_name && !formData.first_name.trim() && (
          <HelperText type="error" visible={true}>
            Ce champ est requis
          </HelperText>
        )}

        <TextInput
          label="Nom *"
          mode="outlined"
          value={formData.last_name}
          onChangeText={(text) => handleChange('last_name', text)}
          style={styles.input}
          error={touchedFields.last_name && !formData.last_name.trim()}
          left={<TextInput.Icon name="account" color="#9E9E9E" />}
        />
        {touchedFields.last_name && !formData.last_name.trim() && (
          <HelperText type="error" visible={true}>
            Ce champ est requis
          </HelperText>
        )}

        <TextInput
          label="Email *"
          mode="outlined"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          style={styles.input}
          error={touchedFields.email && !isEmailValid(formData.email)}
          left={<TextInput.Icon name="email" color="#9E9E9E" />}
        />
        {touchedFields.email && !isEmailValid(formData.email) && (
          <HelperText type="error" visible={true}>
            Email invalide
          </HelperText>
        )}

        <TextInput
          label="Date de naissance"
          mode="outlined"
          value={formData.date_birth}
          onFocus={() => setShowDatePicker(true)}
          style={styles.input}
          left={<TextInput.Icon name="calendar" color="#9E9E9E" />}
        />
        {showDatePicker && (
          <DateTimePicker
            value={formData.date_birth ? new Date(formData.date_birth) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <TextInput
          label="Rôle *"
          mode="outlined"
          value={formData.role}
          onChangeText={(text) => handleChange('role', text)}
          style={styles.input}
          error={touchedFields.role && !formData.role.trim()}
          left={<TextInput.Icon name="badge-account-horizontal" color="#9E9E9E" />}
        />
        {touchedFields.role && !formData.role.trim() && (
          <HelperText type="error" visible={true}>
            Ce champ est requis
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          loading={saving}
          disabled={!hasChanges || !isFormValid() || saving}
          icon="content-save"
          labelStyle={styles.buttonLabel}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>

        {!hasChanges && (
          <Text style={styles.noChangesText}>Aucune modification détectée</Text>
        )}
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{ label: 'OK', onPress: () => setError('') }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#121212',
    flex: 1,
    textAlign: 'center',
  },
  avatar: {
    backgroundColor: '#FFF8E1',
    marginLeft: 10,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: '#FEC109',
  },
  buttonLabel: {
    color: '#121212',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#9E9E9E',
  },
  noChangesText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
});

export default EditUserScreen;