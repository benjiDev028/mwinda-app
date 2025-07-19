import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Animated, ScrollView, RefreshControl } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { AuthContext } from '../../../context/AuthContext';

export default function ClientPointsScreen() {
  const { id } = useContext(AuthContext);
  const [studioPoints, setStudioPoints] = useState(0);
  const [eventPoints, setEventPoints] = useState(0);
  const [animatedStudio] = useState(new Animated.Value(0));
  const [animatedEvent] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

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

  const formatPoints = (points) => {
    return points.toLocaleString('fr-FR');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('your points')}</Text>
          <Text style={styles.subtitle}>{t('accumulate_points')}</Text>
        </View>

        {/* Points Cards */}
        <View style={styles.cardsContainer}>
          {/* Studio Points Card */}
          <View style={[styles.card, styles.studioCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF8E1' }]}>
                <MaterialIcons name="photo-camera" size={20} color="#FEC109" />
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

          {/* Event Points Card */}
          <View style={[styles.card, styles.eventCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="event" size={20} color="#4CAF50" />
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

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <MaterialIcons name="info-outline" size={18} color="#9E9E9E" />
          <Text style={styles.infoText}>{t('points_info')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F8F8",
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    maxWidth: '80%',
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studioCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FEC109',
  },
  eventCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FEC109",
    borderRadius: 4,
  },
  eventProgress: {
    backgroundColor: "#4CAF50",
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 12,
    flex: 1,
  },
});