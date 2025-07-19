import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ClientSupportScreen() {
  
  const handlePhoneCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
        }
      })
      .catch((err) => Alert.alert('Erreur', 'Une erreur s\'est produite'));
  };

  const handleEmail = (email) => {
    const subject = 'Demande de rendez-vous - Mwinda Photographie';
    const body = 'Bonjour,\n\nJe souhaiterais prendre rendez-vous pour une séance photo.\n\nCordialement,';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
        }
      })
      .catch((err) => Alert.alert('Erreur', 'Une erreur s\'est produite'));
  };

  const LocationCard = ({ title, address, reference, email, phone }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Ionicons name="location" size={24} color="#fec109" />
        <Text style={styles.locationTitle}>{title}</Text>
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.reference}>Référence: {reference}</Text>
      </View>

      <View style={styles.contactButtons}>
        <TouchableOpacity 
          style={styles.phoneButton}
          onPress={() => handlePhoneCall(phone)}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.emailButton}
          onPress={() => handleEmail(email)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="email" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={40} color="#fec109" />
          </View>
          <Text style={styles.mainTitle}>Support Client</Text>
          <Text style={styles.subtitle}>Mwinda Photographie</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            Contactez-nous pour prendre rendez-vous ou pour toute question. 
            Nous sommes à votre disposition pour capturer vos moments précieux !
          </Text>
        </View>

        {/* Horaires */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="time" size={24} color="#fec109" />
            <Text style={styles.scheduleTitle}>Heures d'ouverture</Text>
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleText}>Lundi - Dimanche</Text>
            <Text style={styles.scheduleHours}>9h00 - 20h00</Text>
          </View>
        </View>

        {/* Nos emplacements */}
        <Text style={styles.sectionTitle}>Nos emplacements à Kinshasa</Text>
        
        <LocationCard
          title="Ngaliema (UPN)"
          address="Avenue Matondo N°10 bis"
          reference="Supermarché SK"
          email="mwindaphotographie@gmail.com"
          phone="+243819797975"
        />

        <LocationCard
          title="Lemba Foire"
          address="Avenue Idiba 1"
          reference="Immeuble Indépendance"
          email="mwindaphotographie@gmail.com"
          phone="+243819797975"
        />

        {/* Contact rapide */}
        <View style={styles.quickContactCard}>
          <Text style={styles.quickContactTitle}>Contact rapide</Text>
          <View style={styles.quickContactButtons}>
            <TouchableOpacity 
              style={styles.quickPhoneButton}
              onPress={() => handlePhoneCall('+243819797975')}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>+243 819 797 975</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickEmailButton}
              onPress={() => handleEmail('mwindaphotographie@gmail.com')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="email" size={24} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Envoyer un email</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },

  // Description
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Schedule
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  scheduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  scheduleHours: {
    fontSize: 16,
    color: '#fec109',
    fontWeight: '700',
  },

  // Section title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginHorizontal: 20,
    marginBottom: 15,
  },

  // Location card
  locationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  locationInfo: {
    marginBottom: 20,
  },
  address: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    marginBottom: 5,
  },
  reference: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
  },

  // Contact buttons
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phoneButton: {
    backgroundColor: '#28A745',
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  emailButton: {
    backgroundColor: '#DC3545',
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },

  // Quick contact
  quickContactCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickContactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickContactButtons: {
    gap: 15,
  },
  quickPhoneButton: {
    backgroundColor: '#fec109',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#fec109',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quickEmailButton: {
    backgroundColor: '#495057',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});