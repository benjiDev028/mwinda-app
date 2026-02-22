

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
};

// Fonction pour valider la date de naissance
export const validateBirthDate = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    // Calcul de l'âge
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();

    // Si le mois de naissance est après ce mois ou si l'anniversaire n'est pas encore passé cette année
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
        return age - 1 >= 15; // L'âge doit être au moins 15 ans
    }
    return age >= 15;
};

