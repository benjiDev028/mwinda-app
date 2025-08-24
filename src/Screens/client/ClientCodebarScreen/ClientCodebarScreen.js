import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  ActivityIndicator, Animated, RefreshControl, StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { AuthContext } from '../../../context/AuthContext';
import HistoryService from '../../../Services/HistoryServices/HistoryService';
import { useResponsive } from '../../../Utils/responsive';

export default function ClientCodebarScreen() {
  const { barcodeBase64, reloadBarcode, id } = useContext(AuthContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const barcodeScale = useRef(new Animated.Value(1)).current;
  const lightPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Responsive
  const r = useResponsive();
  const styles = useMemo(() => makeStyles(r), [r]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const history = await HistoryService.getHistoryUserById(id);
        setHistoryData(history?.history ?? []);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      } catch (e) {
        console.error("Erreur lors du chargement de l'historique :", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const history = await HistoryService.getHistoryUserById(id);
      setHistoryData(history?.history ?? []);
    } finally {
      setRefreshing(false);
    }
  };

  // Animation de balayage du “light” sur le code-barres
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightPosition, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(lightPosition, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, [lightPosition]);

  // Largeurs calculées pour la grille iPad (2 colonnes)
  const cardWidth = useMemo(() => {
    if (r.columns === 1) return '100%';
    const gutters = r.gutter; // 1 gouttière entre 2 cartes
    const usable = r.width - r.containerPadding * 2 - gutters;
    return Math.floor(usable / 2);
  }, [r]);

  const renderHistoryItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.historyItem,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30 * (index + 1), 0] })
          }],
          width: cardWidth,
        }
      ]}
    >
      <View style={styles.historyHeader}>
        <MaterialIcons
          name={item?.reference?.includes('Studio') ? 'music-note' : 'event'}
          size={r.ms(22)}
          color="#4CAF50"
        />
        <Text style={styles.historyAction} numberOfLines={2} ellipsizeMode="tail">{item?.reference}</Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.historyText}>Points: {item?.points}</Text>
        <Text style={styles.historyText}>{t('amount')}: {item?.amount} $</Text>
      </View>

      <View style={styles.historyFooter}>
        <MaterialIcons name="calendar-today" size={r.ms(14)} color="#6C757D" />
        <Text style={styles.historyDate}>
          {item?.date_points ? new Date(item.date_points).toLocaleString() : '—'}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.screen}>
      {/* CODE-BARRES */}
      <LinearGradient colors={['#ffffff', '#f5f5f5']} style={styles.barcodeContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FEC107" />
        ) : barcodeBase64 ? (
          <>
            <Text style={styles.title}>{t('your barcode')}</Text>
            <View style={styles.barcodeWrapper}>
              <Animated.View style={[styles.barcodeImageContainer, { transform: [{ scale: barcodeScale }] }]}>
                <Image
                  source={{ uri: `data:image/png;base64,${barcodeBase64}` }}
                  style={styles.barcode}
                  resizeMode="contain"
                  accessible accessibilityLabel={t('your barcode')}
                />
                <Animated.View
                  style={[
                    styles.lightEffect,
                    {
                      transform: [{
                        translateX: lightPosition.interpolate({ inputRange: [0, 1], outputRange: [-r.ms(80), r.ms(280)] })
                      }],
                    },
                  ]}
                />
              </Animated.View>

              <MaterialIcons name="qr-code-scanner" size={r.ms(36)} color="#FEC107" style={styles.barcodeIcon} />
            </View>

            <TouchableOpacity onPress={reloadBarcode} activeOpacity={0.8} style={styles.reloadButton}>
              <Text style={styles.reloadButtonText}>{t('reload')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noBarcodeText}>{t('no barcode')}</Text>
        )}
      </LinearGradient>

      {/* HISTORIQUE */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>{t('history')}</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#FEC107" />
        ) : (
          <FlatList
            data={historyData}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderHistoryItem}
            numColumns={r.columns}               // ✅ 2 colonnes sur iPad, 1 sur iPhone
            columnWrapperStyle={r.columns === 2 ? { justifyContent: 'space-between', gap: r.gutter } : undefined}
            ListEmptyComponent={<Text style={styles.noHistoryText}>{t('no history')}</Text>}
            contentContainerStyle={{ paddingHorizontal: r.containerPadding, paddingBottom: r.space.lg }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FEC107']}            // Android
                tintColor="#FEC107"             // iOS
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const makeStyles = (r) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },

  // BARCODE
  barcodeContainer: {
    paddingHorizontal: r.containerPadding,
    paddingTop: r.space.lg,
    paddingBottom: r.space.md,
    borderBottomLeftRadius: r.ms(20),
    borderBottomRightRadius: r.ms(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: r.font.xxl, fontWeight: '700', color: '#333', marginBottom: r.space.sm, textAlign: 'center' },
  barcodeWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  barcodeImageContainer: {
    borderWidth: 2, borderColor: '#FEC107', borderRadius: r.ms(12),
    padding: r.space.sm, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  // ✅ taille adaptative du code-barres
  barcode: {
    width: r.isTablet ? r.scale(420) : r.scale(260),
    height: r.isTablet ? r.vscale(220) : r.vscale(150),
  },
  barcodeIcon: { position: 'absolute', right: -r.ms(18), top: -r.ms(18) },

  lightEffect: {
    position: 'absolute', top: 0, left: 0,
    width: r.ms(50), height: '100%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ skewX: '-20deg' }],
  },

  reloadButton: {
    alignSelf: 'center',
    backgroundColor: '#FEC107',
    paddingVertical: r.ms(12),
    paddingHorizontal: r.ms(28),
    borderRadius: r.ms(24),
    marginTop: r.space.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  reloadButtonText: { color: '#fff', fontSize: r.font.md, fontWeight: '700' },
  noBarcodeText: { fontSize: r.font.lg, color: '#555', textAlign: 'center' },

  // HISTO
  historyContainer: { flex: 1, paddingTop: r.space.lg },
  historyTitle: { fontSize: r.font.xl, fontWeight: '700', color: '#333', marginBottom: r.space.md, paddingHorizontal: r.containerPadding },

  historyItem: {
    backgroundColor: '#fff',
    padding: r.space.md,
    marginBottom: r.space.md,
    borderRadius: r.ms(12),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: r.space.sm, gap: r.space.sm },
  historyAction: { fontSize: r.font.md, fontWeight: '600', color: '#333', flexShrink: 1 },

  historyDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: r.space.xs },
  historyText: { fontSize: r.font.md, color: '#555' },

  historyFooter: { flexDirection: 'row', alignItems: 'center', gap: r.space.xs },
  historyDate: { fontSize: r.font.sm, color: '#6C757D' },
});
