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
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from './Styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../../../context/AuthContext';
import UserService from '../../../Services/UserServices/UserService';
import HistoryService from '../../../Services/HistoryServices/HistoryService';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = 'red';
const WHITE = '#ffffff';
const DARK_GRAY = '#2c3e50';
const LIGHT_GRAY = '#f5f5f5';

const TAB_ICON = {
  dashboard: 'dashboard',
  clients: 'people',
  analytics: 'analytics', // si jamais ça n’existe pas chez toi, remplace par 'insert-chart'
};

// ————— helpers validation —————
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

const validatePassword = (pwd) =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pwd);

const parseBirthDate = (input) => {
  // attend "JJ/MM/AAAA" -> renvoie "AAAA-MM-DD"
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  //const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input.trim());
  if (!m) return { ok: false, msg: "Format attendu: JJ-MM-AAAA." };
  const [_, jj, mm, aaaa] = m;
  const iso = `${aaaa}-${mm}-${jj}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { ok: false, msg: "Date invalide." };
  // simple garde-fou : pas dans le futur, et > 1900
  const now = new Date();
  if (d > now) return { ok: false, msg: "La date de naissance ne peut pas être future." };
  if (parseInt(aaaa, 10) < 1900) return { ok: false, msg: "Année invalide." };
  return { ok: true, iso };
};

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { logout, id, userRole } = useContext(AuthContext);

  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeClients: 0,
    bonusEligibleClients: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [adminForm, setAdminForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_birth: '', // JJ/MM/AAAA côté UI
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const fetchData = async () => {
    try {
      const [users, activities] = await Promise.all([
        UserService.GetUsers(),
        HistoryService.getHistoryAdminById(id),
      ]);

      const activeClients = (users || []).filter(u => u?.is_email_verified).length;
      const bonusEligible = (users || []).filter(
        u => (u?.pointstudios ?? 0) >= 5000 || (u?.pointevents ?? 0) >= 40000
      ).length;

      setStats({
        totalUsers: users?.length ?? 0,
        activeClients,
        bonusEligibleClients: bonusEligible,
      });

      setRecentActivities((activities || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
      // on évite le flood de logs “Utilisateur non trouvé.” venant de services internes
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
    const { first_name, last_name, email, password, date_birth } = adminForm;

    if (!first_name || !last_name || !email || !password || !date_birth) {
      Alert.alert('Avertissement', 'Tous les champs sont obligatoires.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Avertissement', 'Veuillez entrer un email valide.');
      return;
    }

    const birth = parseBirthDate(date_birth);
    if (!birth.ok) {
      Alert.alert('Avertissement', birth.msg);
      return;
    }

    // if (!validatePassword(password)) {
    //   Alert.alert(
    //     'Avertissement',
    //     'Le mot de passe doit contenir au moins 6 caractères, une lettre, un chiffre et un caractère spécial.'
    //   );
    //   return;
    // }

    setIsCreatingAdmin(true);
    try {
      const resp = await UserService.add_Admin(
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        password,
        birth.iso // on envoie en ISO au backend
      );

      if (resp?.success) {
        Alert.alert('Succès', 'Administrateur créé avec succès.');
        // reset formulaire
        setAdminForm({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          date_birth: '',
        });
        // si tu veux naviguer, ici au moins navigation existe
        // navigation.navigate('Login');
      } else {
        // certains de tes services renvoient {status:"EMAIL_ALREADY_REGISTERED"} ou {error:"…"}
        const status = resp?.status || resp?.detail || '';
        if (status === 'EMAIL_ALREADY_REGISTERED') {
          Alert.alert('Avertissement', "Cet email est déjà enregistré.");
        } else {
          Alert.alert('Avertissement', resp?.error || 'Une erreur est survenue, veuillez réessayer.');
        }
      }
    } catch (e) {
      console.error('Error during admin creation:', e);
      Alert.alert(
        'Avertissement',
        "Une erreur est survenue. Vérifiez votre connexion ou réessayez plus tard."
      );
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
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderActivityItem = ({ item }) => (
    <Animated.View style={[styles.activityCard, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
      <View style={styles.activityHeader}>
        <Icon
          name={item?.reference?.includes('Studio') ? 'photo-camera' : 'event'}
          size={18}
          color={PRIMARY_COLOR}
        />
        <Text style={styles.activityClient}>{item?.clientName ?? 'Client'}</Text>
        <Text style={styles.activityPoints}>+{item?.points ?? 0} pts</Text>
      </View>
      <Text style={styles.activityReference}>{item?.reference ?? '-'}</Text>
      <View style={styles.activityFooter}>
        <Text style={styles.activityAmount}>{item?.amount ?? 0} $</Text>
        <Text style={styles.activityDate}>
          {item?.date_points
            ? new Date(item.date_points).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
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
        onChangeText={(text) => setAdminForm({ ...adminForm, first_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={adminForm.last_name}
        onChangeText={(text) => setAdminForm({ ...adminForm, last_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={adminForm.email}
        onChangeText={(text) => setAdminForm({ ...adminForm, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={adminForm.password}
        onChangeText={(text) => setAdminForm({ ...adminForm, password: text })}
      />
      <MaskedTextInput
        style={styles.input}
        mask ="99/99/9999"
        keyboardType='numeric'
        placeholder="Date de naissance (JJ/MM/AAAA)"
        value={adminForm.date_birth}
        onChangeText={(text) => setAdminForm({ ...adminForm, date_birth: text })}
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
              style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Icon
                name={TAB_ICON[tab]}
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
                  keyExtractor={(item, idx) => String(item?.id ?? idx)}
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
