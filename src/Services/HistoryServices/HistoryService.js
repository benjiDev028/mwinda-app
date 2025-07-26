import UserService from "../UserServices/UserService";
import { API_URL, PORT_HISTORY } from '@env';

const url = `${API_URL}${PORT_HISTORY}`;

const isValidUUID = (uuid) => {
  if (!uuid || uuid === 'undefined' || uuid === 'null' || typeof uuid !== 'string') {
    return false;
  }
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

async function getHistoryWithNames() {
    try {
        console.log('Récupération de l\'historique...');
        
        // Récupération de l'historique
        const response = await fetch(`${url}/history/all_histories`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const history = await response.json();
        console.log('Historique brut récupéré:', history?.length, 'éléments');
        
        if (!Array.isArray(history)) {
            throw new Error('Format de données invalide');
        }

        // Debug: vérifier les données brutes
        if (history.length > 0) {
            console.log('Exemple d\'entrée:', {
                user_id: history[0]?.user_id,
                id_admin: history[0]?.id_admin,
                user_id_type: typeof history[0]?.user_id,
                id_admin_type: typeof history[0]?.id_admin
            });
        }

        // Extraction des IDs valides avec logs détaillés
        const userIds = [...new Set(
            history
                .map(item => item?.user_id)
                .filter(id => {
                    const isValid = isValidUUID(id);
                    if (!isValid && id) {
                        console.log('UUID utilisateur invalide:', id, typeof id);
                    }
                    return isValid;
                })
        )];
        
        const adminIds = [...new Set(
            history
                .map(item => item?.id_admin)
                .filter(id => {
                    const isValid = isValidUUID(id);
                    if (!isValid && id) {
                        console.log('UUID admin invalide:', id, typeof id);
                    }
                    return isValid;
                })
        )];

        console.log('IDs utilisateurs valides:', userIds.length);
        console.log('IDs admins valides:', adminIds.length);

        // Récupération des noms avec gestion d'erreur améliorée
        const getUserName = async (id) => {
            if (!isValidUUID(id)) {
                console.log('getUserName: ID invalide fourni:', id);
                return null;
            }
            
            try {
                console.log('Récupération utilisateur:', id);
                const user = await UserService.GetUserById(id);
                
                if (user && user.first_name && user.last_name) {
                    return { id, name: `${user.first_name} ${user.last_name}` };
                } else {
                    console.log('Utilisateur trouvé mais données incomplètes:', user);
                    return { id, name: 'Nom incomplet' };
                }
            } catch (error) {
                console.error(`Erreur récupération utilisateur ${id}:`, error.message || error);
                return null;
            }
        };

        // Récupération parallèle avec gestion d'erreur
        let userNames = [];
        let adminNames = [];
        
        try {
            [userNames, adminNames] = await Promise.all([
                Promise.all(userIds.map(getUserName)),
                Promise.all(adminIds.map(getUserName))
            ]);
        } catch (error) {
            console.error('Erreur lors de la récupération des noms:', error);
            // Continuer avec des tableaux vides
        }

        // Création des mappings avec validation
        const userMap = Object.fromEntries(
            userNames.filter(user => user && user.id && user.name).map(user => [user.id, user.name])
        );
        const adminMap = Object.fromEntries(
            adminNames.filter(admin => admin && admin.id && admin.name).map(admin => [admin.id, admin.name])
        );

        console.log('Mappings créés - Utilisateurs:', Object.keys(userMap).length, 'Admins:', Object.keys(adminMap).length);

        // Fusion des données avec gestion détaillée des cas d'erreur
        const enrichedHistory = history.map(item => {
            let user_name = "Utilisateur inconnu";
            let admin_name = "Admin inconnu";
            
            // Gestion du nom utilisateur
            if (isValidUUID(item.user_id)) {
                user_name = userMap[item.user_id] || "Utilisateur introuvable";
            } else if (item.user_id) {
                user_name = "ID utilisateur invalide";
                console.log('ID utilisateur invalide dans l\'item:', item.user_id);
            }
            
            // Gestion du nom admin
            if (isValidUUID(item.id_admin)) {
                admin_name = adminMap[item.id_admin] || "Admin introuvable";
            } else if (item.id_admin) {
                admin_name = "ID admin invalide";
                console.log('ID admin invalide dans l\'item:', item.id_admin);
            }

            return {
                ...item,
                user_name,
                admin_name,
                date_points: item.date_points || new Date().toISOString()
            };
        });

        console.log('Historique enrichi terminé:', enrichedHistory.length, 'éléments');
        return enrichedHistory;

    } catch (error) {
        console.error("Erreur dans getHistoryWithNames:", error.message || error);
        throw error;
    }
}

async function getHistoryUserById(id) {
    try {
        console.log('getHistoryUserById appelé avec:', id, typeof id);
        
        if (!isValidUUID(id)) {
            console.error('ID utilisateur invalide fourni:', id);
            throw new Error("Invalid user ID format");
        }

        const response = await fetch(`${url}/history/user/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const history = await response.json();
        
        if (!Array.isArray(history)) {
            throw new Error("Invalid history data format");
        }

        // Extract unique values with null checks
        const extractUnique = (key) => [...new Set(
            history
                .map(item => item?.[key])
                .filter(val => val !== undefined && val !== null)
        )];

        return {
            history,
            points: extractUnique("points"),
            services: extractUnique("service"),
            references: extractUnique("reference"),
            amounts: extractUnique("amount"),
            scanDates: extractUnique("date_points"),
            scanIds: extractUnique("id"),
        };

    } catch (error) {
        console.error(`Error in getHistoryUserById(${id}):`, error.message);
        throw error;
    }
}

async function getHistoryAdminById(id) {
    try {
        console.log('getHistoryAdminById appelé avec:', id, typeof id);
        
        if (!isValidUUID(id)) {
            console.error('ID admin invalide fourni:', id);
            throw new Error("Invalid admin ID format");
        }

        const response = await fetch(`${url}/history/admin/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const history = await response.json();
        
        if (!Array.isArray(history)) {
            throw new Error("Invalid history data format");
        }

        // Fetch client names with error handling
        const historyWithNames = await Promise.all(
            history.map(async (entry) => {
                try {
                    if (!isValidUUID(entry?.user_id)) {
                        console.log('ID client invalide:', entry?.user_id);
                        return {
                            ...entry,
                            clientName: 'ID client invalide'
                        };
                    }
                    
                    const user = await UserService.GetUserById(entry.user_id);
                    return {
                        ...entry,
                        clientName: user ? `${user.first_name} ${user.last_name}` : 'Client introuvable'
                    };
                } catch (error) {
                    console.error(`Error fetching user ${entry?.user_id}:`, error.message);
                    return {
                        ...entry,
                        clientName: 'Erreur de récupération'
                    };
                }
            })
        );

        return historyWithNames;

    } catch (error) {
        console.error(`Error in getHistoryAdminById(${id}):`, error.message);
        throw error;
    }
}

// In your HistoryService.js
async function deleteHistoryItem(loyaltyId) {
    try {
        const response = await fetch(`${url}/history/${loyaltyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete history item");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting history item:", error);
        throw error;
    }
}


export default { 
    getHistoryWithNames,
    getHistoryUserById, 
    getHistoryAdminById,
    deleteHistoryItem
};