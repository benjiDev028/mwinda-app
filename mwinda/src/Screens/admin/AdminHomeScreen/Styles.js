import { StyleSheet, Dimensions } from 'react-native';
const PRIMARY_COLOR = 'red';
const WHITE = '#ffffff';
const DARK_GRAY = '#2c3e50';
const LIGHT_GRAY = '#f5f5f5';
export const styles = StyleSheet.create({
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
export default styles;