import { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from "../Services/UserServices/AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [barcodeBase64, setBarcodeBase64] = useState(null);
  const[accessToken,setAccessToken]=useState(null)
  const [id, setId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Récupérer les données depuis AsyncStorage
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedBarcode = await AsyncStorage.getItem('barcodeBase64');
        const accessToken = await AsyncStorage.getItem('access_token')
        const storedId = await AsyncStorage.getItem('id');

  
        // Si le token existe, restaurer la session
        if (storedToken) {
          setAuthToken(storedToken);
          setUserRole(storedRole);
          setBarcodeBase64(storedBarcode);
          setId(storedId);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token ou du rôle:', error);
      }
    };
  
    checkSession();
  }, []); // Exécuter au démarrage de l'application
  

  const login = async (email, password) => {
    const response = await AuthService.Login(email, password);
    
  
    if (response && response.access_token) {
      const token = response.access_token;
      const decodedToken = AuthService.decodeJWT(token);
      const userRole = decodedToken.role;
      const barcodeBase64 = response.barcode_base64;
      const id = decodedToken.user_id;
      const user_email = decodedToken.sub;
  
      // Stocker les données utilisateur dans AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userRole', userRole);
      await AsyncStorage.setItem('barcodeBase64', barcodeBase64);
      await AsyncStorage.setItem('id', id);
      await AsyncStorage.setItem('user_email', user_email);
  
      // Mettre à jour l'état global
      setAuthToken(token);
      setUserRole(userRole);
      setBarcodeBase64(barcodeBase64);
      setId(id);
      setUserEmail(user_email);

  
      return { token, userRole, barcodeBase64 };
    } else {
      throw new Error('Échec de la connexion');
    }
  };
  

  const logout = async () => {
    // Supprimer les données utilisateur
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('barcodeBase64');
    await AsyncStorage.removeItem('id');
    await AsyncStorage.removeItem('user_email');  
  
    // Réinitialiser l'état global
    setAuthToken(null);
    setUserRole(null);
    setBarcodeBase64(null);
    setId(null);
    setUserEmail(null);
  };
  

  return (
    <AuthContext.Provider
      value={{
        userRole,
        authToken,
        barcodeBase64,
        id,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
