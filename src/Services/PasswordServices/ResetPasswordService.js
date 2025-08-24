import { API_URL } from '@env'


//const url = "http://192.168.2.13:8002";
const url = API_URL



async function CheckEmail(mail) {
    try {
        const response = await fetch(url + "/identity/reset-password-step1", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ email: mail }),
        });

        const responseText = await response.text(); // Pour afficher le corps brut
        console.log("Statut HTTP:", response.status);
        console.log("Corps de la réponse:", responseText);

        const data = JSON.parse(responseText); // Analyse sécurisée du JSON

        if (data.message === "Code envoyé avec succès.") {
            return true;  // Succès basé sur le message
        } else {
            return false; // Erreur basée sur le message
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        return false;
    }
}

async function CheckCode (email,code){
    try {
        const response = await fetch(url + "/identity/reset-password-step2", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ email: email, code: code }),
        });

        const responseText = await response.text(); // Pour afficher le corps brut
        console.log("Statut HTTP:", response.status);
        console.log("Corps de la réponse:", responseText);

        const data = JSON.parse(responseText); // Analyse sécurisée du JSON

        if (data.message === "Code validé avec succès.") {
            console.log("reussi")
            return true;  // Succès basé sur le message
        } else {
            console.log("echoue")
            return false; // Erreur basée sur le message
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du code:", error);
        return false;
    }
}

async function NewPassword(email, new_password) {
    try {
        const response = await fetch(url + "/identity/reset-password-step3", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ email: email, new_password: new_password }),
        });
        if (response) {
            const data = await response.json();
            console.log("User created successfully:", data);
            return { success: true, data };
        } else {
            const errorData = await response.json();
            console.error("Error creating user:", errorData.detail);
            throw new Error(errorData.detail || 'Erreur lors de l\'inscription');
        }
    }catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return false;}
}

async function ResendEmail(email) {
    try {

        const response = await fetch(url + "/identity/resend_activation", {
            method: "PUT",  
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ email: email }),
        });
        if (response) {
            const data = await response.json();
            console.log("Email resent successfully:", data);
            return { success: true, data };
        } else {
            const errorData = await response.json();
            console.error("Error resending email:", errorData.detail);
            throw new Error(errorData.detail || 'Erreur lors du renvoi de l\'email');
        }
    }catch (error) {
        console.error("Erreur lors du renvoi de l'email:", error
        );
        return false;}
}



export default {CheckEmail,CheckCode,NewPassword,ResendEmail}