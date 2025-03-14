import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, ScrollView ,RefreshControl} from "react-native";
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { AuthContext } from '../../../context/AuthContext';
import { useContext } from "react";
import { MaterialIcons } from '@expo/vector-icons'; // Pour les icônes
import { useTranslation } from 'react-i18next';



export default function ClientPointsScreen() {
  const { id } = useContext(AuthContext);
  const [studioPoints, setStudioPoints] = useState(0);
  const [eventPoints, setEventPoints] = useState(0);
  const [animatedStudio] = useState(new Animated.Value(0));
  const [animatedEvent] = useState(new Animated.Value(0));
  const [refreshing,setRefreshing] =useState(false);
  const {t} = useTranslation();

  // Fonction pour récupérer les points de fidélité
  const fetchPoints = async () => {
    const data = await LoyaltyService.getLoyaltyPoint(id);
    if (data) {
      setStudioPoints(data.pointstudios || 0);
      setEventPoints(data.pointevents || 0);
    }
  };

  // Récupérer les points de fidélité au chargement initial
  useEffect(() => {
    fetchPoints();
  }, []);

  const onRefresh = async ()=>{
    setRefreshing(true);
    await fetchPoints();
    setRefreshing(false);
  }

  // Configurer un intervalle pour vérifier les mises à jour des points
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchPoints();
  //   }); // Vérifie toutes les 5 secondes

  //   return () => clearInterval(interval); // Nettoyer l'intervalle lors du démontage du composant
  // }, []);

  // Animer les barres de progression
  useEffect(() => {
    Animated.timing(animatedStudio, {
      toValue: studioPoints,
      duration: 500,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedEvent, {
      toValue: eventPoints,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [studioPoints, eventPoints]);

  // Interpoler les valeurs pour les barres de progression
  const progressStudio = animatedStudio.interpolate({
    inputRange: [0, 14000],
    outputRange: ["0%", "100%"],
  });

  const progressEvent = animatedEvent.interpolate({
    inputRange: [0, 50000],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScrollView>
       refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2196F3']}
                    tintColors={['#FEC107']}
                    />
                  }

   
    <View style={styles.container}>
      {/* Titre principal */}
      <Text style={styles.title}>{t('your points')}</Text>

      {/* Carte pour les points Studio */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="photo-camera" size={24} color="#FEC107" />
          <Text style={styles.sectionTitle}>{t('studio points')} : {studioPoints}</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width: progressStudio }]} />
        </View>
      </View>

      {/* Carte pour les points Events */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="event" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>{t('event points')} : {eventPoints}</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width: progressEvent }]} />
        </View>
      </View>

      {/* Labels pour les limites des barres de progression */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>0</Text>
        <Text style={styles.label}>5000</Text>
        <Text style={styles.label}>10000</Text>
        <Text style={styles.label}>14000</Text>
        <Text style={styles.label}>50000</Text>
      </View>
    </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FEC107",
    borderRadius: 10,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
});