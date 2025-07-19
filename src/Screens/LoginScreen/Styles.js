import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Gris très clair avec une nuance plus douce
  },
  container1: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fec109', // Couleur principale maintenue
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '80%',
    height: '70%',
    resizeMode: 'contain',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#2C3E50', // Ombre plus subtile avec une couleur gris-bleu
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8ECF0', // Bordure très subtile
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50', // Gris-bleu foncé pour un meilleur contraste
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057', // Gris moyen plus doux
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F8F9FA',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1.5,
    borderColor: '#DEE2E6', // Bordure gris clair
  },
  buttonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#fec109', // Couleur principale maintenue
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#F39C12', // Ombre avec une nuance plus orangée du jaune
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  activeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50', // Texte sombre pour un bon contraste sur le jaune
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: 16,
    color: '#6C757D', // Gris moyen pour le texte secondaire
    textDecorationLine: 'underline',
  },
  linkText: {
    textAlign: 'center',
    color: '#DC3545', // Rouge Bootstrap plus doux que le rouge pur
    fontWeight: '600',
    marginTop: 15,
  },
});

export default styles;