const url = "http://192.168.2.13:8003";





async function getStatUserById(user_id) {  
    try {
        const response = await fetch(`${url}/stat/get_user_shift_stats/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        });
        
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Statistiques utilisateur récupérées:', data);
        return data;
    } catch (error) {
        console.error('Erreur de récupération des statistiques utilisateur', error);
        throw error;
    }
    
    
}   


export default { getStatUserById };