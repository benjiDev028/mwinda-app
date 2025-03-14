import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Alert,
  FlatList,
} from "react-native";
import { styles } from './Styles';
import LoyaltyService from "../../../Services/LoyaltyServices/LoyaltyService";
import { CameraView, Camera } from "expo-camera";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../../context/AuthContext";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { id } = useContext(AuthContext);

  const [manualCode, setManualCode] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [service, setService] = useState("");
  const [reference,setReference]=useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const fadeOutModal = () => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    setManualCode(data);

    if (!toastVisible) {
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Barcode scanned!",
        text2: `Code scanné: ${data}`,
      });
      setToastVisible(true);
    }

    setCameraOpen(false);
    setManualEntry(true);
    fadeInModal();

    setTimeout(() => {
      setScanned(false);
      setToastVisible(false);
    }, 3000);
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
      setCameraOpen(true);
    }, 400);
  };

  const handleValidateForm = async () => {
    if (!manualCode || !amount || !currency || !service || !reference) {
      Alert.alert("Erreur de validation", "Veuillez remplir tous les champs.");
      return;
    }

    const response = await LoyaltyService.postEarnPoint(manualCode, amount, service,reference, id);
    if (response) {
      //Alert.alert("success", "Une erreur s'est produite lors de l'ajout des points.");
     // Alert.alert("Succès", "Points ajoutés avec succès!");

      Toast.show({
        type: "success",
        position: "top",
        text1: "Points ajoutés!",
        text2: `Vous avez ajouté ${amount} ${currency} pour ${service} et le code ${manualCode}.`,
      });
    } else {

      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout des points.");

    }

    setManualCode("");
    setAmount("");
    setCurrency("USD");
    setService("");
    setReference("")

    setManualEntry(false);
    setCameraOpen(true);
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.text}>No access to the camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!cameraOpen && !manualEntry && (
        <TouchableOpacity style={styles.openCameraButton} onPress={() => setCameraOpen(true)}>
          <Text style={styles.openCameraButtonText}>Ouvrir la caméra</Text>
        </TouchableOpacity>
      )}

      {cameraOpen && (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["code128"],
            }}
            style={styles.camera}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setCameraOpen(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualEntryButton} onPress={handleOpenManualEntry}>
            <Text style={styles.manualEntryText}>Entrer le code manuellement</Text>
          </TouchableOpacity>
        </View>
      )}

      {manualEntry && (
        <Modal animationType="fade" transparent={true} visible={manualEntry} onRequestClose={handleCloseModal}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Animated.View style={[styles.modalContainer, { opacity: animationValue }]}>
              <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
                <View style={styles.form}>
                  <Text style={styles.label}>ID (pré-rempli):</Text>
                  <TextInput style={styles.input} value={id} editable={false} />

                  <Text style={styles.label}>Code manuel:</Text>
                  <TextInput
                    style={styles.input}
                    value={manualCode}
                    onChangeText={setManualCode}
                    placeholder="Entrez le code manuel"
                  />

                  <Text style={styles.label}>Montant:</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="Entrez le montant"
                  />

                  <Text style={styles.label}>Devise:</Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    <TextInput style={styles.input} value={currency} editable={false} placeholder="Sélectionner la devise" />
                  </TouchableOpacity>

                  {isModalVisible && (
                    <FlatList
                      data={['USD', 'CDF']}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => { setCurrency(item); setIsModalVisible(false); }}>
                          <Text style={styles.listItem}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item}
                      style={styles.dropdown}
                    />
                  )}

                  <Text style={styles.label}>Service:</Text>
                  <TextInput
                    style={styles.input}
                    value={service}
                    onChangeText={setService}
                    placeholder="Entrez le nom du service"
                  />
                  <Text style={styles.label}>reference:</Text>
                  <TextInput
                    style={styles.input}
                    value={reference}
                    onChangeText={setReference}
                    placeholder="Entrez la reference"
                  />

                  <TouchableOpacity style={styles.validateButton} onPress={handleValidateForm}>
                    <Text style={styles.validateButtonText}>Valider</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeModalButton} onPress={handleCloseModal}>
                    <Text style={styles.closeModalText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <Toast />
    </View>
  );
}
