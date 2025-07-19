import { StyleSheet, Dimensions } from "react-native";

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8fafc', // Subtle blue-gray background
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  
  container1: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 280,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    width: '100%',
    // Modern gradient-like effect with subtle colors
    backgroundColor: '#fec109',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  
  containerImage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  
  image: {
    width: width * 0.4,
    height: width * 0.2,
    resizeMode: 'contain',
    tintColor: '#1e293b', // Add a subtle dark tint for better contrast
  },
  
  icon: {
    height: 130,
    marginTop: -65,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  
  uploadButton: {
    position: 'relative',
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  editIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#2563eb', // Blue accent color
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  
  container2: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 40,
  },
  
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  text: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2,
  },
  
  required: {
    color: '#dc2626', // Red color for required asterisk
    fontWeight: '700',
  },
  
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#1f2937',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  inputError: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  
  inputDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    color: '#6b7280',
  },
  
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: -14,
    marginBottom: 10,
    marginLeft: 2,
    fontWeight: '500',
  },
  
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  
  editButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  primaryButton: {
    backgroundColor: '#2563eb', // Blue primary color instead of yellow
  },
  
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 12,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default styles;