import React, { useState, useEffect, useContext } from "react";
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
  StyleSheet
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

export default function LoyaltyScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const { id } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    manualCode: "",
    amount: "",
    currency: "USD",
    service: "",
    reference: "Studio"
  });
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isReferenceModalVisible, setIsReferenceModalVisible] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const fadeInModal = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const fadeOutModal = () => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    setFormData(prev => ({ ...prev, manualCode: data }));
    
    Toast.show({
      type: "success",
      position: "top",
      text1: "Code scanné avec succès",
      text2: `Code: ${data}`,
      visibilityTime: 2000
    });

    setCameraOpen(false);
    setManualEntry(true);
    fadeInModal();
  };

  const handleOpenManualEntry = () => {
    setCameraOpen(false);
    setManualEntry(true);
    fadeInModal();
  };

  const handleCloseModal = () => {
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
    }, 300);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleValidateForm = async () => {
    const { manualCode, amount, service, reference } = formData;
    
    if (!manualCode || !amount || !service || !reference) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erreur",
        text2: "Veuillez remplir tous les champs",
      });
      return;
    }

    try {
      const response = await LoyaltyService.postEarnPoint(
        manualCode, 
        amount, 
        service,
        reference, 
        id
      );

      if (response) {

        
        Toast.show({
          type: "success",
          position: "top",
          text1: "Points ajoutés!",
          text2: `${amount} points ajoutés pour ${service}`,
        });
        
        handleCloseModal();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erreur",
        text2: "Échec de l'ajout des points",
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Demande d'autorisation de la caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="no-photography" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Accès à la caméra refusé</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
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
                    style={styles.input}
                    value={formData.manualCode}
                    onChangeText={(text) => handleInputChange('manualCode', text)}
                    placeholder="Entrez le code"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Montant *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.amount}
                    onChangeText={(text) => handleInputChange('amount', text)}
                    placeholder="Entrez le montant"
                    keyboardType="numeric"
                  />
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
                    style={styles.input}
                    value={formData.service}
                    onChangeText={(text) => handleInputChange('service', text)}
                    placeholder="Nom du service"
                  />
                </View>

              
                 <View style={styles.formGroup}>
                  <Text style={styles.label}>reference *</Text>
                  <TouchableOpacity 
                    style={styles.input} 
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
                  style={styles.submitButton}
                  onPress={handleValidateForm}
                >
                  <Text style={styles.submitButtonText}>Valider</Text>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 24,
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

  borderWidth: 2, // obligatoire si tu veux voir la bordure
  borderColor: 'red', // jaune doux (ou utilise COLORS.primary si t’as un fichier de couleurs)

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
  submitButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
});