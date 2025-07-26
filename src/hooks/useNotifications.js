// hooks/useNotifications.js
import { useEffect, useState } from 'react';
import notificationService from '../Services/NotificationService';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Fonction d'initialisation
    const initNotifications = async () => {
      try {
        // Initialiser le service
        const token = await notificationService.initialize();
        
        if (mounted) {
          setPushToken(token);
          setIsInitialized(true);
        }

        // Configurer les canaux Android
        await notificationService.setupNotificationChannels();

        // Configurer les écouteurs
        notificationService.setupNotificationListeners(
          // Quand une notification est reçue
          (notification) => {
            if (mounted) {
              setLastNotification(notification);
              console.log('📬 Nouvelle notification:', notification.request.content.title);
            }
          },
          // Quand une notification est tapée
          (response) => {
            console.log('👆 Notification tapée:', response.notification.request.content.title);
            // Ici vous pouvez ajouter la navigation automatique selon le type
            handleNotificationTap(response);
          }
        );

      } catch (error) {
        console.error('❌ Erreur initialisation notifications:', error);
      }
    };

    initNotifications();

    // Cleanup
    return () => {
      mounted = false;
      notificationService.removeNotificationListeners();
    };
  }, []);

  /**
   * Gère le tap sur une notification
   * Vous pouvez personnaliser cette fonction selon vos besoins de navigation
   */
  const handleNotificationTap = (response) => {
    const data = response.notification.request.content.data;
    
    switch (data?.type) {
      case 'scan_success':
        // Naviguer vers l'historique des scans
        console.log('Navigation vers historique scan');
        break;
      case 'user_created':
      case 'user_updated':
        // Naviguer vers la liste des utilisateurs
        console.log('Navigation vers liste utilisateurs');
        break;
      case 'reminder':
        // Action pour les rappels
        console.log('Traitement du rappel');
        break;
      default:
        console.log('Notification tapée sans action spécifique');
    }
  };

  // Fonctions utilitaires à retourner
  const notify = {
    // Notifications pour les scans
    scanSuccess: (productName) => notificationService.notifySuccessfulScan(productName),
    
    // Notifications pour les utilisateurs
    userCreated: (userName) => notificationService.notifyUserCreated(userName),
    userUpdated: (userName) => notificationService.notifyUserUpdated(userName),
    
    // Notification personnalisée
    custom: (title, message, data) => notificationService.notifyCustomAction(title, message, data),
    
    // Programmer un rappel
    scheduleReminder: (title, message, delayInSeconds, data) => 
      notificationService.scheduleReminder(title, message, delayInSeconds, data),
    
    // Test
    test: () => notificationService.testNotification(),
  };

  const manage = {
    // Gestion des notifications programmées
    cancelScheduled: (id) => notificationService.cancelScheduledNotification(id),
    cancelAll: () => notificationService.cancelAllScheduledNotifications(),
    getScheduled: () => notificationService.getScheduledNotifications(),
    
    // Token pour le serveur
    getToken: () => notificationService.getToken(),
  };

  return {
    isInitialized,
    pushToken,
    lastNotification,
    notify,
    manage,
  };
};