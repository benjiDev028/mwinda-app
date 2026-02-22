import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Animated,
  ScrollView,
  RefreshControl,
  Image
} from 'react-native';
import { Linking } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import UserService from '../../../../Services/UserServices/UserService';
import ResetPasswordService from '../../../../Services/PasswordServices/ResetPasswordService';
import LoyaltyService from '../../../../Services/LoyaltyServices/LoyaltyService';
import { AuthContext } from '../../../../context/AuthContext';
import { Link } from '@react-navigation/native';

const UserDetailsScreen = ({ route, navigation }) => {
  // ✅ Sécurisation de l'accès aux paramètres
  const routeParams = route?.params || {};
  const { id } = routeParams;
  
  const authContext = useContext(AuthContext);
  const { id: id_admin } = authContext || {};
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  // ✅ Vérification des paramètres requis
  useEffect(() => {
    if (!id) {
      setError('ID utilisateur manquant');
      setLoading(false);
      return;
    }
    
    if (!id_admin) {
      setError('Session administrateur non valide');
      setLoading(false);
      return;
    }
    
    fetchUserDetails();
  }, [id, id_admin]);

  const fetchUserDetails = async () => {
    // ✅ Double vérification avant l'appel API
    if (!id) {
      setError('ID utilisateur manquant');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('🔍 Récupération des détails pour l\'ID:', id);
      const userData = await UserService.GetUserById(id);
      console.log('✅ Données utilisateur récupérées:', userData);
      
      setUser(userData);
      setError(null);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      setError('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!id) {
      Alert.alert('Erreur', 'ID utilisateur manquant pour actualiser');
      return;
    }
    setRefreshing(true);
    fetchUserDetails();
  };

  const redeemPoints = async (pointType) => {
    // ✅ Vérifications avant l'appel
    if (!id || !id_admin) {
      Alert.alert('Erreur', 'Informations manquantes pour réclamer les points');
      return;
    }

    try {
      console.log(`🎯 Réclamation de points ${pointType} pour:`, { id, id_admin });
      await LoyaltyService.GotYourPoint(id, id_admin, pointType);
      Alert.alert(
        'Succès',
        `Points ${pointType} réclamés avec succès`,
        [{
          text: 'OK',
          onPress: fetchUserDetails
        }]
      );
    } catch (error) {
      console.error(`❌ Erreur réclamation ${pointType}:`, error);
      Alert.alert('Erreur', `Erreur lors de la réclamation des points ${pointType}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return date.toLocaleString('fr-CA', {
        timeZone: localTZ,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('❌ Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  // ✅ Gestion des erreurs de paramètres
  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>ID utilisateur manquant</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEC109" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error || 'Utilisateur non trouvé'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserDetails}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#FEC109']}
          tintColor="#FEC109"
        />
      }
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Détails Utilisateur</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color="#FEC109" />
            </View>
            <Text style={styles.userName}>
              {user.first_name || 'Prénom'} {user.last_name || 'Nom'}
            </Text>
            {!user.is_email_verified && (
              <View style={styles.verificationBadge}>
                <Text style={styles.verificationText}>      Non vérifié</Text>
             <TouchableOpacity
      onPress={() => {
        
      
           ResetPasswordService.ResendEmail(user.email);
            Alert.alert('Succès', 'Email de vérification renvoyé'+user.email);
         
        
      }}
    >
         
   
      <Text style={{ color: '#1976D2', textDecorationLine: 'underline', fontWeight: '600', marginTop: 10 }}>
        Vérifier l’email
      </Text>
    </TouchableOpacity>
                
                
              </View>
            )}
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={20} color="#666" />
              <Text style={styles.detailText}>{user.email || 'Email non disponible'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="date-range" size={20} color="#666" />
              <Text style={styles.detailText}>Créé le: {formatDate(user.created_at)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="code" size={20} color="#666" />
              <Text style={styles.detailText}>Code: {user.barcode || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <View style={styles.pointsCard}>
              <MaterialIcons name="event" size={24} color="#4CAF50" />
              <Text style={styles.pointsLabel}>Points Événements</Text>
              <Text style={styles.pointsValue}>{user.pointevents || 0}</Text>
            </View>
            <View style={styles.pointsCard}>
              <MaterialIcons name="music-note" size={24} color="#2196F3" />
              <Text style={styles.pointsLabel}>Points Studios</Text>
              <Text style={styles.pointsValue}>{user.pointstudios || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.rewardButton, 
              { 
                backgroundColor: (user.pointevents || 0) >= 40000 ? '#4CAF50' : '#E0E0E0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]} 
            disabled={(user.pointevents || 0) < 40000}
            onPress={() => redeemPoints('Event')}
          >
            <MaterialIcons 
              name="event-available" 
              size={20} 
              color={(user.pointevents || 0) >= 40000 ? '#FFF' : '#9E9E9E'} 
            />
            <Text style={[
              styles.buttonText,
              { color: (user.pointevents || 0) >= 40000 ? '#FFF' : '#9E9E9E' }
            ]}>
              Récompense Événements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.rewardButton, 
              { 
                backgroundColor: (user.pointstudios || 0) >= 5000 ? '#2196F3' : '#E0E0E0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]} 
            disabled={(user.pointstudios || 0) < 5000}
            onPress={() => redeemPoints('Studio')}
          >
            <MaterialIcons 
              name="music-video" 
              size={20} 
              color={(user.pointstudios || 0) >= 5000 ? '#FFF' : '#9E9E9E'} 
            />
            <Text style={[
              styles.buttonText,
              { color: (user.pointstudios || 0) >= 5000 ? '#FFF' : '#9E9E9E' }
            ]}>
              Récompense Studios
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FEC109',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  verificationBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pointsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    marginTop: 8,
  },
  rewardButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FEC109',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserDetailsScreen;