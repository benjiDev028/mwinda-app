import { API_URL } from '@env'
// AdminService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

//const url = "http://192.168.2.13:8002";
const url = API_URL


const Register = async (firstname, lastname, email, password, date_birth) => {
  try {
      const response = await fetch(url + '/identity/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              "first_name": firstname,
              "last_name": lastname,
              "email": email,
              "password": password,
              "date_birth": date_birth
          }),
      });

      if (response.status !== 201) {
        const errorData = await response.json();
        const errorType = errorData.detail?.error;
        const errorMessage = errorType === "EMAIL_ALREADY_REGISTERED"
          ? "Email déjà utilisé"
          : errorData.message || "Erreur inconnue";
  
        console.error("❌ Erreur d'inscription:", errorMessage);
        return { success: false, error: errorMessage };
      }
  
      // ✅ Vérifier si la réponse contient du JSON (cas 201 Created)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn("⚠ Réponse sans JSON, mais succès confirmé.");
        data = {};
      }
  
      console.log("✅ Utilisateur créé avec succès:", data);
      return { success: true, data };
  
    } catch (error) {
      console.error("❌ Erreur inattendue:", error);
      return { success: false, error: "Une erreur inattendue s'est produite." };
    }
  };
  
const add_Admin = async (firstname, lastname, email, password, date_birth) => {
  try {
      const response = await fetch(url + '/identity/register_admin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              "first_name": firstname,
              "last_name": lastname,
              "email": email,
              "password": password,
              "date_birth": date_birth
          }),
      });

      if (response.status !== 201) {
        const errorData = await response.json();
        const errorType = errorData.detail?.error;
        const errorMessage = errorType === "EMAIL_ALREADY_REGISTERED"
          ? "Email déjà utilisé"
          : errorData.message || "Erreur inconnue";
  
        console.error("❌ Erreur d'inscription:", errorMessage);
        return { success: false, error: errorMessage };
      }
  
      // ✅ Vérifier si la réponse contient du JSON (cas 201 Created)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn("⚠ Réponse sans JSON, mais succès confirmé.");
        data = {};
      }
  
      console.log("✅ Utilisateur créé avec succès:", data);
      return { success: true, data };
  
    } catch (error) {
      console.error("❌ Erreur inattendue:", error);
      return { success: false, error: "Une erreur inattendue s'est produite." };
    }
  };


const RegisterAdmin = async (firstname, lastname, email, password, date_birth) => {
  try {
      const response = await fetch(url + '/identity/register_admin', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              "first_name": firstname,
              "last_name": lastname,
              "email": email,
              "password": password,
              "date_birth": date_birth
          }),
      });

