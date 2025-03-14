import React, { useState, useEffect ,useContext} from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../../../../Services/UserServices/UserService';
import LoyaltyService from '../../../../Services/LoyaltyServices/LoyaltyService';
import { AuthContext } from '../../../../context/AuthContext';

const UserDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { id: id_admin} = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

 
    const fetchUserDetails = async () => {
      try {
        const userData = await UserService.GetUserById(id);
        setUser(userData);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError('Erreur lors du chargement des détails de l utilisateur.');
      } finally {
        setLoading(false);
      }
    };
  

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

const redeemPoints_event = async () => {
  try {
      await LoyaltyService.GotYourPoint(id,id_admin, "Event"); // Service peut être paramétré selon besoin
      Alert.alert('Points réclamés avec succès','',[
        {
          text: 'Ok',
          onPress: ()=>{
          fetchUserDetails();
          },
        }
      ]);
    
  } catch (error) {
      Alert.alert('Erreur lors de la réclamation des points');
  }
};
const redeemPoints_studio = async () => {
  try {
      await LoyaltyService.GotYourPoint(id,id_admin, "Studio"); // Service peut être paramétré selon besoin
      Alert.alert('Points réclamés avec succès','',[
        {
          text: 'Ok',
          onPress: ()=>{
          fetchUserDetails();
          },
        }
      ]);
   
    
  } catch (error) {
      Alert.alert('uuErreur lors de la réclamation des points');
  }
};



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Utilisateur non trouvé'}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Text style={styles.header}>Détails de l'utilisateur</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nom: <Text style={styles.value}>{user.first_name} {user.last_name}</Text></Text>
        <Text style={styles.label}>Email: <Text style={styles.value}>{user.email}</Text></Text>
        <Text style={styles.label}>Creation du compte: <Text style={styles.value}>{user.created_at}</Text></Text>
        {!user.is_email_verified && <Text style={styles.warningText}>Compte désactivé: Email non vérifié</Text>}
        <Text style={styles.label}>Code : <Text style={styles.value}>{user.barcode}</Text></Text>
        <Text style={styles.label}>Points Événements: <Text style={styles.value}>{user.pointevents}</Text></Text>
        <Text style={styles.label}>Points Studios: <Text style={styles.value}>{user.pointstudios}</Text></Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.rewardButton, { opacity: user.pointevents >= 40000 ? 1 : 0.5 }]} 
          disabled={user.pointevents < 40000}
          onPress={redeemPoints_event}>
          <Text style={styles.buttonText}>Donner Récompense (Événements)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.rewardButton, { opacity: user.pointstudios >= 5000 ? 1 : 0.5 }]} 
          disabled={user.pointstudios < 5000}
          onPress={redeemPoints_studio}>
          <Text style={styles.buttonText}>Donner Récompense (Studios)</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 3 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  value: { fontSize: 16, fontWeight: 'normal' },
  warningText: { color: 'red', fontWeight: 'bold', marginTop: 10 },
  actionsContainer: { marginTop: 20 },
  rewardButton: { padding: 15, backgroundColor: '#4CAF50', borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { color: 'red', textAlign: 'center', fontSize: 16 },
});

export default UserDetailsScreen;
