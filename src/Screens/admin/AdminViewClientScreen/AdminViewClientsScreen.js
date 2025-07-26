import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  Alert,
  StyleSheet,
  Platform
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../../../Services/UserServices/UserService';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../context/AuthContext';
import {styles} from "./Styles";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Composant Error Boundary pour capturer les erreurs de rendu
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-triangle" size={50} color="#FF5722" />
          <Text style={styles.errorText}>Une erreur s'est produite</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook personnalisé pour la gestion d'erreurs
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`Erreur dans ${context}:`, error);
    
    // Log détaillé pour le débogage
    if (error?.response?.data) {
      console.error('Données de réponse:', error.response.data);
    }
    
    if (error?.request) {
      console.error('Requête:', error.request);
    }

    // Définir des messages d'erreur user-friendly
    let userMessage = 'Une erreur inattendue s\'est produite.';
    
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
      userMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
    } else if (error?.response?.status === 401) {
      userMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error?.response?.status === 403) {
      userMessage = 'Accès non autorisé.';
    } else if (error?.response?.status === 404) {
      userMessage = 'Ressource non trouvée.';
    } else if (error?.response?.status >= 500) {
      userMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    setError({ message: userMessage, originalError: error, context });
    return userMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsRetrying(false);
  }, []);

  const retry = useCallback((retryFunction) => {
    setIsRetrying(true);
    clearError();
    if (retryFunction) {
      retryFunction();
    }
  }, [clearError]);

  return { error, handleError, clearError, retry, isRetrying };
};

