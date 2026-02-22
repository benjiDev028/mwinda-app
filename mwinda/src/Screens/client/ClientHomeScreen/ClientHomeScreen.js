import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl, useWindowDimensions
} from 'react-native';
import { Linking } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { AuthContext } from '../../../context/AuthContext';

const COLORS = {
  primary: '#FEC109',
  dark: '#121212',
  light: '#FFFFFF',
  text: '#333333',
  lightText: '#666666',
  background: '#F8F9FA',
  cardBorder: '#E9ECEF',
  secondary: '#6C757D',
};

const SERVICES = [
  { id: '1', name: 'Studio',    description: 'Séances photo professionnelles', icon: 'camerao', accent: '#0D6EFD' },
  { id: '2', name: 'Mariages',  description: 'Immortalisez votre jour .',      icon: 'heart',   accent: '#DC3545' },
  { id: '3', name: 'Événements',description: 'Anniversaires et célébrations',  icon: 'calendar',accent: '#198754' },
  { id: '4', name: 'Outdoor',   description: 'Photos professionnelles',        icon: 'cloudo',  accent: '#6F42C1' },
];

export default function ClientHomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions(); // ← s’actualise à chaque rotation/redimensionnement
  const isTablet = width >= 768;                   // ← seuil simple, fonctionne bien
  const MAX_CONTENT = 900;                         // ← largeur max centrée (évite les étirements moches)
  const H_PAD = 20;                                // ← padding horizontal
  const GUTTER = 12;                               // ← espace entre cartes

  // 🔢 Calcule dynamiquement colonnes et largeur de carte
  const { contentW, columns, cardW } = useMemo(() => {
    const cw = Math.min(width, MAX_CONTENT);
    const minCard = isTablet ? 260 : 160; // largeur minimale souhaitée par carte
    const cols = Math.max(2, Math.min(4, Math.floor((cw - H_PAD * 2 + GUTTER) / (minCard + GUTTER))));
    const cardWidth = (cw - H_PAD * 2 - GUTTER * (cols - 1)) / cols;
    return { contentW: cw, columns: cols, cardW: cardWidth };
  }, [width, isTablet]);

  // 🔡 Échelle typo simple (évite police minuscule sur iPad)
  const scale = Math.min(width / 375, 1.4);
  const fs = (n) => Math.round(n * scale);

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

  useEffect(() => { fetchPoints(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPoints();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 30,
          width: '100%',
          maxWidth: MAX_CONTENT,
          alignSelf: 'center',
          paddingHorizontal: H_PAD
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: isTablet ? 48 : 40,
          paddingBottom: isTablet ? 34 : 30,
          alignItems: 'center',
          backgroundColor: COLORS.light,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}>
          <View style={{
            width: isTablet ? 60 : 50,
            height: isTablet ? 60 : 50,
            borderRadius: isTablet ? 30 : 25,
            backgroundColor: COLORS.dark,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
          }}>
            <AntDesign name="camera" size={isTablet ? 28 : 24} color={COLORS.light} />
          </View>
          <Text style={{
            fontSize: fs(22),
            fontWeight: '700',
            color: COLORS.dark,
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: 0.5
          }}>
            L'ART DE CAPTURER L'ÉMOTION
          </Text>
          <Text style={{
            fontSize: fs(14),
            color: COLORS.secondary,
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: fs(20),
          }}>
            Des souvenirs qui durent toute une vie
          </Text>
        </View>

        {/* Services */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: fs(13),
            fontWeight: '600',
            color: COLORS.secondary,
            letterSpacing: 1.5,
            textAlign: 'center',
            marginBottom: 25,
            textTransform: 'uppercase',
          }}>
            NOS SERVICES EXCLUSIFS
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {SERVICES.map((service) => (
              <TouchableOpacity
               onPress={() => {
               Linking.openURL("https://mwindardc.com");
  }}
                key={service.id}
                activeOpacity={0.85}
                style={{
                  width: cardW,
                  backgroundColor: COLORS.light,
                  borderRadius: 10,
                  padding: isTablet ? 20 : 18,
                  marginBottom: 15,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.cardBorder,
                  borderTopWidth: 3,
                  borderTopColor: service.accent,
                }}
              >
                <View style={{
                  width: isTablet ? 44 : 40,
                  height: isTablet ? 44 : 40,
                  borderRadius: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                  backgroundColor: `${service.accent}20`,
                }}>
                  <AntDesign name={service.icon} size={isTablet ? 22 : 20} color={service.accent} />
                </View>

                <Text style={{ fontSize: fs(16), fontWeight: '600', color: COLORS.dark, marginBottom: 8, textAlign: 'center' }}>
                  {service.name}
                </Text>
                <Text style={{ fontSize: fs(12), color: COLORS.lightText, textAlign: 'center', marginBottom: 15, lineHeight: fs(18) }}>
                  {service.description}
                </Text>

                <View style={{ height: 1, width: '100%', backgroundColor: COLORS.cardBorder, marginBottom: 12 }} />

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: fs(12), fontWeight: '600', marginRight: 5, color: service.accent }}>
                    Explorer
                  </Text>
                  <AntDesign name="arrowright" size={isTablet ? 16 : 14} color={service.accent} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fidélité */}
        <TouchableOpacity
          onPress={() => navigation.navigate('points')}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.light,
            borderRadius: 12,
            padding: isTablet ? 20 : 18,
            borderWidth: 1,
            borderColor: COLORS.cardBorder,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: isTablet ? 40 : 36,
              height: isTablet ? 40 : 36,
              borderRadius: 20,
              backgroundColor: '#FFF9C4',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <AntDesign name="star" size={isTablet ? 22 : 20} color={COLORS.dark} />
            </View>
            <View>
              <Text style={{ fontSize: fs(12), fontWeight: '600', color: COLORS.secondary, letterSpacing: 1, marginBottom: 2 }}>
                VOTRE RÉCOMPENSE
              </Text>
              <Text style={{ fontSize: fs(18), fontWeight: '700', color: COLORS.dark }}>
                {studioPoints + eventPoints}<Text style={{ color: COLORS.primary }}> ★</Text>
              </Text>
            </View>
          </View>
          <AntDesign name="right" size={isTablet ? 18 : 16} color={COLORS.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
