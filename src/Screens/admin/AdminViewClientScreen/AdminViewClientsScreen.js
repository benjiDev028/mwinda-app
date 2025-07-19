import React, { useState, useEffect, useRef, useContext } from 'react';
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

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animation pour le bouton de filtre
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const toggleFilters = () => {
    Animated.timing(rotateAnim, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.linear
    }).start();
    setShowFilters(!showFilters);
  };

  // Charger les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.GetUsers(authToken);
      setUsers(data);
      setFilteredUsers(data);

      // Charger les favoris depuis AsyncStorage
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Rafraîchir la liste
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // Filtrer et trier les utilisateurs
  useEffect(() => {
    filterAndSortUsers();
  }, [filter, searchQuery, sortConfig, users]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Basculer les favoris
  const toggleFavorite = async (userId) => {
    let updatedFavorites = favorites.includes(userId)
      ? favorites.filter((id) => id !== userId)
      : [...favorites, userId];
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Filtrer et trier les utilisateurs
  const filterAndSortUsers = () => {
    let updatedUsers = [...users];

    // Filtrage
    if (searchQuery.trim() !== '') {
      updatedUsers = updatedUsers.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === 'favorites') {
      updatedUsers = updatedUsers.filter((user) => favorites.includes(user.id));
    } else if (filter === 'admin') {
      updatedUsers = updatedUsers.filter((user) => user.role === 'admin');
    } else if (filter === 'client') {
      updatedUsers = updatedUsers.filter((user) => user.role === 'client');
    } else if (filter === 'bonus') {
      updatedUsers = updatedUsers.filter(
        (user) => user.pointstudios >= 5000 || user.pointevents >= 40000
      );
    }

    // Tri
    if (sortConfig.key) {
      updatedUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(updatedUsers);
  };

  // Gérer le tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Gérer les actions (voir, éditer, supprimer)
  const handleAction = (userId, action) => {
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
        console.log('Action inconnue');
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async () => {
    try {
      await UserService.DeleteUserById(userToDelete, authToken);
      await fetchUsers();
      Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Animation d'entrée
  useEffect(() => {
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
  }, []);

  // Rendu d'un utilisateur
  const renderItem = ({ item, index }) => {
    const isEligibleForBonus = item.pointstudios >= 5000 || item.pointevents >= 40000;
    const isFavorite = favorites.includes(item.id);

    return (
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
                {item.first_name} {item.last_name}
                {item.role === 'admin' && (
                  <MaterialIcons name="verified" size={16} color="#2196F3" style={styles.roleIcon} />
                )}
              </Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>
                  <MaterialIcons name="photo-camera" size={14} color="#4CAF50" /> {item.pointstudios}
                </Text>
                <Text style={styles.pointsText}>
                  <MaterialIcons name="event" size={14} color="#FF9800" /> {item.pointevents}
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
    );
  };

  // Actions swipeables à gauche
  const renderLeftActions = (userId) => {
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
  };

  // Actions swipeables à droite
  const renderRightActions = (userId, isFavorite) => {
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
  };

  // En-tête de colonne avec tri
  const renderHeader = () => (
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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Gestion des Utilisateurs</Text>
        <Text style={styles.subHeader}>{filteredUsers.length} utilisateur(s)</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <AnimatedTouchable 
          style={[styles.filterToggle, { transform: [{ rotate: rotateInterpolate }] }]}
          onPress={toggleFilters}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FEC109" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={50} color="#E0E0E0" />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
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
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]} 
                onPress={deleteUser}
              >
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

