import { StyleSheet,Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        height: 250,
        justifyContent: 'center',
        backgroundColor: '#fec107',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    snackbarContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  snackbarWrapper: {
    top: 0,
    bottom: 'auto',
  },
  snackbar: {
    backgroundColor: '#333',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  snackbarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
    logo: {
        width: '80%',
        height: '60%',
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2D3436',
        textAlign: 'center',
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#636E72',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    input: {
        backgroundColor: '#FFFFFF',
        height: 60,
        borderRadius: 15,
        paddingHorizontal: 25,
        marginBottom: 30,
        fontSize: 16,
        color: '#2D3436',
        borderWidth: 2,
        borderColor: '#EDEFF1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    button: {
        backgroundColor: '#fec107',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#F5B301',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3436',
        letterSpacing: 0.8,
    },
    activeButton: {
        backgroundColor: '#fec107',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fec107',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,}
});

export default styles;