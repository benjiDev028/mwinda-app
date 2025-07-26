import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated ,RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthContext } from "../../../context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './Styles';
import HistoryService from '../../../Services/HistoryServices/HistoryService';
export default function ClientCodebarScreen() {
  const { barcodeBase64, reloadBarcode, id } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const[refreshing,setRefreshing] = useState(false);
  const barcodeScale = useRef(new Animated.Value(1)).current;
  const lightPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {t} = useTranslation();
  

  useEffect(() => {
    const fetchData = async () => {
      try {

        const history = await HistoryService.getHistoryUserById(id);
        setHistoryData(history.history);
        console.log("Données reçues de l'API:", history); // DEBUG

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique :", error);
      } finally {
        setLoading(false);
      }
      
    };

    fetchData();
  }, [id]);

const onRefresh = async()=>{
      setRefreshing(true)
      const history = await HistoryService.getHistoryUserById(id);
      setHistoryData(history.history);
      setRefreshing(false)
}


  const renderHistoryItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.historyItem,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50 * (index + 1), 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.historyHeader}>
        <MaterialIcons 
          name={item.reference?.includes('Studio') ? 'music-note' : 'event'} 
          size={24} 
          color="#4CAF50" 
        />
        <Text style={styles.historyAction}>{item.reference}</Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.historyText}>Points: {item.points}</Text>
        <Text style={styles.historyText}>{t('amount')}: {item.amount} $</Text>
      </View>

      <View style={styles.historyFooter}>
        <MaterialIcons name="calendar-today" size={16} color="#6C757D" />
        <Text style={styles.historyDate}>{new Date(item.date_points).toLocaleString()}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Section du code-barres (inchangée) */}
      <LinearGradient
        colors={['#ffffff', '#f5f5f5']}
        style={styles.barcodeContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FEC107" />
        ) : barcodeBase64 ? (
          <>
            <Text style={styles.title}>{t('your barcode')}</Text>
            <View style={styles.barcodeWrapper}>
              <Animated.View
                style={[
                  styles.barcodeImageContainer,
                  { transform: [{ scale: barcodeScale }] },
                ]}
              >
                <Image
                  source={{ uri: `data:image/png;base64,${barcodeBase64}` }}
                  style={styles.barcode}
                  resizeMode="contain"
                />
                <Animated.View
                  style={[
                    styles.lightEffect,
                    {
                      transform: [
                        {
                          translateX: lightPosition.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 300],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </Animated.View>
              <MaterialIcons name="qr-code-scanner" size={40} color="#FEC107" style={styles.barcodeIcon} />
            </View>
            <TouchableOpacity onPress={reloadBarcode} activeOpacity={0.8}>
              <View style={styles.reloadButton}>
                <Text style={styles.reloadButtonText}>{t('reload')}</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noBarcodeText}>{t('no barcode')}</Text>
        )}
      </LinearGradient>

      {/* Section de l'historique */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>{t('history')}</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#FEC107" />
        ) : historyData ? (
          <FlatList
            data={historyData}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            ListEmptyComponent={
              <Text style={styles.noHistoryText}>{t('no history')}</Text>
            }
             refreshControl={
                                <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#2196F3']}
                                tintColors={['#FEC107']}
                                />
                              }
          />
        ) : (
          <Text style={styles.errorText}>{t('error history')}</Text>
        )}
      </View>
    </View>
  );
}