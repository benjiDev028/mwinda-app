// services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    
    // Configuration par défaut des notifications
    this.setupNotificationHandler();
  }

  /**
   * Configuration du comportement des notifications
   * Définit comment l'app réagit quand elle reçoit une notification
   */
  setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,      // Afficher l'alerte
        shouldPlaySound: true,      // Jouer le son par défaut
        shouldSetBadge: false,      // Ne pas modifier le badge de l'app
      }),
    });
  }

  /**
   * Demande les permissions et configure le token push
   * OBLIGATOIRE : À appeler au démarrage de l'app
   */
  async initialize() {
    try {
      // Vérification si on est sur un appareil physique
      if (!Device.isDevice) {
        console.warn('Les notifications push ne fonctionnent pas sur les simulateurs/émulateurs');
        return null;
      }

      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Si pas encore accordées, demander les permissions
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Si permissions refusées
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Les notifications sont nécessaires pour vous tenir informé des actions importantes.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Obtenir le token Expo Push
      this.expoPushToken = await this.getExpoPushTokenAsync();
      
      console.log('✅ Notifications initialisées avec succès');
      console.log('📱 Push Token:', this.expoPushToken);
      
      return this.expoPushToken;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
      return null;
    }
  }

  /**
   * Récupère le token Expo Push (identifiant unique de l'appareil)
   * Ce token est nécessaire pour envoyer des notifications à cet appareil spécifique
   */
  async getExpoPushTokenAsync() {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                       Constants.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID manquant dans la configuration Expo');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      return tokenData.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      throw error;
    }
  }

  /**
   * Configure les canaux de notification pour Android
   * Android nécessite des canaux pour organiser les types de notifications
   */
  async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      // Canal pour les actions administrateur
      await Notifications.setNotificationChannelAsync('admin-actions', {
        name: 'Actions Administrateur',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#fec107',
        description: 'Notifications pour les actions importantes de l\'administrateur',
      });

      // Canal pour les scans de codes-barres
      await Notifications.setNotificationChannelAsync('barcode-scan', {
        name: 'Scans Code-barres',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#00ff00',
        description: 'Notifications lors des scans de codes-barres',
      });

      // Canal pour les actions utilisateur
      await Notifications.setNotificationChannelAsync('user-actions', {
        name: 'Actions Utilisateur',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150, 150],
        lightColor: '#0099ff',
        description: 'Notifications pour les actions des utilisateurs',
      });

      console.log('✅ Canaux Android configurés');
    }
  }

  /**
   * Configure les écouteurs de notifications
   * Permet de réagir quand une notification est reçue ou tapée
   */
  setupNotificationListeners(onNotificationReceived, onNotificationTapped) {
    // Écoute les notifications reçues quand l'app est ouverte
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification reçue:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Écoute les taps sur les notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapée:', response);
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      }
    );
  }

  /**
   * Nettoie les écouteurs (important pour éviter les fuites mémoire)
   * À appeler dans le cleanup des composants
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * NOTIFICATION LOCALE - Scan réussi
   */
  async notifySuccessfulScan(productName = 'Produit') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Scan réussi !',
        body: `Le produit "${productName}" a été scanné avec succès.`,
        data: { 
          type: 'scan_success', 
          productName,
          timestamp: new Date().toISOString()
        },
        sound: 'default',
      },
      trigger: null, // Immédiatement
      channelId: 'barcode-scan',
    });
  }

  /**
   * NOTIFICATION LOCALE - Utilisateur créé
   */
  async notifyUserCreated(userName) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👤 Nouvel utilisateur',
        body: `L'utilisateur "${userName}" a été créé avec succès.`,
        data: { 
          type: 'user_created', 
          userName,
          timestamp: new Date().toISOString()
        },
        sound: 'default',
      },
      trigger: null,
      channelId: 'admin-actions',
    });
  }

  /**
   * NOTIFICATION LOCALE - Utilisateur modifié
   */
  async notifyUserUpdated(userName) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Utilisateur modifié',
        body: `Les informations de "${userName}" ont été mises à jour.`,
        data: { 
          type: 'user_updated', 
          userName,
          timestamp: new Date().toISOString()
        },
        sound: 'default',
      },
      trigger: null,
      channelId: 'admin-actions',
    });
  }

  /**
   * NOTIFICATION LOCALE - Action personnalisée
   */
  async notifyCustomAction(title, message, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
        data: {
          type: 'custom_action',
          ...data,
          timestamp: new Date().toISOString()
        },
        sound: 'default',
      },
      trigger: null,
      channelId: 'user-actions',
    });
  }

  /**
   * NOTIFICATION PROGRAMMÉE - Rappel
   */
  async scheduleReminder(title, message, delayInSeconds, data = {}) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
        data: {
          type: 'reminder',
          ...data,
          timestamp: new Date().toISOString()
        },
        sound: 'default',
      },
      trigger: {
        seconds: delayInSeconds,
      },
      channelId: 'user-actions',
    });

    console.log(`⏰ Rappel programmé dans ${delayInSeconds}s:`, notificationId);
    return notificationId;
  }

  /**
   * Annule une notification programmée
   */
  async cancelScheduledNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('❌ Notification annulée:', notificationId);
  }

  /**
   * Récupère toutes les notifications programmées
   */
  async getScheduledNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Notifications programmées:', notifications);
    return notifications;
  }

  /**
   * Annule toutes les notifications programmées
   */
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Toutes les notifications programmées ont été annulées');
  }

  /**
   * Récupère le token pour l'envoyer au serveur
   */
  getToken() {
    return this.expoPushToken;
  }

  /**
   * Méthode pour tester les notifications
   */
  async testNotification() {
    await this.notifyCustomAction(
      '🧪 Test de notification',
      'Si vous voyez ceci, les notifications fonctionnent parfaitement !',
      { isTest: true }
    );
  }
}

// Créer une instance unique (Singleton)
const notificationService = new NotificationService();

export default notificationService;