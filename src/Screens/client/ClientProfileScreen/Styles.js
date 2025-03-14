import { StyleSheet, Dimensions } from "react-native";

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9f9f9', // Subtle off-white background for better contrast
  },
  container1: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 280, // Reduced height for better proportions
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    width: '100%',
    backgroundColor: '#fec107',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6, // Add shadow for Android
  },
  containerImage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  image: {
    width: width * 0.4, // Responsive width
    height: width * 0.2, // Responsive height
    resizeMode: 'contain', // Ensure the image fits properly
  },
  icon: {
    height: 130,
    marginTop: -65, // Position the profile picture to overlap with the yellow container
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure the profile image appears on top
  },
  uploadButton: {
    position: 'relative',
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff', // White border for contrast
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fec107', // Match with the header color
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  container2: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 50,
    paddingTop: 30,
  },
  form: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
    color: '#555',
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    fontSize: 15,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#fec107',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 8,
    zIndex: 1,
  },
});

export default styles;