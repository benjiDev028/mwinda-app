import Constants from 'expo-constants';
import { decode as atob, encode as btoa } from 'base-64';

// ✅ Utilisation de la configuration Expo au lieu de @env
const url = Constants.expoConfig?.extra?.apiUrl || 'https://mwinda.core-techs.ca';
console.log('🌐 API URL configurée:', url);

async function Login(email, password) {
  console.log('🔍 Tentative de connexion à:', `${url}/identity/login`);
  console.log('📧 Email:', email);
 
  try {
    const response = await fetch(`${url}/identity/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
   
    console.log('📡 Status de la réponse:', response.status);
    console.log('📡 Headers de la réponse:', JSON.stringify([...response.headers]));
   
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
   
    const data = await response.json();
    console.log('✅ Données reçues:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Erreur complète de connexion:', error);
    console.error('❌ Type d\'erreur:', typeof error);
    console.error('❌ Message d\'erreur:', error.message);
    throw error;
  }
}

// ✅ Fonction améliorée pour décoder un JWT avec gestion d'erreurs
function decodeJWT(token) {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token invalide ou manquant');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Format JWT invalide');
    }

    // Décoder la partie payload (index 1)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // ✅ Correction: utiliser atob directement sur base64
    const jsonPayload = atob(base64);
    
    const decoded = JSON.parse(jsonPayload);
    console.log('🔐 JWT décodé:', decoded);
    
    // ✅ Normaliser le format user_id si nécessaire
    if (decoded['user/id'] && !decoded.user_id) {
      decoded.user_id = decoded['user/id'];
    }
    
    return decoded;
  } catch (error) {
    console.error('❌ Erreur de décodage JWT:', error);
    throw new Error(`Impossible de décoder le JWT: ${error.message}`);
  }
}

export default { Login, decodeJWT };