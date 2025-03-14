import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import {styles} from './Styles'
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../../../Services/UserServices/UserService';
import { useNavigation } from '@react-navigation/native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AdminViewClientsScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [bonus, setBonus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Charger les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    const data = await UserService.GetUsers();
    setUsers(data);
    setFilteredUsers(data);

    // Charger les favoris depuis AsyncStorage
    const storedFavorites = await AsyncStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    setLoading(false);
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

  // Filtrer les utilisateurs
  useEffect(() => {
    filterUsers();
  }, [filter, searchQuery]);

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

  // Filtrer les utilisateurs
  const filterUsers = () => {
    let updatedUsers = users;

    if (searchQuery.trim() !== '') {
      updatedUsers = updatedUsers.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
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

    setFilteredUsers(updatedUsers);
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
        Alert.alert(
          'Avertissement',
          'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
          [
            { text: 'Oui', onPress: () => deleteUser(userId) },
            { text: 'Non', style: 'cancel' },
          ]
        );
        break;
      default:
        alert('Action inconnue');
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    try {
      await UserService.DeleteUserById(userId);
      await fetchUsers();
      Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
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
    const isEligibleForBonus =
      item.pointstudios >= 5000 || item.pointevents >= 40000;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Swipeable
          renderLeftActions={() => renderLeftActions(item.id)}
          friction={2}
          overshootFriction={8}
        >
          <View
            style={[
              styles.userItem,
              favorites.includes(item.id) && styles.favoriteItem,
              isEligibleForBonus && styles.bonusItem,
            ]}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            {isEligibleForBonus && (
              <View style={styles.bonusBadge}>
                <Feather name="bell" size={16} color="#FFFFFF" />
              </View>
            )}
            {/* Icône d'étoile avec gestionnaire onPress */}
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Feather
                name={favorites.includes(item.id) ? 'star' : 'star'}
                size={24}
                color={favorites.includes(item.id) ? '#FFD700' : '#ccc'}
                style={styles.favoriteIcon}
              />
            </TouchableOpacity>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  // Actions swipeables
  const renderLeftActions = (userId) => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => handleAction(userId, 'view')}
        >
          <MaterialIcons name="visibility" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => handleAction(userId, 'edit')}
        >
          <MaterialIcons name="edit" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => handleAction(userId, 'delete')}
        >
          <MaterialIcons name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header}>Gestion des Utilisateurs</Text>

      <View style={styles.filterContainer}>
        {['all', 'admin', 'favorites', 'bonus'].map((filterType) => (
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

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#FEC107"
            />
          }
        />
      )}
    </Animated.View>
  );
}