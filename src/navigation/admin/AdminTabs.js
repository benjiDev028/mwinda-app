import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importation des écrans
import AdminProfileScreen from "../../Screens/admin/AdminProfileScreen/AdminProfileScreen";
import AdminHistoryScreen from "../../Screens/admin/AdminHistoryScreen/AdminHistoryScreen";
import AdminScanBarcodeScreen from "../../Screens/admin/AdminScanCodeBarScreen/AdminScanBarcodeScreen";
import AdminViewClientsScreen from "../../Screens/admin/AdminViewClientScreen/AdminViewClientsScreen";
import AdminHomeScreen from '../../Screens/admin/AdminHomeScreen/AdminHomeScreen';
import UserDetailsScreen from '../../Screens/admin/AdminCrudUsersDetails/UserDetailsScreen/UserDetailsScreen';
import EditUserScreen from '../../Screens/admin/AdminCrudUsersDetails/EditUserScreen/EditUserScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ViewClientsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ViewClientsMain" component={AdminViewClientsScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
    </Stack.Navigator>
  );
};

export default function AdminTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Configuration du style selon la plateforme
  const getTabBarStyle = () => {
    const baseStyle = {
      backgroundColor: '#ffffff', // Fond blanc principal
      borderTopWidth: 1,
      borderTopColor: '#fec107', // Bordure jaune en haut
      elevation: Platform.OS === 'android' ? 8 : 0,
      shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
      shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
      shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    };

    // Ajustements spécifiques par plateforme
    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // Respect du safe area
        height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
      };
    } else if (Platform.OS === 'android') {
      return {
        ...baseStyle,
        paddingBottom: 8,
        height: 60,
      };
    }
    
    return baseStyle;
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#fec107', // Jaune pour l'icône active
        tabBarInactiveTintColor: '#666666', // Gris pour les icônes inactives
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: getTabBarStyle(),
        tabBarHideOnKeyboard: Platform.OS === 'android', // Cache la tab bar quand le clavier est ouvert sur Android
      }}
    > 
      <Tab.Screen
        name="History"
        component={AdminHistoryScreen}
        options={{
          tabBarLabel: t('history'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="history" 
              color={color} 
              size={focused ? size + 2 : size} // Légèrement plus grand quand actif
            />
          ),
        }}
      />

      <Tab.Screen
        name='Scan'
        component={AdminScanBarcodeScreen}
        options={{
          tabBarLabel: t('Scan'),
         
          tabBarBadgeStyle: { 
            backgroundColor: '#ff4444', 
            color: '#fff',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="barcode-scan" 
              color={color} 
              size={focused ? size + 2 : size}
            />
          )
        }}
      />
      
      <Tab.Screen
        name="Home"
        component={AdminHomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="home" 
              color={color} 
              size={focused ? size + 2 : size}
            />
          ),
        }}
      />
      
      <Tab.Screen
        name="Gestion"
        component={ViewClientsStack}
        options={{
          tabBarLabel: t('costumers'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="account-group" 
              color={color} 
              size={focused ? size + 2 : size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="account" 
              color={color} 
              size={focused ? size + 2 : size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}