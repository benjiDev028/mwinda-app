import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importation des écrans
import ClientHomeScreen from "../../Screens/client/ClientHomeScreen/ClientHomeScreen";
import ClientProfileScreen from "../../Screens/client/ClientProfileScreen/ClientProfileScreen";
import ClientCodebarScreen from "../../Screens/client/ClientCodebarScreen/ClientCodebarScreen";
import ClientSupportScreen from "../../Screens/client/ClientSupportScreen/ClientSupportScreen";
import ClientPointsScreen from "../../Screens/client/ClientPointsScreen/ClientPointsScreen";

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const getTabBarStyle = () => {
    const baseStyle = {
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#fec107',
      elevation: Platform.OS === 'android' ? 8 : 0,
      shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
      shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
      shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
      shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    };

    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
      };
    } else {
      return {
        ...baseStyle,
        paddingBottom: 8,
        height: 60,
      };
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#fec107',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: getTabBarStyle(),
        tabBarHideOnKeyboard: Platform.OS === 'android',
      }}
    >
      <Tab.Screen
        name="Points"
        component={ClientPointsScreen}
        options={{
          tabBarLabel: t('points'),
          tabBarBadgeStyle: { 
            backgroundColor: '#ff0000',
            color: '#fff',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="chart-line" 
              color={color} 
              size={focused ? size + 2 : size} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="Codebar"
        component={ClientCodebarScreen}
        options={{
          tabBarLabel: t('codebar'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="barcode-scan" 
              color={color} 
              size={focused ? size + 2 : size} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
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
        name="Help"
        component={ClientSupportScreen}
        options={{
          tabBarLabel: t('help'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name="help-circle-outline" 
              color={color} 
              size={focused ? size + 2 : size} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
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
