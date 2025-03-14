import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserService from '../../../Services/UserServices/UserService';
import HistoryService from '../../../Services/HistoryServices/HistoryService';
import styles from './Styles';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#fec107';
const SECONDARY_COLOR = '#ffffff';
const NEUTRAL_COLOR = '#2c3e50';

export default function AdminHomeScreen() {
  const { authToken, userRole, id, logout } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [bonusEligibleClients, setBonusEligibleClients] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.8)).current;

  // Charger les données initiales
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour récupérer les données
  const fetchData = async () => {
    try {
      // Récupérer tous les utilisateurs
      const users = await UserService.GetUsers();
      setTotalUsers(users.length);

      // Filtrer les clients actifs (is_email_verified === true)
      const activeClients = users.filter((user) => user.is_email_verified === true);
      setActiveClients(activeClients.length);

      // Filtrer les clients éligibles au bonus (pointstudios >= 5000 ou pointevents >= 40000)
      const bonusEligible = users.filter(
        (user) => user.pointstudios >= 5000 || user.pointevents >= 40000
      );
      setBonusEligibleClients(bonusEligible.length);

      // Récupérer les 3 dernières activités récentes
      const activities = await HistoryService.getHistoryAdminById(id);
      if (activities) {
        setRecentActivities(activities.slice(0, 3)); // Limiter à 3 activités
      } else {
        console.error("Aucune activité récente trouvée.");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Rendu d'un bouton d'onglet
  const renderTabButton = (tabName, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabName && styles.activeTab]}
      onPress={() => setSelectedTab(tabName)}
    >
      <Icon
        name={icon}
        size={24}
        color={selectedTab === tabName ? PRIMARY_COLOR : NEUTRAL_COLOR}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Icon name="admin-panel-settings" size={40} color={PRIMARY_COLOR} />
          <TouchableOpacity onPress={logout} style={styles.notificationButton}>
            <Icon name="notifications" size={28} color={NEUTRAL_COLOR} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {renderTabButton('dashboard', 'dashboard')}
          {renderTabButton('clients', 'people-alt')}
          {renderTabButton('analytics', 'analytics')}
          {renderTabButton('settings', 'settings')}
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {selectedTab === 'dashboard' && (
          <>
            <View style={styles.statsGrid}>
              {/* Carte : Nombre total d'utilisateurs */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalUsers}</Text>
                <Text style={styles.statLabel}>Utilisateurs</Text>
                <Icon name="trending-up" size={20} color="#4CAF50" />
              </View>

              {/* Carte : Clients actifs */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{activeClients}</Text>
                <Text style={styles.statLabel}>Clients actifs</Text>
                <Icon name="group-work" size={20} color={PRIMARY_COLOR} />
              </View>

              {/* Carte : Clients éligibles au bonus */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{bonusEligibleClients}</Text>
                <Text style={styles.statLabel}>Clients éligibles au bonus</Text>
                <Icon name="star" size={20} color="#FFD700" />
              </View>
            </View>

            {/* Section : Activités récentes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activités récentes</Text>
              {recentActivities && recentActivities.length > 0 ? (
                <FlatList
                  data={recentActivities}
                  renderItem={({ item }) => (
                    <View style={styles.storyCard}>
                      <View style={styles.storyHeader}>
                        <Text style={styles.clientName}>{item.clientName}</Text>
                        <Text style={styles.reference}>Référence: {item.reference}</Text>
                      </View>
                      <Text style={styles.storyAction}>Montant: {item.amount} $</Text>
                      <Text style={styles.storyAction}>Points: {item.points}</Text>
                      <Text style={styles.storyTime}>
                        Date: {new Date(item.date_points).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                />
              ) : (
                <Text style={styles.emptyText}>Aucune activité récente trouvée.</Text>
              )}
            </View>
          </>
        )}

        {selectedTab === 'clients' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestion des clients</Text>
            {/* Ajouter ici la logique de gestion des clients */}
          </View>
        )}

        {/* Section : État du système */}
        <View style={styles.systemHealth}>
          <Text style={styles.healthTitle}>État du système</Text>
          <View style={styles.healthItem}>
            <Icon name="cloud" size={20} color="#2196F3" />
            <Text style={styles.healthText}>API: Opérationnel</Text>
          </View>
          <View style={styles.healthItem}>
            <Icon name="storage" size={20} color="#4CAF50" />
            <Text style={styles.healthText}>Base de données: Stable</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}