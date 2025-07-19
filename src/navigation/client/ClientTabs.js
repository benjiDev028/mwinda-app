import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Correct import
import { MaterialCommunityIcons } from "react-native-vector-icons"; // Make sure to import this for the icons
import { useTranslation } from 'react-i18next'; // Assuming you're using i18n for translations

import ClientHomeScreen from "../../Screens/client/ClientHomeScreen/ClientHomeScreen";
import ClientProfileScreen from "../../Screens/client/ClientProfileScreen/ClientProfileScreen";
import ClientCodebarScreen from "../../Screens/client/ClientCodebarScreen/ClientCodebarScreen";
import ClientSupportScreen from "../../Screens/client/ClientSupportScreen/ClientSupportScreen";
import ClientPointsScreen from "../../Screens/client/ClientPointsScreen/ClientPointsScreen";
import SignIn from "../../Screens/SigninScreen/SigninScreen";


const Tab = createBottomTabNavigator();


export default function ClientStack() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Home" 
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: {
          backgroundColor: '#fec107',
        },
      }}
    >
      
      <Tab.Screen
        name="points"
        component={ClientPointsScreen}
        options={{
          tabBarLabel: t('points'),
         
          tabBarBadgeStyle: { backgroundColor: '#ff0000', color: '#fff' },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="code bar"
        component={ClientCodebarScreen}
        options={{
          tabBarLabel: t('codebar'),
          // tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: '#ff0000', color: '#fff' },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="barcode-scan" color={color} size={size} />
          ),
        }}
      />
     
        <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Help"
        component={ClientSupportScreen}
        options={{
          tabBarLabel: t('Help'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="help" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('profile'),

          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      
     
      

      
      
    </Tab.Navigator>
  );
}
