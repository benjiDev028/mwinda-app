// src/Screens/client/ClientPointsScreen/ClientPointsScreen.js
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { AuthContext } from '../../../context/AuthContext';
import { useResponsive } from "../../../Utils/responsive";

export default function ClientPointsScreen() {
  const { id } = useContext(AuthContext);
  const { t } = useTranslation();
  const [studioPoints, setStudioPoints] = useState(0);
  const [eventPoints, setEventPoints] = useState(0);
  const [animatedStudio] = useState(new Animated.Value(0));
  const [animatedEvent] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  // 🌟 Responsive goodies
  const r = useResponsive();

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

  useEffect(() => {
    Animated.timing(animatedStudio, {
      toValue: studioPoints,
      duration: 800,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedEvent, {
      toValue: eventPoints,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [studioPoints, eventPoints]);

  const progressStudio = animatedStudio.interpolate({
    inputRange: [0, 14000],
    outputRange: ["0%", "100%"],
  });
  const progressEvent = animatedEvent.interpolate({
    inputRange: [0, 50000],
    outputRange: ["0%", "100%"],
  });

  const formatPoints = (pts) => pts.toLocaleString('fr-FR');

  // 🎯 Styles dépendants du device (évite les if partout)
  const styles = useMemo(() => makeStyles(r), [r]);

  // largeur calculée pour 2 colonnes sur iPad
  const cardWidth = useMemo(() => {
    if (r.columns === 1) return '100%';
    const totalGutters = r.gutter; // 1 gouttière entre 2 cartes
    const totalPadding = r.containerPadding * 2;
    const usable = r.width - totalPadding - totalGutters;
    return Math.round(usable / 2);
  }, [r]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { paddingHorizontal: r.containerPadding, paddingBottom: r.space.lg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FEC109']}
          tintColor="#FEC109"
        />
      }
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('your points')}</Text>
        </View>

        {/* Cards grid */}
        <View style={[styles.cardsContainer, r.columns === 2 && styles.cardsRow]}>
          {/* Studio */}
          <View style={[styles.card, styles.studioCard, { width: cardWidth }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF8E1' }]}>
                <MaterialIcons name="photo-camera" size={r.ms(18)} color="#FEC109" />
              </View>
              <Text style={styles.cardTitle}>{t('studio points')}</Text>
            </View>

            <Text style={styles.pointsValue}>{formatPoints(studioPoints)} pts</Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBar, { width: progressStudio }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0</Text>
                <Text style={styles.progressLabel}>14k</Text>
              </View>
            </View>
          </View>

          {/* Event */}
          <View style={[styles.card, styles.eventCard, { width: cardWidth }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="event" size={r.ms(18)} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>{t('event points')}</Text>
            </View>

            <Text style={styles.pointsValue}>{formatPoints(eventPoints)} pts</Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBar, styles.eventProgress, { width: progressEvent }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0</Text>
                <Text style={styles.progressLabel}>50k</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// 🧵 Styles paramétrés par le hook responsive
const makeStyles = (r) => StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#F8F8F8" },
  container: { flex: 1, paddingTop: r.space.lg },
  header: { marginBottom: r.space.lg, alignItems: 'center' },
  title: { fontSize: r.font.xxl, fontWeight: '700', color: '#333' },

  cardsContainer: { marginBottom: r.space.md },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: r.gutter, // RN >= 0.73; si plus vieux, remplace par marges
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: r.ms(16),
    padding: r.space.md,
    marginBottom: r.space.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studioCard: { borderLeftWidth: 4, borderLeftColor: '#FEC109' },
  eventCard: { borderLeftWidth: 4, borderLeftColor: '#4CAF50' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: r.space.sm },
  iconContainer: {
    width: r.ms(36), height: r.ms(36), borderRadius: r.ms(18),
    justifyContent: 'center', alignItems: 'center', marginRight: r.space.sm,
  },
  cardTitle: { fontSize: r.font.lg, fontWeight: '600', color: '#333' },
  pointsValue: {
    fontSize: r.font.xl, fontWeight: '700', color: '#333',
    marginBottom: r.space.md, textAlign: 'center',
  },

  progressContainer: { marginBottom: r.space.xs },
  progressBarBackground: {
    height: r.ms(8), backgroundColor: "#EEEEEE",
    borderRadius: r.ms(4), overflow: "hidden", marginBottom: r.space.xs,
  },
  progressBar: { height: "100%", backgroundColor: "#FEC109", borderRadius: r.ms(4) },
  eventProgress: { backgroundColor: "#4CAF50" },

  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: r.font.sm, color: '#9E9E9E' },
});
