import React, { useContext, useEffect } from 'react';
import { AuthContext } from "../context/AuthContext";
import AdminStack from "./admin/AdminTabs";
import ClientTabs from "./client/ClientTabs";
import LoginScreen from "../Screens/LoginScreen/LoginScreen";
import { useNavigation } from '@react-navigation/native';
import SignIn from '../Screens/SigninScreen/SigninScreen';
import { createStackNavigator } from "@react-navigation/stack";
import CheckEmailScreen from '../Screens/PasswordReset/checkEmailScreen/CheckEmailScreen';
import VerificationScreen from '../Screens/PasswordReset/VerificationScreen/VerificationScreen';
import NewPasswordScreen from '../Screens/PasswordReset/NewPasswordScreen/NewPasswordScreen';
import UserDetailsScreen from '../Screens/admin/AdminCrudUsersDetails/UserDetailsScreen/UserDetailsScreen';
import EditUserScreen from '../Screens/admin/AdminCrudUsersDetails/EditUserScreen/EditUserScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
    const { userRole, authToken } = useContext(AuthContext);
    const navigation = useNavigation();

    // Redirection basée sur l'état d'authentification
    useEffect(() => {
        if (navigation.isReady()) {
            if (!authToken) {
                navigation.navigate('Login');
            } else if (userRole === 'admin' || userRole === 'superadmin') {
                navigation.navigate('AdminRoot');
            } else if (userRole === 'client') {
                navigation.navigate('Client');
            }
        }
    }, [authToken, userRole, navigation]);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Écrans accessibles uniquement aux non-connectés */}
            {!authToken ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="signin" component={SignIn} />
                    <Stack.Screen name="check-email" component={CheckEmailScreen} />
                    <Stack.Screen name="verification" component={VerificationScreen} />
                    <Stack.Screen name="newpassword-screen" component={NewPasswordScreen} />
                </>
            ) : (
                <>
                    {/* Écrans protégés par authentification */}
                    {(userRole === 'admin' || userRole === 'superadmin') && (
                        <Stack.Screen name="AdminRoot" component={AdminStack} />
                    )}
                    
                    {userRole === 'client' && (
                        <Stack.Screen name="Client" component={ClientTabs} />
                    )}

                    {/* Écrans communs aux utilisateurs connectés */}
                    <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
                    <Stack.Screen name="EditUser" component={EditUserScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}