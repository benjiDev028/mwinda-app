
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#1c1c1c",
  },
  openCameraButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  openCameraButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "90%",
    height: "50%",
    borderRadius: 15,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#FF5722",
    padding: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  manualEntryButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 25,
  },
  manualEntryText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
  },
  form: {
    backgroundColor: "#333",
    padding: 25,
    borderRadius: 12,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    color: "#FF9800",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FF9800",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    width: "100%",
    backgroundColor: "#333",
    color: "#fff",
  },
  validateButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  validateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeModalButton: {
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  closeModalText: {
    color: "white",
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  listItem: {
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
});