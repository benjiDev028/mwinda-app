import { API_URL,PORT_LOYALTY } from '@env'


const url = `${API_URL}${PORT_LOYALTY}`





const postEarnPoint = async (code_barre,montant,service,reference,id_admin) => {
    try{
        const response =await fetch(`${url}/loyalty/earn_points`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code_barre: code_barre,
                montant: montant,
                service: service,
                reference: reference,
                id_admin: id_admin
            })
        });

        if(response.ok){
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            const errorData = await response.json(); // Essaye de lire l'erreur du serveur
            console.log("Erreur serveur :", errorData);
            throw new Error(`Erreur HTTP ${response.status}: ${errorData.message || "Problème inconnu"}`);
        }
        
    }catch(error){
        console.log(error);
    }
}
    
const getLoyaltyPoint = async (id) => {
    try{
        const response =await fetch(`${url}/loyalty/loyalty_points/${id}`,{
            method: 'Get',
            headers: {
                'Content-Type': 'application/json',
            },
            });
        if(response){
            const data = await response.json();
            console.log(data);
            return data;
        }
        else{
            console.log(response);
            return response.json();
           
        }
    }catch(error){
        console.log(error);
    }
}

const GotYourPoint = async (user_id, admin_id, reference) => {
    try {
        const response = await fetch(`${url}/loyalty/redeem_points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            
            },
            body: JSON.stringify({
                user_id,
                admin_id,  
                reference,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Détails de l'erreur : ", errorData);
    throw new Error('Erreur lors de la réclamation des points');
        }

        const data = await response.json();
        console.log(data);
        return data;

    } catch (error) {
        console.log("Erreur lors de la réclamation des points: ", error);
        throw error;
    }
};

export default {postEarnPoint,getLoyaltyPoint,GotYourPoint};