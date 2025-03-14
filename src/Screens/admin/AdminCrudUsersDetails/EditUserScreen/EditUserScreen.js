import React, { useState, useEffect,useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text, Snackbar } from 'react-native-paper';
import UserService from '../../../../Services/UserServices/UserService';
import { AuthContext } from '../../../../context/AuthContext';

const EditUserScreen = ({ route, navigation }) => {
    const { authToken } = useContext(AuthContext);
    const { id } = route.params;
    
    
  
  const { id_edit } = route.params; // Récupérer l'ID de l'utilisateur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_birth:''
  });
  const [originalData, setOriginalData] = useState({});
  console.log("dans edit :",id)
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await UserService.GetUserById(id);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          date_birth: userData.date_birth || ''
        });
        setOriginalData(userData);
      } catch (error) {
        setError("Erreur lors de la récupération des données.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleSave = async () => {
    try {
      await UserService.updateUser(id,formData,authToken)
      navigation.goBack(); // Revenir à la page précédente
    } catch (error) {
      setError("Erreur lors de la mise à jour.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#fec107" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Modifier l'utilisateur</Text>

      <TextInput
        label="Prénom"
        mode="outlined"
        value={formData.first_name}
        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
        style={styles.input}
      />
      <TextInput
        label="Nom"
        mode="outlined"
        value={formData.last_name}
        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        disabled
        style={styles.input}
      />
      <TextInput
        label="Date of birth"
        mode="outlined"
        value={formData.date_birth}
        onChangeText={(text) => setFormData({ ...formData, date_birth: text })}
        style={styles.input}
      />
     
      <TextInput
        label="Rôle"
        mode="outlined"
        value={formData.role}
        onChangeText={(text) => setFormData({ ...formData, role: text })}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        disabled={JSON.stringify(formData) === JSON.stringify(originalData)} // Désactiver si rien n'a changé
      >
        Enregistrer
      </Button>

      {/* Affichage des erreurs */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{ label: 'OK', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fec107',
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor :'#fec107'
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fec107',
  },
});

export default EditUserScreen;
