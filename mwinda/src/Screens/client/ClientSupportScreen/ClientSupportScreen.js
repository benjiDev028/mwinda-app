// src/Screens/client/ClientSupportScreen/index.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useResponsive } from '../../../Utils/responsive'; // ajuste le chemin si besoin
import { useRateApp } from '../../../hooks/useReteApp'; // <= hook de rating


 const whatsappNumber = '+243819797975'; // ← mets ton numéro ICI (ex: +243812345678 → "243812345678")

  const openWhatsApp = async () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, j’ai besoin d’aide pour...")}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Oups 😅',
          "Impossible d'ouvrir WhatsApp sur cet appareil."
        );
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };


const LOCATIONS = [
  {
    title: 'Ngaliema (UPN)',
    address: 'Avenue Matondo N°10 bis',
    reference: 'Supermarché SK',
    email: 'mwindaphotographie@gmail.com',
    phone: '+243819797975',
  },
  {
    title: 'Lemba Foire',
    address: 'Avenue Idiba 1',
    reference: 'Immeuble Indépendance',
    email: 'mwindaphotographie@gmail.com',
    phone: '+243819797975',
  },
];

export default function ClientSupportScreen() {
  const r = useResponsive();
  const styles = useMemo(() => makeStyles(r), [r]);

  // Hook de notation
  const { openStorePage } = useRateApp();

  const handlePhoneCall = async (phoneNumber) => {
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Erreur', "Impossible d’ouvrir l’app Téléphone");
    } catch {
      Alert.alert('Erreur', 'Une erreur s’est produite');
    }
  };

  const handleEmail = async (email) => {
    try {
      const subject = 'Demande de rendez-vous - Mwinda Photographie';
      const body =
        'Bonjour,\n\nJe souhaiterais prendre rendez-vous pour une séance photo.\n\nCordialement,';
      const url = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Erreur', "Impossible d’ouvrir l’app Mail");
    } catch {
      Alert.alert('Erreur', 'Une erreur s’est produite');
    }
  };


  const LocationCard = ({ title, address, reference, email, phone }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Ionicons name="location" size={r.ms(22)} color="#fec109" />
        <Text style={styles.locationTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.reference}>Référence : {reference}</Text>
      </View>

      <View style={styles.contactButtons}>
        <TouchableOpacity
          style={styles.phoneButton}
          onPress={() => handlePhoneCall(phone)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Appeler"
        >
          <Ionicons name="call" size={r.ms(18)} color="#FFFFFF" />
          <Text style={styles.buttonText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => handleEmail(email)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Envoyer un email"
        >
          <MaterialIcons name="email" size={r.ms(18)} color="#FFFFFF" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: r.space.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={r.ms(34)} color="#fec109" />
          </View>
          <Text style={styles.mainTitle}>Support Client</Text>
          <Text style={styles.subtitle}>Mwinda Photographie</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.description}>
            Contactez-nous pour prendre rendez-vous ou pour toute question.
            Nous sommes à votre disposition pour capturer vos moments précieux !
          </Text>
        </View>

        {/* Horaires */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <Ionicons name="time" size={r.ms(20)} color="#fec109" />
            <Text style={styles.sectionHeading}>Heures d’ouverture</Text>
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleText}>Lundi - Dimanche</Text>
            <Text style={styles.scheduleHours}>9h00 - 20h00</Text>
          </View>
        </View>

        {/* Emplacements */}
        <Text style={styles.sectionTitle}>Nos emplacements à Kinshasa</Text>
        <View style={styles.grid}>
          {LOCATIONS.map((loc) => (
            <View key={loc.title} style={styles.gridItem}>
              <LocationCard {...loc} />
            </View>
          ))}
        </View>

        {/* Contact rapide */}
        <View style={styles.card}>
          <Text style={styles.quickContactTitle}>Contact rapide</Text>
          <View style={styles.quickContactButtons}>
            <TouchableOpacity
              style={styles.quickPhoneButton}
              onPress={() => handlePhoneCall('+243819797975')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Appeler le support"
            >
              <Ionicons name="call" size={r.ms(20)} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>+243 819 797 975</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.whatsapp]} onPress={openWhatsApp}>
        <Ionicons name="logo-whatsapp" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>Nous contacter sur WhatsApp</Text>
      </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickEmailButton}
              onPress={() => handleEmail('mwindaphotographie@gmail.com')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Envoyer un email au support"
            >
              <MaterialIcons name="email" size={r.ms(20)} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Envoyer un email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Noter l’application */}
        <View style={styles.card}>
          <Text style={styles.quickContactTitle}>Vous aimez Mwinda ?</Text>
          <TouchableOpacity
            onPress={openStorePage}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Noter l’application sur l’App Store ou Google Play"
            style={styles.rateButton}
          >
            <Ionicons name="star" size={r.ms(20)} color="#FFFFFF" />
            <Text style={styles.rateButtonText}>Noter l’application</Text>
          </TouchableOpacity>
        </View>

        {/* Exigence Apple : lien clair pour supprimer le compte */}
       
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (r) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // Header
    header: {
      alignItems: 'center',
      paddingVertical: r.space.lg,
      paddingHorizontal: r.containerPadding,
      backgroundColor: '#FFFFFF',
      marginBottom: r.space.md,
      borderBottomLeftRadius: r.ms(22),
      borderBottomRightRadius: r.ms(22),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
     
  button: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcb900',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  icon: { marginRight: 10 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' ,textAlign: 'center'},
    iconContainer: {
      width: r.ms(68),
      height: r.ms(68),
      borderRadius: r.ms(34),
      backgroundColor: '#FFF8E7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: r.space.sm,
    },
    mainTitle: {
      fontSize: r.font.xxl,
      fontWeight: '700',
      color: '#2C3E50',
      marginBottom: r.space.xs,
    },
    subtitle: { fontSize: r.font.md, color: '#6C757D', fontWeight: '500' },

    // Card générique
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: r.isTablet ? 720 : '100%',
      backgroundColor: '#FFFFFF',
      marginHorizontal: r.containerPadding,
      marginBottom: r.space.md,
      padding: r.space.lg,
      borderRadius: r.ms(14),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    description: {
      fontSize: r.font.md,
      color: '#495057',
      textAlign: 'center',
      lineHeight: r.ms(22),
    },

    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: r.space.sm,
      gap: r.space.xs,
    },
    sectionHeading: {
      fontSize: r.font.lg,
      fontWeight: '600',
      color: '#2C3E50',
      marginLeft: r.space.xs,
    },

    scheduleInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scheduleText: { fontSize: r.font.md, color: '#495057', fontWeight: '500' },
    scheduleHours: { fontSize: r.font.md, color: '#fec109', fontWeight: '700' },

    // Section title
    sectionTitle: {
      fontSize: r.font.xl,
      fontWeight: '700',
      color: '#2C3E50',
      marginHorizontal: r.containerPadding,
      marginBottom: r.space.sm,
      alignSelf: 'center',
      width: '100%',
      maxWidth: r.isTablet ? 720 : '100%',
    },

    // Grid responsive
    grid: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: r.isTablet ? 720 : '100%',
      paddingHorizontal: r.containerPadding,
      marginBottom: r.space.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: r.gutter,
      rowGap: r.gutter,
      justifyContent: r.isTablet ? 'space-between' : 'flex-start',
    },
    gridItem: { width: r.isTablet ? '48%' : '100%' },

    // Location card
    locationCard: {
      backgroundColor: '#FFFFFF',
      padding: r.space.lg,
      borderRadius: r.ms(14),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: r.space.sm,
      gap: r.space.xs,
    },
    locationTitle: {
      fontSize: r.font.lg,
      fontWeight: '600',
      color: '#2C3E50',
      flexShrink: 1,
    },
    locationInfo: { marginBottom: r.space.md },
    address: {
      fontSize: r.font.md,
      color: '#495057',
      fontWeight: '500',
      marginBottom: r.space.xs,
    },
    reference: { fontSize: r.font.sm, color: '#6C757D', fontStyle: 'italic' },

    // Contact buttons
    contactButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: r.gutter,
    },
    phoneButton: {
      backgroundColor: '#28A745',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: r.ms(14),
      borderRadius: r.ms(10),
      gap: r.space.xs,
      minHeight: r.ms(44),
    },
    emailButton: {
      backgroundColor: '#DC3545',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: r.ms(14),
      borderRadius: r.ms(10),
      gap: r.space.xs,
      minHeight: r.ms(44),
    },
    buttonText: { color: '#FFFFFF', fontSize: r.font.md, fontWeight: '600' },

    // Quick contact
    quickContactTitle: {
      fontSize: r.font.lg,
      fontWeight: '600',
      color: '#2C3E50',
      textAlign: 'center',
      marginBottom: r.space.md,
    },
    quickContactButtons: { gap: r.space.sm },
    quickPhoneButton: {
      backgroundColor: '#fec109',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: r.ms(14),
      borderRadius: r.ms(12),
      shadowColor: '#fec109',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
      minHeight: r.ms(44),
      gap: r.space.xs,
    },
    quickEmailButton: {
      backgroundColor: '#495057',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: r.ms(14),
      borderRadius: r.ms(12),
      minHeight: r.ms(44),
      gap: r.space.xs,
    },
    quickButtonText: {
      color: '#FFFFFF',
      fontSize: r.font.md,
      fontWeight: '600',
    },

    // Rate button
    rateButton: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: r.isTablet ? 720 : '100%',
      backgroundColor: '#FFB300',
      borderRadius: r.ms(12),
      paddingVertical: r.ms(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: r.space.xs,
      minHeight: r.ms(48),
    },
    rateButtonText: {
      color: '#fff',
      fontSize: r.font.md,
      fontWeight: '700',
    },

    // Delete account (Apple 5.1.1(v))
    deleteAccountButton: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: r.isTablet ? 720 : '100%',
      marginTop: r.space.md,
      marginHorizontal: r.containerPadding,
      backgroundColor: '#E53935',
      borderRadius: r.ms(12),
      paddingVertical: r.ms(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: r.space.xs,
      minHeight: r.ms(48),
    },
    deleteAccountText: { color: '#fff', fontSize: r.font.md, fontWeight: '700' },
  });
