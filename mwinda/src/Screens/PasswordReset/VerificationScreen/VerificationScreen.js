import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Easing ,
  ActivityIndicator
} from "react-native";
import splash from '../../../../assets/splash.png';
import ResetPasswordService from "../../../Services/PasswordServices/ResetPasswordService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import styles from './Styles';
import { useTranslation } from 'react-i18next';


export default function VerificationScreen() {
    const [Code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const {t} = useTranslation();    
    // Animations
    const logoScale = useState(new Animated.Value(0.8))[0];
    const formOpacity = useState(new Animated.Value(0))[0];
    const formPosition = useState(new Animated.Value(50))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                speed: 0.5,
                useNativeDriver: true
            }),
            Animated.timing(formOpacity, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true
            }),
            Animated.timing(formPosition, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.back(1)),
                useNativeDriver: true
            })
        ]).start();
    }, []);


    const handleValidate = async () => {

        if (Code === '') {
            Alert.alert("Avertissement !", "Veuillez entrer le code de vérification.");
            return;
        }

        setIsLoading(true);

        const resetEmail = await AsyncStorage.getItem("reset");
        try {
            const response = await ResetPasswordService.CheckCode(resetEmail.toLowerCase(), Code);
            if (response) {
                Alert.alert("Succès", "Code vérifié avec succès.", [
                    { text: "OK", onPress: () => navigation.navigate('newpassword-screen') }
                ]);
            } else {
                Alert.alert("Erreur", "Code incorrect.");
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du code:", error);
            Alert.alert("Erreur", "Erreur lors de la vérification du code.");
        }
        finally{
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header animé */}
            <Animated.View style={[styles.header]}>
                <Image source={splash} style={styles.logo} />
            </Animated.View>

            {/* Formulaire animé */}
            <Animated.View style={[styles.formContainer, { 
                opacity: formOpacity,
                transform: [{ translateY: formPosition }]
            }]}>
                <Text style={styles.title}>{t('verification')}</Text>
                <Text style={styles.subtitle}>{t('enter the code')}</Text>

                <TextInput
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    onChangeText={setCode}
                    maxLength={5}
                    placeholder="•••••"
                    placeholderTextColor="#A0A0A0"
                    selectionColor="#fec107"
                    textAlign="center"
                />

                <TouchableOpacity 
                    style={styles.validateButton}
                    onPress={handleValidate}
                    activeOpacity={0.9}
                    disabled={isLoading}
                >
                    {isLoading ?( 
                     <ActivityIndicator size="small" color="#fff" /> 
                    ):( 
                    
                    <Text style={styles.buttonText}>{t('verify code btn')}</Text>)}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}