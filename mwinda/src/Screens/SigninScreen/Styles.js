import { StyleSheet } from 'react-native';



const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  
  container1: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#fec107',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 180,
    height: 85,
    resizeMode: 'contain',
    marginTop: 20,
  },
  container2: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    fontSize: 15,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeButton: {
    backgroundColor: '#fec107',
    padding: 16,
    borderRadius: 14,
    marginVertical: 20,
    shadowColor: '#fec107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  activeText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  already: {
    textAlign: 'center',
    color: '#666',
    marginTop: 15,
    fontSize: 14,
  },
  connexion: {
    color: '#fec107',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },



  // Ajoutez ces styles à votre fichier Styles.js existant
termsContainer: {
  marginVertical: 15,
},
checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 10,
},
checkbox: {
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: '#ddd',
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 3,
},
checkboxChecked: {
  backgroundColor: '#007AFF',
  borderColor: '#007AFF',
},
checkmark: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
},
checkboxText: {
  flex: 1,
  fontSize: 14,
  color: '#333',
  lineHeight: 20,
},
termsLink: {
  color: '#007AFF',
  textDecorationLine: 'underline',
},
disabledButton: {
  opacity: 0.5,
},
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: 'white',
  margin: 20,
  borderRadius: 10,
  padding: 20,
  maxHeight: '80%',
  width: '90%',
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  paddingBottom: 10,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  flex: 1,
},
closeButton: {
  padding: 5,
},
closeButtonText: {
  fontSize: 20,
  color: '#666',
},
modalScrollView: {
  maxHeight: 400,
},
termsText: {
  fontSize: 14,
  lineHeight: 22,
  color: '#333',
},
termsTitle: {
  fontWeight: 'bold',
  fontSize: 16,
},
acceptButton: {
  backgroundColor: '#007AFF',
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 15,
},
acceptButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
};

export default styles;