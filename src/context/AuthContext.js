import { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from "../Services/UserServices/AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [barcodeBase64, setBarcodeBase64] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedBarcode = await AsyncStorage.getItem('barcodeBase64');
        const storedId = await AsyncStorage.getItem('id');
        const userEmail = await AsyncStorage.getItem('user_email');

        if (storedToken) {
          setAuthToken(storedToken);
          setUserRole(storedRole);
          setBarcodeBase64(storedBarcode);
          setId(storedId);
          setUserEmail(userEmail);
        }
      } catch (error) {
        console.error('Erreur de récupération session :', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await AuthService.Login(email, password);
      
      if (response && response.access_token) {
        const token = response.access_token;
        const decoded = AuthService.decodeJWT(token);
        
        // ✅ Extraction sécurisée des données avec vérifications
        const userRole = decoded.role || 'client'; // valeur par défaut
        const barcodeBase64 = response.barcode_base64 || '';
        const id = decoded.user_id || decoded['user/id'] || ''; // gérer les deux formats
        const user_email = decoded.sub || email;

        // ✅ Vérification avant stockage - ne stocker que des valeurs définies
        const dataToStore = {
          authToken: token,
          userRole: userRole,
          barcodeBase64: barcodeBase64,
          id: id,
          user_email: user_email
        };

        // Stocker seulement les valeurs non-vides
        for (const [key, value] of Object.entries(dataToStore)) {
          if (value !== undefined && value !== null && value !== '') {
            await AsyncStorage.setItem(key, value);
          } else {
            console.warn(`⚠️ Valeur vide pour ${key}:`, value);
          }
        }

        // Mettre à jour l'état
        setAuthToken(token);
        setUserRole(userRole);
        setBarcodeBase64(barcodeBase64);
        setId(id);
        setUserEmail(user_email);

        console.log('✅ Connexion réussie avec ID:', id);
        return { token, userRole };
      } else {
        throw new Error('Échec de la connexion: token manquant');
      }
    } catch (error) {
      console.error('❌ Erreur de login :', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setAuthToken(null);
      setUserRole(null);
      setBarcodeBase64(null);
      setId(null);
      setUserEmail(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        authToken,
        barcodeBase64,
        id,
        userEmail, // ✅ Ajout de userEmail dans le contexte
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};