export default function AdminViewClientsScreen() {
  const { authToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isInitialized, setIsInitialized] = useState(false);

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { error, handleError, clearError, retry, isRetrying } = useErrorHandler();

  // Animation pour le bouton de filtre avec gestion d'erreur
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const toggleFilters = useCallback(() => {
    try {
      Animated.timing(rotateAnim, {
        toValue: showFilters ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.linear
      }).start();
      setShowFilters(!showFilters);
    } catch (error) {
      handleError(error, 'toggleFilters');
    }
  }, [showFilters, rotateAnim, handleError]);

  // Charger les favoris avec gestion d'erreur
  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        }
      }
    } catch (error) {
      handleError(error, 'loadFavorites');
      // En cas d'erreur, initialiser avec un tableau vide
      setFavorites([]);
    }
  }, [handleError]);

  // Charger les utilisateurs avec timeout et retry
  const fetchUsers = useCallback(async (isRetry = false) => {
    if (!authToken) {
      handleError(new Error('Token d\'authentification manquant'), 'fetchUsers');
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      
      // Timeout pour éviter les requêtes qui traînent
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: La requête a pris trop de temps')), 15000)
      );

      const dataPromise = UserService.GetUsers(authToken);
      const data = await Promise.race([dataPromise, timeoutPromise]);

      // Validation des données reçues
      if (!Array.isArray(data)) {
        throw new Error('Format de données invalide reçu du serveur');
      }

      // Validation de chaque utilisateur
      const validUsers = data.filter(user => {
        if (!user || typeof user !== 'object') return false;
        if (!user.id || !user.first_name || !user.last_name || !user.email) return false;
        return true;
      });

      setUsers(validUsers);
      setFilteredUsers(validUsers);
      
      if (!isInitialized) {
        await loadFavorites();
        setIsInitialized(true);
      }
      
      clearError();
    } catch (error) {
      const errorMessage = handleError(error, 'fetchUsers');
      
      // En cas d'erreur, garder les données existantes si disponibles
      if (users.length === 0) {
        setUsers([]);
        setFilteredUsers([]);
      }
      
      // Afficher une alerte seulement si ce n'est pas un retry automatique
      if (!isRetry) {
        Alert.alert(
          'Erreur de chargement', 
          errorMessage,
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: () => retry(() => fetchUsers(true)) }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, handleError, clearError, retry, users.length, isInitialized, loadFavorites]);

  // Initialisation avec gestion d'erreur
  useEffect(() => {
    let isMounted = true;

    const initializeScreen = async () => {
      try {
        if (isMounted) {
          await fetchUsers();
        }
      } catch (error) {
        if (isMounted) {
          handleError(error, 'initialization');
        }
      }
    };

    initializeScreen();

    return () => {
      isMounted = false;
    };
  }, []);

  // Rafraîchir la liste avec gestion d'erreur
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchUsers(true);
    } catch (error) {
      handleError(error, 'onRefresh');
    } finally {
      setRefreshing(false);
    }
  }, [fetchUsers, handleError]);

  // Filtrer et trier les utilisateurs avec gestion d'erreur
  useEffect(() => {
    try {
      filterAndSortUsers();
    } catch (error) {
      handleError(error, 'filterAndSortUsers effect');
    }
  }, [filter, searchQuery, sortConfig, users]);

  const handleSearch = useCallback((query) => {
    try {
      if (typeof query === 'string') {
        setSearchQuery(query);
      }
    } catch (error) {
      handleError(error, 'handleSearch');
    }
  }, [handleError]);

  // Basculer les favoris avec gestion d'erreur
  const toggleFavorite = useCallback(async (userId) => {
    try {
      if (!userId) return;
      
      const updatedFavorites = favorites.includes(userId)
        ? favorites.filter((id) => id !== userId)
        : [...favorites, userId];
      
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      handleError(error, 'toggleFavorite');
      // Revenir à l'état précédent en cas d'erreur
      setFavorites(favorites);
    }
  }, [favorites, handleError]);

  // Filtrer et trier les utilisateurs avec validation
  const filterAndSortUsers = useCallback(() => {
    try {
      if (!Array.isArray(users)) {
        console.warn('Users n\'est pas un tableau:', users);
        return;
      }

      let updatedUsers = [...users];

      // Filtrage avec validation
      if (typeof searchQuery === 'string' && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        updatedUsers = updatedUsers.filter((user) => {
          if (!user) return false;
          try {
            const firstName = (user.first_name || '').toLowerCase();
            const lastName = (user.last_name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            
            return firstName.includes(query) || 
                   lastName.includes(query) || 
                   email.includes(query);
          } catch (filterError) {
            console.warn('Erreur lors du filtrage d\'un utilisateur:', filterError, user);
            return false;
          }
        });
      }

      // Filtrage par type avec validation
      if (filter === 'favorites') {
        updatedUsers = updatedUsers.filter((user) => 
          user && favorites.includes(user.id)
        );
      } else if (filter === 'admin') {
        updatedUsers = updatedUsers.filter((user) => 
          user && user.role === 'admin'
        );
      } else if (filter === 'client') {
        updatedUsers = updatedUsers.filter((user) => 
          user && user.role === 'client'
        );
      } else if (filter === 'bonus') {
        updatedUsers = updatedUsers.filter((user) => {
          if (!user) return false;
          const pointstudios = Number(user.pointstudios) || 0;
          const pointevents = Number(user.pointevents) || 0;
          return pointstudios >= 5000 || pointevents >= 40000;
        });
      }

      // Tri avec validation
      if (sortConfig.key && typeof sortConfig.key === 'string') {
        updatedUsers.sort((a, b) => {
          try {
            if (!a || !b) return 0;
            
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            
            // Conversion en string pour comparaison sûre
            aValue = aValue != null ? String(aValue) : '';
            bValue = bValue != null ? String(bValue) : '';
            
            if (aValue < bValue) {
              return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
          } catch (sortError) {
            console.warn('Erreur lors du tri:', sortError);
            return 0;
          }
        });
      }

      setFilteredUsers(updatedUsers);
    } catch (error) {
      handleError(error, 'filterAndSortUsers');
      // En cas d'erreur, utiliser les données originales
      setFilteredUsers(users || []);
    }
  }, [users, searchQuery, filter, favorites, sortConfig, handleError]);

  // Gérer le tri avec validation
  const requestSort = useCallback((key) => {
    try {
      if (!key || typeof key !== 'string') return;
      
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    } catch (error) {
      handleError(error, 'requestSort');
    }
  }, [sortConfig, handleError]);

  // Gérer les actions avec validation
  const handleAction = useCallback((userId, action) => {
    try {
      if (!userId || !action) return;
      
      switch (action) {
        case 'view':
          navigation.navigate('UserDetails', { id: userId });
          break;
        case 'edit':
          navigation.navigate('EditUser', { id: userId });
          break;
        case 'delete':
          setUserToDelete(userId);
          setShowDeleteModal(true);
          break;
        default:
          console.warn('Action inconnue:', action);
      }
    } catch (error) {
      handleError(error, `handleAction-${action}`);
    }
  }, [navigation, handleError]);

  // Supprimer un utilisateur avec gestion d'erreur
  const deleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout lors de la suppression')), 10000)
      );

      const deletePromise = UserService.DeleteUserById(userToDelete, authToken);
      await Promise.race([deletePromise, timeoutPromise]);
      
      await fetchUsers(true);
      Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
      clearError();
    } catch (error) {
      const errorMessage = handleError(error, 'deleteUser');
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  }, [userToDelete, authToken, fetchUsers, handleError, clearError]);

  // Animation d'entrée avec gestion d'erreur
  useEffect(() => {
    try {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 0.5,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      handleError(error, 'animation');
      // Définir les valeurs directement si l'animation échoue
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [fadeAnim, slideAnim, handleError]);

  // Rendu d'un utilisateur avec validation
  const renderItem = useCallback(({ item, index }) => {
    try {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const pointstudios = Number(item.pointstudios) || 0;
      const pointevents = Number(item.pointevents) || 0;
      const isEligibleForBonus = pointstudios >= 5000 || pointevents >= 40000;
      const isFavorite = favorites.includes(item.id);

      return (
        <ErrorBoundary key={item.id}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Swipeable
              renderLeftActions={() => renderLeftActions(item.id)}
              renderRightActions={() => renderRightActions(item.id, isFavorite)}
              friction={2}
              overshootFriction={8}
            >
              <View
                style={[
                  styles.userItem,
                  isFavorite && styles.favoriteItem,
                  isEligibleForBonus && styles.bonusItem,
                ]}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {(item.first_name || '')} {(item.last_name || '')}
                    {item.role === 'admin' && (
                      <MaterialIcons name="verified" size={16} color="#2196F3" style={styles.roleIcon} />
                    )}
                  </Text>
                  <Text style={styles.userEmail}>{item.email || 'Email non disponible'}</Text>
                  
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>
                      <MaterialIcons name="photo-camera" size={14} color="#4CAF50" /> {pointstudios}
                    </Text>
                    <Text style={styles.pointsText}>
                      <MaterialIcons name="event" size={14} color="#FF9800" /> {pointevents}
                    </Text>
                  </View>
                </View>
                
                {isEligibleForBonus && (
                  <View style={styles.bonusBadge}>
                    <Feather name="award" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Swipeable>
          </Animated.View>
        </ErrorBoundary>
      );
    } catch (error) {
      handleError(error, `renderItem-${item?.id}`);
      return null;
    }
  }, [favorites, fadeAnim, slideAnim, handleError]);

  // Actions swipeables à gauche avec validation
  const renderLeftActions = useCallback((userId) => {
    try {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleAction(userId, 'view')}
          >
            <MaterialIcons name="visibility" size={20} color="white" />
            <Text style={styles.actionButtonText}>Voir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleAction(userId, 'edit')}
          >
            <MaterialIcons name="edit" size={20} color="white" />
            <Text style={styles.actionButtonText}>Éditer</Text>
          </TouchableOpacity>
        </View>
      );
    } catch (error) {
      handleError(error, 'renderLeftActions');
      return null;
    }
  }, [handleAction, handleError]);

  // Actions swipeables à droite avec validation
  const renderRightActions = useCallback((userId, isFavorite) => {
    try {
      return (
        <View style={styles.rightActionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={() => toggleFavorite(userId)}
          >
            <MaterialIcons 
              name={isFavorite ? 'star' : 'star-border'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {isFavorite ? 'Retirer' : 'Favoris'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleAction(userId, 'delete')}
          >
            <MaterialIcons name="delete" size={20} color="white" />
            <Text style={styles.actionButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      );
    } catch (error) {
      handleError(error, 'renderRightActions');
      return null;
    }
  }, [toggleFavorite, handleAction, handleError]);

  // En-tête de colonne avec tri et validation
  const renderHeader = useCallback(() => {
    try {
      return (
        <View style={styles.listHeader}>
          <TouchableOpacity 
            style={styles.headerColumn} 
            onPress={() => requestSort('first_name')}
          >
            <Text style={styles.headerText}>Nom</Text>
            {sortConfig.key === 'first_name' && (
              <MaterialIcons 
                name={sortConfig.direction === 'asc' ? 'arrow-drop-up' : 'arrow-drop-down'} 
                size={20} 
                color="#FEC109" 
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerColumn} 
            onPress={() => requestSort('role')}
          >
            <Text style={styles.headerText}>Rôle</Text>
            {sortConfig.key === 'role' && (
              <MaterialIcons 
                name={sortConfig.direction === 'asc' ? 'arrow-drop-up' : 'arrow-drop-down'} 
                size={20} 
                color="#FEC109" 
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerColumn} 
            onPress={() => requestSort('pointstudios')}
          >
            <Text style={styles.headerText}>Points</Text>
            {sortConfig.key === 'pointstudios' && (
              <MaterialIcons 
                name={sortConfig.direction === 'asc' ? 'arrow-drop-up' : 'arrow-drop-down'} 
                size={20} 
                color="#FEC109" 
              />
            )}
          </TouchableOpacity>
        </View>
      );
    } catch (error) {
      handleError(error, 'renderHeader');
      return null;
    }
  }, [sortConfig, requestSort, handleError]);

  // Composant d'affichage d'erreur
  const ErrorDisplay = () => {
    if (!error) return null;

    return (
      <View style={styles.errorBanner}>
        <Feather name="alert-circle" size={20} color="#FF5722" />
        <Text style={styles.errorBannerText}>{error.message}</Text>
        <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
          <MaterialIcons name="close" size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Gestion des Utilisateurs</Text>
          <Text style={styles.subHeader}>
            {Array.isArray(filteredUsers) ? filteredUsers.length : 0} utilisateur(s)
          </Text>
        </View>

        <ErrorDisplay />

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            editable={!loading}
          />
          <AnimatedTouchable 
            style={[styles.filterToggle, { transform: [{ rotate: rotateInterpolate }] }]}
            onPress={toggleFilters}
            disabled={loading}
          >
            <Feather name="filter" size={20} color="#FEC109" />
          </AnimatedTouchable>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            {['all', 'admin', 'client', 'favorites', 'bonus'].map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && styles.activeFilter,
                ]}
                onPress={() => setFilter(filterType)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === filterType && styles.activeFilterText,
                  ]}
                >
                  {filterType === 'all'
                    ? 'Tous'
                    : filterType === 'admin'
                    ? 'Admins'
                    : filterType === 'client'
                    ? 'Clients'
                    : filterType === 'favorites'
                    ? 'Favoris'
                    : 'Bonus'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FEC109" />
            <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
            {isRetrying && (
              <Text style={styles.retryingText}>Nouvelle tentative...</Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="users" size={50} color="#E0E0E0" />
                <Text style={styles.emptyText}>
                  {error ? 'Erreur lors du chargement' : 'Aucun utilisateur trouvé'}
                </Text>
                {error && (
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => retry(() => fetchUsers(true))}
                  >
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FEC109']}
                tintColor="#FEC109"
              />
            }
            onEndReachedThreshold={0.1}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}

        {/* Modal de confirmation de suppression */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
              <Text style={styles.modalText}>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowDeleteModal(false)}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]} 
                  onPress={deleteUser}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>Supprimer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </ErrorBoundary>
  );
}