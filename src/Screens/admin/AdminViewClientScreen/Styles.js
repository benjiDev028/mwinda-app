import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 25,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#FEC107',
  },
  filterText: {
    color: '#000',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favoriteItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  bonusItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  favoriteIcon: {
    marginLeft: 15,
  },
  bonusBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '80%',
    marginVertical: 10,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    color: '#888',
    fontSize: 16,
  },
});