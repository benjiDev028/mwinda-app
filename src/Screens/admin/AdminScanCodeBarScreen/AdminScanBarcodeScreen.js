import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Alert,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import Toast from "react-native-toast-message";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AuthContext } from "../../../context/AuthContext";
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";

const COLORS = {
  primary: '#FEC109',
  dark: '#121212',
  light: '#FFFFFF',
  gray: '#F5F5F5',
  text: '#333333',
  lightText: '#666666',
  error: '#F44336',
  success: '#4CAF50'
};

// Messages d'erreur constants
const ERROR_MESSAGES = {
  CAMERA_PERMISSION_DENIED: "Accès à la caméra refusé",
  CAMERA_PERMISSION_REQUEST: "Demande d'autorisation de la caméra...",
  REQUIRED_FIELDS: "Veuillez remplir tous les champs obligatoires",
  INVALID_AMOUNT: "Le montant doit être un nombre valide",
  CODE_NOT_FOUND: "Code de fidélité incorrect ou inexistant",
  NETWORK_ERROR: "Erreur de connexion. Vérifiez votre réseau",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard",
  GENERIC_ERROR: "Une erreur inattendue s'est produite",
  VALIDATION_ERROR: "Données invalides"
};

const SUCCESS_MESSAGES = {
  CODE_SCANNED: "Code scanné avec succès",
  POINTS_ADDED: "Points ajoutés avec succès!"
};

