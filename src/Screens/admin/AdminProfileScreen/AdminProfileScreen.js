import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Platform, 
  Keyboard, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Alert 
} from 'react-native';
import splash from '../../../../assets/splash.png';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './Styles';
import { AuthContext } from '../../../context/AuthContext';
import AuthService from '../../../Services/UserServices/AuthService';
import UserService from '../../../Services/UserServices/UserService';

const INPUT_FIELDS = [
  { label: 'Firstname', key: 'firstname', placeholder: 'Firstname', secure: false },
  { label: 'Lastname', key: 'lastname', placeholder: 'Lastname', secure: false },
  { label: 'Email', key: 'email', placeholder: 'johndoe@gmail.com', secure: false },
  { label: 'Date of Birth', key: 'date_birth', placeholder: 'Date of Birth', secure: false },
  { label: 'Password', key: 'password', placeholder: 'Password', secure: true }
];

export default function ClientProfileScreen() {
  const { authToken, id, logout } = useContext(AuthContext);
  
  // User form data state in single object
  const [userData, setUserData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    date_birth: '',
    password: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Update individual form fields
  const updateField = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle editing state and handle changes
  const toggleEditing = () => {
    if (isEditing) {
      handleChange();
    }
    setIsEditing(!isEditing);
  };

  // Handle form submission
  const handleChange = useCallback(async () => {
    const { firstname, lastname, email, date_birth } = userData;
    
    if (!firstname || !lastname || !email || !date_birth) {
      Alert.alert("Validation Error", "Please fill in all the fields.");
      return;
    }
  
    const data = {
      first_name: firstname,
      last_name: lastname,
      email,
      date_birth,
    };
  
    try {
      const updateUser = await UserService.updateUser(id, data, authToken);
  
      if (updateUser) {
        Alert.alert("Success", "Your profile has been updated successfully!");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert("Error", "Failed to save changes.");
    }
  }, [userData, id, authToken]);
  
  // Get user data from API
  const getUserData = useCallback(async () => {
    try {
      const response = await fetch(`http://192.168.2.13:8001/identity/get_user_by_id/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          firstname: data.first_name,
          lastname: data.last_name,
          email: data.email,
          date_birth: data.date_birth,
          password: ''
        });
      } else {
        console.log('Error retrieving user data');
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }, [id, authToken]);

  // Load user data on component mount
  useEffect(() => {
    if (authToken) {
      try {
        getUserData();
      } catch (error) {
        console.log('Error decoding token:', error);
      }
    }
  }, [authToken, getUserData]);

  // Render input field component
  const renderInputField = ({ label, key, placeholder, secure }) => (
    <React.Fragment key={key}>
      <Text style={styles.text}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={userData[key]}
        onChangeText={(value) => updateField(key, value)}
        editable={isEditing}
        secureTextEntry={secure}
      />
    </React.Fragment>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.container1}>
            <View style={styles.containerImage}>
              <Image source={splash} style={styles.image} />
              <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <MaterialCommunityIcons
                  name={'power'}
                  size={44}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.icon}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {/* Photo upload logic */}}
              >
                <Image
                  source={{
                    uri: 'https://www.pngall.com/wp-content/uploads/5/Profile-Avatar-PNG-Free-Image.png',
                  }}
                  style={styles.profileImage}
                />
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color="#fff"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.container2}>
            <View style={styles.form}>
              {INPUT_FIELDS.map(renderInputField)}
              
              <TouchableOpacity onPress={toggleEditing} style={styles.editButton}>
                <MaterialCommunityIcons
                  name={isEditing ? "check" : "pencil"}
                  size={24}
                  color="#000"
                />
                <Text style={styles.editButtonText}>
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback> 
    </KeyboardAvoidingView>
  );
}