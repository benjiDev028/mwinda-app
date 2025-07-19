import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Animated, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Pressable
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import HistoryService from '../../../Services/HistoryServices/HistoryService';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#FEC109',
  success: '#4CAF50',
  background: '#F8F9FA',
  textSecondary: '#6C757D',
  danger: '#E74C3C',
};

export default function AdminHistoryScreen() {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filter, historyData]);

  const loadData = async () => {
    try {
      setLoading(true);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let result = [...historyData];
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(item => 
        filter === 'studio' 
          ? item.reference.includes('Studio') 
          : !item.reference.includes('Studio')
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.user_name.toLowerCase().includes(query) || 
        item.admin_name.toLowerCase().includes(query) ||
        item.reference.toLowerCase().includes(query)
      );
    }
    
    setFilteredData(result);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
  };

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
      <Pressable onPress={() => handleItemPress(item)} style={styles.pressableItem}>
        <View style={styles.itemHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.reference.includes('Studio') ? '#E3F2FD' : '#E8F5E9' }
          ]}>
            <MaterialCommunityIcons 
              name={item.reference.includes('Studio') ? 'music-circle' : 'calendar'} 
              size={20} 
              color={item.reference.includes('Studio') ? '#2196F3' : '#4CAF50'} 
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.actionText} numberOfLines={1} ellipsizeMode="tail">
              {item.reference.trim()}
            </Text>
            <Text style={styles.userText}>{item.user_name}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{item.points} pts</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="cash" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.amount} $</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(item.date_points)}</Text>
          </View>
        </View>

        <View style={styles.adminRow}>
          <MaterialCommunityIcons name="account-tie" size={14} color={COLORS.textSecondary} />
          <Text style={styles.adminText}>{item.admin_name}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
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
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="database-remove" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>Aucun historique disponible</Text>
            {searchQuery || filter !== 'all' ? (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrer par</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'all' && styles.selectedFilter
              ]}
              onPress={() => {
                setFilter('all');
                setShowFilters(false);
              }}
            >
              <Text style={styles.filterText}>Tous les types</Text>
              {filter === 'all' && <MaterialIcons name="check" size={20} color={COLORS.success} />}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'studio' && styles.selectedFilter
              ]}
              onPress={() => {
                setFilter('studio');
                setShowFilters(false);
              }}
            >
              <Text style={styles.filterText}>Studio seulement</Text>
              {filter === 'studio' && <MaterialIcons name="check" size={20} color={COLORS.success} />}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'event' && styles.selectedFilter
              ]}
              onPress={() => {
                setFilter('event');
                setShowFilters(false);
              }}
            >
              <Text style={styles.filterText}>Événements seulement</Text>
              {filter === 'event' && <MaterialIcons name="check" size={20} color={COLORS.success} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalContainer}>
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>Détails de la transaction</Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                  <MaterialIcons name="close" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedItem.reference}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Client:</Text>
                <Text style={styles.detailValue}>{selectedItem.user_name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Admin:</Text>
                <Text style={styles.detailValue}>{selectedItem.admin_name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Montant:</Text>
                <Text style={styles.detailValue}>{selectedItem.amount} $</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Points:</Text>
                <Text style={styles.detailValue}>{selectedItem.points} pts</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedItem.date_points)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pressableItem: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA000',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  adminText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedFilter: {
    backgroundColor: '#F9F9F9',
  },
  filterText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  // Detail Modal styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    padding: 20,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.primary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});