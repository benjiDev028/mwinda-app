import UserService from "../UserServices/UserService";
import { API_URL,PORT_HISTORY } from '@env'

const url = `${API_URL}${PORT_HISTORY}`

// const url = "http://192.168.2.13:8004";



async function getHistoryWithNames() {
    try {
        // Étape 1 : Récupérer l'historique
        const response = await fetch(`${url}/history/all_histories`);
        if (!response.ok) {
            console.error("Erreur lors de la récupération de l'historique");
            return;
        }
        const history = await response.json();

        // Étape 2 : Extraire les identifiants uniques
        const userIds = [...new Set(history.map(item => item.user_id))];
        const adminIds = [...new Set(history.map(item => item.id_admin))];

        // Étape 3 : Récupérer les noms correspondants
        const userNames = await Promise.all(userIds.map(async (id) => {
            const user = await UserService.GetUserById(id);
            return user ? { id, name: user.first_name } : null;
        }));

        const adminNames = await Promise.all(adminIds.map(async (id) => {
            const admin = await UserService.GetUserById(id); // Supposons que la même fonction récupère les admins
            return admin ? { id, name: admin.first_name } : null;
        }));

        // Étape 4 : Créer un mapping des identifiants aux noms
        const userMap = Object.fromEntries(userNames.filter(Boolean).map(user => [user.id, user.name]));
        const adminMap = Object.fromEntries(adminNames.filter(Boolean).map(admin => [admin.id, admin.name]));

        // Étape 5 : Remplacer les identifiants par les noms
        const historyWithNames = history.map(item => ({
            ...item,
            user_name: userMap[item.user_id] || "Nom utilisateur inconnu",
            admin_name: adminMap[item.id_admin] || "Nom administrateur inconnu"
        }));

        console.log(historyWithNames);
        return historyWithNames;

    } catch (error) {
        console.error("Erreur lors du traitement de l'historique :", error);
    }
}

async function getHistoryUserById(id) {
    try {
        const response = await fetch(`${url}/history/user/${id}`);

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération de l'historique");
        }

        const history = await response.json();

        // Extraction des valeurs uniques
        const uniqueValues = (key) => [...new Set(history.map(item => item[key]))];

        return {
            history,
            points: uniqueValues("points"),
            services: uniqueValues("service"),
            references: uniqueValues("reference"),
            amounts: uniqueValues("amount"),
            scanDates: uniqueValues("date_points"),
            scanIds: uniqueValues("id"),
        };

    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique :", error.message);
        return null;
    }
}


async function getHistoryAdminById(id) {
    try {
      // Étape 1 : Récupérer l'historique
      const response = await fetch(`${url}/history/admin/${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }
      const history = await response.json();
  
      // Étape 2 : Récupérer les noms des utilisateurs pour chaque entrée d'historique
      const historyWithNames = await Promise.all(
        history.map(async (entry) => {
          const user = await UserService.GetUserById(entry.user_id); // Récupérer les infos du client
          return {
            ...entry,
            clientName: user ? `${user.first_name} ${user.last_name}` : 'Inconnu', // Ajouter le nom du client
          };
        })
      );
  
      return historyWithNames;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique :", error.message);
      return null;
    }
  }

export default { getHistoryWithNames ,getHistoryUserById,getHistoryAdminById};