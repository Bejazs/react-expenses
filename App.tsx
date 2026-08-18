import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './src/views/DashboardScreen';
import ExpensesListScreen from './src/views/ExpensesListScreen';
import CategoriesScreen from './src/views/CategoriesScreen';
import SettingsScreen from './src/views/SettingsScreen';
import { StatusBar } from 'expo-status-bar';
import './src/i18n'; // Initialize i18n
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export default function App() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Expenses') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Categories') {
              iconName = focused ? 'pricetags' : 'pricetags-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: true, // We can keep header or hide it if screens implement their own title properly
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('tabs.dashboard') }} />
        <Tab.Screen name="Expenses" component={ExpensesListScreen} options={{ title: t('tabs.expenses') }} />
        <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: t('tabs.categories') }} />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t('tabs.settings') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