export default function LoyaltyScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    manualCode: "",
    amount: "",
    currency: "USD",
    service: "",
    reference: "Studio"
  });
  
  const [errors, setErrors] = useState({});
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isReferenceModalVisible, setIsReferenceModalVisible] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  // Fonction pour afficher les toasts d'erreur
  const showErrorToast = useCallback((title, message) => {
    Toast.show({
      type: "error",
      position: "top",
      text1: title,
      text2: message,
      visibilityTime: 3000
    });
  }, []);

  // Fonction pour afficher les toasts de succès
  const showSuccessToast = useCallback((title, message) => {
    Toast.show({
      type: "success",
      position: "top",
      text1: title,
      text2: message,
      visibilityTime: 2000
    });
  }, []);

  // Gestion des permissions caméra avec gestion d'erreur
  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Erreur lors de la demande de permission caméra:", error);
        setHasPermission(false);
        showErrorToast("Erreur", "Impossible d'accéder aux permissions de la caméra");
      }
    };

    getCameraPermissions();
  }, [showErrorToast]);

  // Animations avec gestion d'erreur
  const fadeInModal = useCallback(() => {
    try {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Erreur animation fadeIn:", error);
    }
  }, [animationValue]);

  const fadeOutModal = useCallback(() => {
    try {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Erreur animation fadeOut:", error);
    }
  }, [animationValue]);

  // Validation des données du formulaire
  const validateForm = useCallback(() => {
    const newErrors = {};
    const { manualCode, amount, service, reference } = formData;

    if (!manualCode?.trim()) {
      newErrors.manualCode = "Le code de fidélité est obligatoire";
    }

    if (!amount?.trim()) {
      newErrors.amount = "Le montant est obligatoire";
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = "Le montant doit être un nombre positif";
    }

    if (!service?.trim()) {
      newErrors.service = "Le service est obligatoire";
    }

    if (!reference?.trim()) {
      newErrors.reference = "La référence est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Gestion du scan de code-barres avec validation
  const handleBarcodeScanned = useCallback(({ data }) => {
    try {
      if (!data || typeof data !== 'string') {
        showErrorToast("Erreur", "Code scanné invalide");
        return;
      }

      setScanned(true);
      setFormData(prev => ({ ...prev, manualCode: data.trim() }));
      
      showSuccessToast(SUCCESS_MESSAGES.CODE_SCANNED, `Code: ${data}`);

      setCameraOpen(false);
      setManualEntry(true);
      fadeInModal();
    } catch (error) {
      console.error("Erreur lors du scan:", error);
      showErrorToast("Erreur", "Erreur lors du traitement du code scanné");
    }
  }, [showErrorToast, showSuccessToast, fadeInModal]);

  // Ouverture de la saisie manuelle
  const handleOpenManualEntry = useCallback(() => {
    try {
      setCameraOpen(false);
      setManualEntry(true);
      setErrors({});
      fadeInModal();
    } catch (error) {
      console.error("Erreur ouverture saisie manuelle:", error);
      showErrorToast("Erreur", "Impossible d'ouvrir la saisie manuelle");
    }
  }, [fadeInModal, showErrorToast]);

  // Fermeture du modal avec reset
  const handleCloseModal = useCallback(() => {
    try {
      fadeOutModal();
      setTimeout(() => {
        setManualEntry(false);
        setFormData({
          manualCode: "",
          amount: "",
          currency: "USD",
          service: "",
          reference: "Studio"
        });
        setErrors({});
        setScanned(false);
      }, 300);
    } catch (error) {
      console.error("Erreur fermeture modal:", error);
      // Forcer la fermeture même en cas d'erreur
      setManualEntry(false);
      setErrors({});
    }
  }, [fadeOutModal]);

  // Gestion des changements d'input avec validation en temps réel
  const handleInputChange = useCallback((name, value) => {
    try {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Supprimer l'erreur du champ modifié
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Erreur changement input:", error);
    }
  }, [errors]);

  // Demande nouvelle permission caméra
  const handleRequestPermission = useCallback(async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      
      if (status !== "granted") {
        showErrorToast("Permission refusée", "L'accès à la caméra est nécessaire pour scanner les codes");
      }
    } catch (error) {
      console.error("Erreur demande permission:", error);
      showErrorToast("Erreur", "Impossible de demander les permissions");
    }
  }, [showErrorToast]);

  // Gestion de l'erreur réseau
  const handleNetworkError = useCallback((error) => {
    if (error.message?.toLowerCase().includes('network') || 
        error.code === 'NETWORK_ERROR' ||
        !navigator.onLine) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return null;
  }, []);

  // Gestion des erreurs serveur
  const handleServerError = useCallback((error, response) => {
    // Vérifier si c'est une erreur de code incorrect
    if (response?.status === 404 || 
        error.message?.toLowerCase().includes('not found') ||
        error.message?.toLowerCase().includes('code') ||
        response?.data?.message?.toLowerCase().includes('code')) {
      return ERROR_MESSAGES.CODE_NOT_FOUND;
    }
    
    // Erreurs serveur (5xx)
    if (response?.status >= 500) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    
    // Erreurs de validation (4xx)
    if (response?.status >= 400 && response?.status < 500) {
      return response?.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    }
    
    return null;
  }, []);

  // Validation et soumission du formulaire avec gestion d'erreur complète
  const handleValidateForm = useCallback(async () => {
    if (isLoading) return;

    try {
      // Validation côté client
      if (!validateForm()) {
        showErrorToast("Erreur de validation", ERROR_MESSAGES.REQUIRED_FIELDS);
        return;
      }

      setIsLoading(true);
      const { manualCode, amount, service, reference } = formData;

      // Vérification de l'ID utilisateur
      if (!id) {
        throw new Error("ID utilisateur manquant");
      }

      // Appel au service avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      const servicePromise = LoyaltyService.postEarnPoint(
        manualCode.trim(), 
        parseFloat(amount), 
        service.trim(),
        reference.trim(), 
        id
      );

      const response = await Promise.race([servicePromise, timeoutPromise]);

      if (response && response.success !== false) {
        showSuccessToast(
          SUCCESS_MESSAGES.POINTS_ADDED,
          `${amount} points ajoutés pour ${service}`
        );
        
        handleCloseModal();
      } else {
         handleCloseModal();
        // Réponse avec succès = false
        const errorMessage = response?.message || response?.error || ERROR_MESSAGES.CODE_NOT_FOUND;
        showErrorToast("Échec de l'opération", errorMessage);
      }

    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      
      let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
      
      // Gestion spécifique des erreurs
      const networkError = handleNetworkError(error);
      if (networkError) {
        errorMessage = networkError;
      } else {
        const serverError = handleServerError(error, error.response);
        if (serverError) {
          errorMessage = serverError;
        } else if (error.message === 'Request timeout') {
          errorMessage = "Délai d'attente dépassé. Vérifiez votre connexion";
        } else if (error.message?.includes('ID utilisateur')) {
          errorMessage = "Erreur d'authentification. Reconnectez-vous";
        }
      }
      
      showErrorToast("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading, 
    validateForm, 
    formData, 
    id, 
    showErrorToast, 
    showSuccessToast, 
    handleCloseModal,
    handleNetworkError,
    handleServerError
  ]);

  // Rendu des états de chargement et d'erreur
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{ERROR_MESSAGES.CAMERA_PERMISSION_REQUEST}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="no-photography" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{ERROR_MESSAGES.CAMERA_PERMISSION_DENIED}</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={handleRequestPermission}
        >
          <Text style={styles.permissionButtonText}>Demander à nouveau</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scanner Section */}
      {!cameraOpen && !manualEntry && (
        <View style={styles.scannerClosedContainer}>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => setCameraOpen(true)}
          >
            <MaterialIcons name="qr-code-scanner" size={32} color="#000" />
            <Text style={styles.scanButtonText}>Scanner un code</Text>
          </TouchableOpacity>
        </View>
      )}

      {cameraOpen && (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["code128"] }}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Scannez le code-barres</Text>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setCameraOpen(false)}
          >
            <MaterialIcons name="close" size={28} color={COLORS.light} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.manualEntryButton}
            onPress={handleOpenManualEntry}
          >
            <Text style={styles.manualEntryText}>Saisie manuelle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Entry Modal */}
      <Modal
        transparent={true}
        visible={manualEntry}
        onRequestClose={handleCloseModal}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <Animated.View style={[styles.modalBackdrop, { opacity: animationValue }]}>
            <KeyboardAvoidingView 
              behavior="padding"
              style={styles.modalContainer}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ajouter des points</Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <MaterialIcons name="close" size={24} color={COLORS.lightText} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Code admin</Text>
                  <TextInput
                    style={styles.input}
                    value={id}
                    editable={false}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Code de fidélité *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.manualCode && styles.inputError
                    ]}
                    value={formData.manualCode}
                    onChangeText={(text) => handleInputChange('manualCode', text)}
                    placeholder="Entrez le code"
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                  {errors.manualCode && (
                    <Text style={styles.errorText}>{errors.manualCode}</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Montant *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.amount && styles.inputError
                    ]}
                    value={formData.amount}
                    onChangeText={(text) => handleInputChange('amount', text)}
                    placeholder="Entrez le montant"
                    keyboardType="numeric"
                  />
                  {errors.amount && (
                    <Text style={styles.errorText}>{errors.amount}</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Devise *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.currency}
                    onChangeText={(text) => handleInputChange('currency', text)}
                    placeholder="devise"
                    editable={false}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.service && styles.inputError
                    ]}
                    value={formData.service}
                    onChangeText={(text) => handleInputChange('service', text)}
                    placeholder="Nom du service"
                  />
                  {errors.service && (
                    <Text style={styles.errorText}>{errors.service}</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Référence *</Text>
                  <TouchableOpacity 
                    style={[
                      styles.input,
                      errors.reference && styles.inputError
                    ]} 
                    onPress={() => setIsReferenceModalVisible(true)}
                  >
                    <Text style={styles.inputText}>{formData.reference}</Text>
                    <MaterialIcons 
                      name={isReferenceModalVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color={COLORS.lightText} 
                      style={styles.currencyArrow}
                    />
                  </TouchableOpacity>
                  
                  {errors.reference && (
                    <Text style={styles.errorText}>{errors.reference}</Text>
                  )}
                  
                  {isReferenceModalVisible && (
                    <View style={styles.currencyDropdown}>
                      <FlatList
                        data={['Studio', 'Event']}
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.currencyOption}
                            onPress={() => {
                              handleInputChange('reference', item);
                              setIsReferenceModalVisible(false);
                            }}
                          >
                            <Text style={[
                              styles.currencyOptionText,
                              item === formData.reference && styles.currencyOptionSelected
                            ]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item}
                      />
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled
                  ]}
                  onPress={handleValidateForm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.light} />
                  ) : (
                    <Text style={styles.submitButtonText}>Valider</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: COLORS.light,
    fontWeight: '600',
  },
  scannerClosedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'red',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: COLORS.light,
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualEntryButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  manualEntryText: {
    color: COLORS.light,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
  },
  formGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  currencyArrow: {
    marginLeft: 8,
  },
  currencyDropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 10,
    maxHeight: 120,
  },
  currencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  currencyOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  currencyOptionSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightText,
  },
  submitButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
});