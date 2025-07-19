import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView ,RefreshControl} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { AuthContext } from '../../../context/AuthContext';
import ClientStack from '../../../navigation/client/ClientTabs';
import {styles} from "./Styles";

const COLORS = {
  primary: '#FEC109',
  dark: '#121212',
  light: '#FFFFFF',
  text: '#333333',
  lightText: '#666666',
  background: '#F8F9FA',
  cardBorder: '#E9ECEF',
  secondary: '#6C757D',
  accentBlue: '#0D6EFD',
  accentGreen: '#198754'
};

const services = [
  { 
    id: '1', 
    name: 'Studio', 
    description: 'Séances photo professionnelles',
    icon: 'camerao',
    accent: '#0D6EFD' // Bleu
  },
  { 
    id: '2', 
    name: 'Mariages', 
    description: 'Immortalisez votre jour .',
    icon: 'heart',
    accent: '#DC3545' // Rouge
  },
  { 
    id: '3', 
    name: 'Événements', 
    description: 'Anniversaires et célébrations',
    icon: 'calendar',
    accent: '#198754' // Vert
  },
  { 
    id: '4', 
    name: 'Outdoor', 
    description: 'Photos professionnelles',
    icon: 'cloudo',
    accent: '#6F42C1' // Violet
  },
];

export default function ClientHomeScreen({navigation}) {
  const [studioPoints, setStudioPoints] = useState(0);
  const [eventPoints, setEventPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { id } = useContext(AuthContext);

  const fetchPoints = async () => {
    const data = await LoyaltyService.getLoyaltyPoint(id);
    if (data) {
      setStudioPoints(data.pointstudios || 0);
      setEventPoints(data.pointevents || 0);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPoints();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <AntDesign name="camera" size={24} color={COLORS.light} />
          </View>
          <Text style={styles.slogan}>L'ART DE CAPTURER L'ÉMOTION</Text>
          <Text style={styles.subSlogan}>Des souvenirs qui durent toute une vie</Text>
        </View>

        {/* Section Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>NOS SERVICES EXCLUSIFS</Text>
          
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={[
                  styles.serviceCard,
                  { borderTopColor: service.accent, borderTopWidth: 3 }
                ]}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.accent}20` }]}>
                  <AntDesign name={service.icon} size={20} color={service.accent} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.separator} />
                <View style={styles.ctaContainer}>
                  <Text style={[styles.ctaText, { color: service.accent }]}>Explorer</Text>
                  <AntDesign name="arrowright" size={14} color= {service.accent } />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Programme de fidélité */}
        <TouchableOpacity 
          style={styles.loyaltyCard}
          onPress={() => navigation.navigate('points')}
        >
          <View style={styles.loyaltyContent}>
            <View style={styles.loyaltyIcon}>
              <AntDesign name="star" size={20} color={COLORS.dark} />
            </View>
            <View>
              <Text style={styles.loyaltyTitle}>VOTRE RÉCOMPENSE</Text>
              <Text style={styles.loyaltyPoints}>
                {studioPoints + eventPoints} 
                <Text style={{ color: COLORS.primary }}> ★</Text>
              </Text>
            </View>
          </View>
          <AntDesign name="right" size={16} color={COLORS.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

