import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Animated, 
  TouchableOpacity,
  ActivityIndicator ,RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HistoryService from '../../../Services/HistoryServices/HistoryService';

const COLORS = {
  success: '#4CAF50',
  background: '#F8F9FA',
  primary: '#2C3E50',
  textSecondary: '#6C757D',
};

export default function AdminHistoryScreen() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing,setRefreshing]=useState(false);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() =>  {
    const loadData = async () => {
      try {
        const data = await HistoryService.getHistoryWithNames();
        setHistoryData(data);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ]).start();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const onRefresh= async ()=>{
    setRefreshing(true)
    const data = await HistoryService.getHistoryWithNames();
    setHistoryData(data);
    setRefreshing(false);

  }


  const renderItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.itemContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50 * (index + 1), 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.itemHeader}>
        <MaterialCommunityIcons 
          name={item.reference.includes('Studio') ? 'music-circle' : 'calendar'} 
          size={24} 
          color="#2196F3" 
        />
        <Text style={styles.actionText}>
          {item.reference.trim()}  ({item.points} points)
        </Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="cash" size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>{item.amount} $</Text>
        
        <MaterialCommunityIcons name="account" size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>{item.user_name}</Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="account-tie" size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>{item.admin_name}</Text>
        
        <MaterialCommunityIcons name="clock" size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>{formatDate(item.date_points)}</Text>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Text style={styles.title}>Historique des Transactions</Text>
      </Animated.View>

      <FlatList
        data={historyData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun historique disponible</Text>
        }
        
        refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2196F3']}
                    tintColors={['#FEC107']}
                    />
                  }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center'
  },
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: COLORS.primary
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'space-between'
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
    marginRight: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20
  }
});