if (!response.ok) {
  const errorData = await response.json();
  const detail = errorData.detail;

  let errorMessage = "Erreur inconnue côté serveur.";

  if (typeof detail === 'string') {
    // Ex: detail = "Internal Server Error"
    errorMessage = detail;
  } else if (detail?.error === "EMAIL_ALREADY_REGISTERED") {
    errorMessage = detail.message || "Cet email est déjà utilisé.";
  } else if (detail?.message) {
    errorMessage = detail.message;
  }

  console.error("❌ Erreur d'inscription:", errorMessage);
  return { success: false, error: errorMessage };
}

  
      // ✅ Vérifier si la réponse contient du JSON (cas 201 Created)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn("⚠ Réponse sans JSON, mais succès confirmé.");
        data = {};
      }
  
      console.log("✅ Utilisateur créé avec succès:", data);
      return { success: true, data };
  
    } catch (error) {
      console.error("❌ Erreur inattendue:", error);
      return { success: false, error: "Une erreur inattendue s'est produite." };
    }
  };
  

 const deleteUser = async (userId) => {
    try {

      const response = await fetch(`${url}/identity/delete_user_by_id/${userId}`, {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('User deleted successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('Error deleting user:', error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

//  const registerAdmin = async (adminData) => {
//     try {
//       // Récupérer le token depuis AsyncStorage
//       const token = await AsyncStorage.getItem('authToken');
      
//       if (!token) {
//         throw new Error('Aucun token d\'authentification trouvé');
//       }

//       // Vérifier que l'utilisateur est un superadmin
//       const userRole = await AsyncStorage.getItem('userRole');
//       if (userRole !== 'superadmin') {
//         throw new Error('Seuls les superadmins peuvent créer des comptes admin');
//       }

//       const response = await fetch(`${url}/identity/register_admin`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(adminData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Si la réponse n'est pas OK, on vérifie le type d'erreur
//         if (data.error === 'EMAIL_ALREADY_REGISTERED') {
//           throw new Error('Cet email est déjà utilisé');
//         } else if (response.status === 403) {
//           throw new Error('Permission refusée - Rôle insuffisant');
//         } else {
//           throw new Error(data.message || 'Erreur lors de la création de l\'admin');
//         }
//       }

//       return data;
//     } catch (error) {
//       console.error('Erreur dans AdminService.registerAdmin:', error);
//       throw error;
//     }
//   }
  // Fonction pour vérifier les permissions avant d'afficher l'interface
 const  checkSuperAdminPermissions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userRole = await AsyncStorage.getItem('userRole');

      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      if (userRole !== 'superadmin') {
        throw new Error('Permissions insuffisantes');
      }

      return true;
    } catch (error) {
      console.error('Erreur de vérification des permissions:', error);
      throw error;
    }
  }



const updateUser = async (userId, updatedData, authToken) => {
  try {
    const response = await fetch(`${url}/identity/update_user_by_id/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const data = await response.json();
      // Répondre avec un message ou les données mises à jour
      console.log("Success", "Profile updated successfully!")
      return data;
    } else {
      const error = await response.json();
      console.log("Error", error.message || "Failed to update profile.")
    }
  } catch (error) {
    console.log('Error updating user:', error);
  }
};

        
  
const GetUsers = async ()=>{
  try{
    const response = await fetch(`${url}/identity/get_all_users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        },
        });
        if (response.ok) {
          const data = await response.json();
        
         
          
          return data;
          } else {
            const error = await response.json();
            console.log('Error fetching users:', error);
            }
    } catch (error) {
              console.log('Error fetching users:', error);

  }
}

const GetStats = async ()=>{
  try{
    const response = await fetch(`${url}/identity/get_all_users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        },
        });
        if (response.ok) {
          const data = await response.json();
          const totalUsers = data.length;
          const usersInactives = data.filter(user => user.is_email_verified === false).length;
          const userGetBonusStudio = data.filter(user => user.pointstudios >= 5000).length;

          console.log('Users inactiv:', usersInactives);
          console.log('Total users:', totalUsers);
          console.log('Users get bonus studio:', userGetBonusStudio);
          
          
          return {data,totalUsers,usersInactives,userGetBonusStudio};
          } else {
            const error = await response.json();
            console.log('Error fetching users:', error);
            }
    } catch (error) {
              console.log('Error fetching users:', error);

  }
}


const GetUserById =  async (id) => {
  try {
    const response = await fetch(`${url}/identity/get_user_by_id/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(" donnees",data);
      return data;
    } else {
      const error = await response.json();
      console.log('Error fetching user:', error);
    }
  } catch (error) {
    console.log('Error fetching user:', error);
  }
}

const DeleteUserById = async(id) => {
  try{
    const response = await fetch (`${url}/identity/delete_user_by_id/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        },
        })
    
    if (response.ok) {
      console.log('User deleted successfully');
      return true;
      } else {
        const error = await response.json();
        console.log('Error deleting user:', error);
        return false;
      }
     } catch{
      console.log('Error deleting user:', error);
    }
  }


export default {Register,updateUser,GetUsers,GetStats,add_Admin,GetUserById,DeleteUserById,RegisterAdmin,deleteUser,checkSuperAdminPermissions};

