import React, { useRef, useEffect, useState, useContext } from 'react';
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
  Pressable,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import HistoryService from '../../../Services/HistoryServices/HistoryService';
import { AuthContext } from '../../../context/AuthContext';

const COLORS = {
  primary: '#2C3E50',
  secondary: '#FEC109',
  success: '#4CAF50',
  background: '#F8F9FA',
  textSecondary: '#6C757D',
  danger: '#E74C3C',
};

export default function AdminHistoryScreen() {
  const { userRole } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filter, historyData]);

  // Vérifier si l'utilisateur est un superadmin
  const isSuperAdmin = () => {
    return userRole === 'superadmin' || userRole === 'super_admin';
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HistoryService.getHistoryWithNames();
      if (!data) {
        throw new Error('Aucune donnée reçue');
      }
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
      console.error('Erreur de chargement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...historyData];
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(item => 
        filter === 'studio' 
          ? item.reference?.includes('Studio') 
          : !item.reference?.includes('Studio')
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.user_name?.toLowerCase().includes(query) || 
        item.admin_name?.toLowerCase().includes(query) ||
        item.reference?.toLowerCase().includes(query)
      );
    }
    
    setFilteredData(result);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Date inconnue';
    try {
      const date = new Date(isoString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } catch {
      return 'Date invalide';
    }
  };

  // Gestion de la sélection d'éléments
  const toggleItemSelection = (itemId) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const toggleSelectionMode = () => {
    if (!isSuperAdmin()) {
      Alert.alert(
        'Accès refusé',
        'Seuls les super-administrateurs peuvent supprimer l\'historique.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems(new Set());
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    }
  };

  // Suppression d'un seul élément
  const handleDeletePress = (item) => {
    if (!isSuperAdmin()) {
      Alert.alert(
        'Accès refusé',
        'Seuls les super-administrateurs peuvent supprimer l\'historique.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem || !isSuperAdmin()) return;

    try {
      setShowDeleteConfirm(false);
      
     
      
      const success = await HistoryService.deleteHistoryItem(deletingItem.id);
      
      if (success) {
        // Supprimer l'élément de la liste locale
        setHistoryData(prev => prev.filter(item => item.id !== deletingItem.id));
        setFilteredData(prev => prev.filter(item => item.id !== deletingItem.id));
        
        Alert.alert(
          'Succès',
          'L\'historique a été supprimé avec succès.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Échec de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert(
        'Erreur',
        'Impossible de supprimer cet historique. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeletingItem(null);
    }
  };

  // Suppression en lot
  const handleBulkDeletePress = () => {
    if (!isSuperAdmin() || selectedItems.size === 0) return;
    
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (!isSuperAdmin() || selectedItems.size === 0) return;

    try {
      setShowBulkDeleteConfirm(false);
      
      // // Afficher un indicateur de chargement
      // Alert.alert('Suppression en cours...', `${selectedItems.size} éléments`, [], { cancelable: false });
      
      const selectedIds = Array.from(selectedItems);
      let successCount = 0;
      let errorCount = 0;
      
      // Supprimer chaque élément sélectionné
      for (const id of selectedIds) {
        try {
          const success = await HistoryService.deleteHistory(id);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Erreur lors de la suppression de l'ID ${id}:`, error);
          errorCount++;
        }
      }
      
      // Mettre à jour les listes locales
      setHistoryData(prev => prev.filter(item => !selectedItems.has(item.id)));
      setFilteredData(prev => prev.filter(item => !selectedItems.has(item.id)));
      
      // Réinitialiser la sélection
      setSelectedItems(new Set());
      setIsSelectionMode(false);
      
      // Afficher le résultat
      if (errorCount === 0) {
        Alert.alert(
          'Succès',
          `${successCount} historique(s) supprimé(s) avec succès.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Suppression partielle',
          `${successCount} supprimé(s), ${errorCount} échec(s).`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la suppression en lot:', error);
      Alert.alert(
        'Erreur',
        'Erreur lors de la suppression en lot. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.itemContainer,
        isSelectionMode && selectedItems.has(item.id) && styles.selectedItemContainer,
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
      <Pressable 
        onPress={() => {
          if (isSelectionMode) {
            toggleItemSelection(item.id);
          } else {
            setSelectedItem(item);
          }
        }}
        onLongPress={() => {
          if (isSuperAdmin() && !isSelectionMode) {
            toggleSelectionMode();
            toggleItemSelection(item.id);
          }
        }}
        style={styles.pressableItem}
        android_ripple={{ color: '#f0f0f0' }}
      >
        {isSelectionMode && (
          <View style={styles.selectionCheckbox}>
            <MaterialCommunityIcons 
              name={selectedItems.has(item.id) ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
              size={24} 
              color={selectedItems.has(item.id) ? COLORS.success : COLORS.textSecondary} 
            />
          </View>
        )}
        
        <View style={styles.itemHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.reference?.includes('Studio') ? '#E3F2FD' : '#E8F5E9' }
          ]}>
            <MaterialCommunityIcons 
              name={item.reference?.includes('Studio') ? 'music-circle' : 'calendar'} 
              size={20} 
              color={item.reference?.includes('Studio') ? '#2196F3' : '#4CAF50'} 
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.actionText} numberOfLines={1}>
              {item.reference || 'Type inconnu'}
            </Text>
            <Text style={styles.userText}>{item.user_name || 'Utilisateur inconnu'}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{item.points || 0} pts</Text>
          </View>
          {isSuperAdmin() && !isSelectionMode && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="delete" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="cash" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.amount || 0} $</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(item.date_points)}</Text>
          </View>
        </View>

        <View style={styles.adminRow}>
          <MaterialCommunityIcons name="account-tie" size={14} color={COLORS.textSecondary} />
          <Text style={styles.adminText}>{item.admin_name || 'Admin inconnu'}</Text>
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>Erreur de chargement</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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

        {/* Barre d'outils de sélection */}
        {isSuperAdmin() && (
          <View style={styles.selectionToolbar}>
            <TouchableOpacity 
              style={[styles.toolbarButton, isSelectionMode && styles.activeToolbarButton]}
              onPress={toggleSelectionMode}
            >
              <MaterialCommunityIcons 
                name={isSelectionMode ? "close" : "checkbox-multiple-marked"} 
                size={20} 
                color={isSelectionMode ? "#FFF" : COLORS.primary} 
              />
              <Text style={[styles.toolbarButtonText, isSelectionMode && styles.activeToolbarButtonText]}>
                {isSelectionMode ? 'Annuler' : 'Sélectionner'}
              </Text>
            </TouchableOpacity>

            {isSelectionMode && (
              <>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={selectAllItems}
                >
                  <MaterialCommunityIcons 
                    name={selectedItems.size === filteredData.length ? "checkbox-blank-outline" : "select-all"} 
                    size={20} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.toolbarButtonText}>
                    {selectedItems.size === filteredData.length ? 'Désélectionner' : 'Tout sélectionner'}
                  </Text>
                </TouchableOpacity>

                {selectedItems.size > 0 && (
                  <TouchableOpacity 
                    style={[styles.toolbarButton, styles.deleteToolbarButton]}
                    onPress={handleBulkDeletePress}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="#FFF" />
                    <Text style={[styles.toolbarButtonText, { color: '#FFF' }]}>
                      Supprimer ({selectedItems.size})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </Animated.View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="database-remove" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>Aucun historique disponible</Text>
            {(searchQuery || filter !== 'all') && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            )}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <MaterialCommunityIcons name="alert-circle" size={32} color={COLORS.danger} />
              <Text style={styles.deleteModalTitle}>Confirmer la suppression</Text>
            </View>
            
            <Text style={styles.deleteModalText}>
              Êtes-vous sûr de vouloir supprimer cet historique ?
            </Text>
            
            {deletingItem && (
              <View style={styles.deleteItemInfo}>
                <Text style={styles.deleteItemText}>
                  <Text style={styles.deleteItemLabel}>Type: </Text>
                  {deletingItem.reference || 'Inconnu'}
                </Text>
                <Text style={styles.deleteItemText}>
                  <Text style={styles.deleteItemLabel}>Client: </Text>
                  {deletingItem.user_name || 'Inconnu'}
                </Text>
                <Text style={styles.deleteItemText}>
                  <Text style={styles.deleteItemLabel}>Date: </Text>
                  {formatDate(deletingItem.date_points)}
                </Text>
              </View>
            )}
            
            <Text style={styles.deleteWarningText}>
              Cette action est irréversible.
            </Text>
            
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        visible={showBulkDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBulkDeleteConfirm(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <MaterialCommunityIcons name="alert-circle" size={32} color={COLORS.danger} />
              <Text style={styles.deleteModalTitle}>Confirmer la suppression en lot</Text>
            </View>
            
            <Text style={styles.deleteModalText}>
              Êtes-vous sûr de vouloir supprimer {selectedItems.size} historique(s) ?
            </Text>
            
            <Text style={styles.deleteWarningText}>
              Cette action est irréversible et supprimera définitivement tous les éléments sélectionnés.
            </Text>
            
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowBulkDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmBulkDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  Supprimer ({selectedItems.size})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            
            {['all', 'studio', 'event'].map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterOption,
                  filter === filterType && styles.selectedFilter
                ]}
                onPress={() => {
                  setFilter(filterType);
                  setShowFilters(false);
                }}
              >
                <Text style={styles.filterText}>
                  {filterType === 'all' ? 'Tous les types' : 
                   filterType === 'studio' ? 'Studio seulement' : 'Événements seulement'}
                </Text>
                {filter === filterType && <MaterialIcons name="check" size={20} color={COLORS.success} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
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
            
            {selectedItem && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedItem.reference || 'Inconnu'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Client:</Text>
                  <Text style={styles.detailValue}>{selectedItem.user_name || 'Inconnu'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Admin:</Text>
                  <Text style={styles.detailValue}>{selectedItem.admin_name || 'Inconnu'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Montant:</Text>
                  <Text style={styles.detailValue}>{selectedItem.amount || 0} $</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Points:</Text>
                  <Text style={styles.detailValue}>{selectedItem.points || 0} pts</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedItem.date_points)}</Text>
                </View>
              </>
            )}
            
            <View style={styles.detailButtonContainer}>
              {isSuperAdmin() && selectedItem && (
                <TouchableOpacity 
                  style={styles.detailDeleteButton}
                  onPress={() => {
                    setSelectedItem(null);
                    handleDeletePress(selectedItem);
                  }}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#FFF" />
                  <Text style={styles.detailDeleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.closeButton, isSuperAdmin() && styles.closeButtonWithDelete]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 15,
    textAlign: 'center',
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    marginTop: 10,
    fontWeight: 'bold',
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    alignItems: 'center',
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 8,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  deleteItemInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  deleteItemText: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 5,
  },
  deleteItemLabel: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteWarningText: {
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmDeleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal Styles (existing)
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
  detailButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  detailDeleteButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  detailDeleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 5,
  },
  closeButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonWithDelete: {
    flex: 2,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});