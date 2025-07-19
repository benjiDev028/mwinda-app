import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../../../context/AuthContext';
import UserService from '../../../Services/UserServices/UserService';
import HistoryService from '../../../Services/HistoryServices/HistoryService';


const PRIMARY_COLOR = 'red';
const WHITE = '#ffffff';
const DARK_GRAY = '#2c3e50';
const LIGHT_GRAY = '#f5f5f5';

export default function AdminHomeScreen() {
  const { logout, id, userRole } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeClients: 0,
    bonusEligibleClients: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminForm, setAdminForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_birth: ''
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const fetchData = async () => {
    try {
      const [users, activities] = await Promise.all([
        UserService.GetUsers(),
        HistoryService.getHistoryAdminById(id)
      ]);

      const activeClients = users.filter(user => user.is_email_verified).length;
      const bonusEligible = users.filter(user => 
        user.pointstudios >= 5000 || user.pointevents >= 40000
      ).length;

      setStats({
        totalUsers: users.length,
        activeClients,
        bonusEligibleClients: bonusEligible
      });

      setRecentActivities(activities?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCreateAdmin = async () => {
    if (userRole !== 'superadmin') {
      Alert.alert('Erreur', 'Seuls les superadmins peuvent créer des comptes admin');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      await UserService.registerAdmin(adminForm);
      Alert.alert('Succès', 'Admin créé avec succès');
      setAdminForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        date_birth: ''
      });
      fetchData(); // Rafraîchir les données
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  useEffect(() => {
    fetchData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const renderStatCard = (value, label, icon, color) => (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  const renderActivityItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.activityCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideUp }] 
        }
      ]}
    >
      <View style={styles.activityHeader}>
        <Icon 
          name={item.reference.includes('Studio') ? 'photo-camera' : 'event'} 
          size={18} 
          color={PRIMARY_COLOR} 
        />
        <Text style={styles.activityClient}>{item.clientName}</Text>
        <Text style={styles.activityPoints}>+{item.points} pts</Text>
      </View>
      <Text style={styles.activityReference}>{item.reference}</Text>
      <View style={styles.activityFooter}>
        <Text style={styles.activityAmount}>{item.amount} $</Text>
        <Text style={styles.activityDate}>
          {new Date(item.date_points).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </Animated.View>
  );

  const renderAdminForm = () => (
    <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
      <Text style={styles.formTitle}>Créer un nouvel admin</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={adminForm.first_name}
        onChangeText={(text) => setAdminForm({...adminForm, first_name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={adminForm.last_name}
        onChangeText={(text) => setAdminForm({...adminForm, last_name: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={adminForm.email}
        onChangeText={(text) => setAdminForm({...adminForm, email: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={adminForm.password}
        onChangeText={(text) => setAdminForm({...adminForm, password: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Date de naissance (JJ/MM/AAAA)"
        value={adminForm.date_birth}
        onChangeText={(text) => setAdminForm({...adminForm, date_birth: text})}
      />
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCreateAdmin}
        disabled={isCreatingAdmin}
      >
        {isCreatingAdmin ? (
          <ActivityIndicator color={WHITE} />
        ) : (
          <Text style={styles.submitButtonText}>Créer Admin</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Tableau de bord</Text>
          <TouchableOpacity onPress={logout}>
            <Icon name="logout" size={24} color={DARK_GRAY} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {['dashboard', 'clients', 'analytics'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Icon
                name={tab}
                size={24}
                color={selectedTab === tab ? PRIMARY_COLOR : DARK_GRAY}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
            />
          }
        >
          {selectedTab === 'dashboard' && (
            <>
              <View style={styles.statsGrid}>
                {renderStatCard(stats.totalUsers, 'Utilisateurs', 'people', '#2196F3')}
                {renderStatCard(stats.activeClients, 'Clients actifs', 'verified-user', '#4CAF50')}
                {renderStatCard(stats.bonusEligibleClients, 'Éligibles bonus', 'star', PRIMARY_COLOR)}
              </View>

              <Text style={styles.sectionTitle}>Activités récentes</Text>
              {recentActivities.length > 0 ? (
                <FlatList
                  data={recentActivities}
                  renderItem={renderActivityItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="info" size={40} color={LIGHT_GRAY} />
                  <Text style={styles.emptyText}>Aucune activité récente</Text>
                </View>
              )}
            </>
          )}

          {selectedTab === 'clients' && (
            <View style={styles.comingSoon}>
              {userRole === 'superadmin' ? (
                renderAdminForm()
              ) : (
                <>
                  <Icon name="construction" size={40} color={PRIMARY_COLOR} />
                  <Text style={styles.comingSoonText}>Section en développement</Text>
                </>
              )}
            </View>
          )}

          {selectedTab === 'analytics' && (
            <View style={styles.comingSoon}>
              <Icon name="analytics" size={40} color={PRIMARY_COLOR} />
              <Text style={styles.comingSoonText}>Analytics à venir</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: DARK_GRAY
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tabButton: {
    padding: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  statCard: {
    width: '30%',
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  statHeader: {
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GRAY,
    margin: 16,
    marginBottom: 8
  },
  activityCard: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  activityClient: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
    marginLeft: 8,
    flex: 1
  },
  activityPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_COLOR
  },
  activityReference: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_GRAY
  },
  activityDate: {
    fontSize: 12,
    color: '#999'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  comingSoonText: {
    fontSize: 16,
    color: DARK_GRAY,
    marginTop: 16
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    height: 40,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: WHITE
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 16
  }
});