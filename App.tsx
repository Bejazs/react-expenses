import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import DashboardScreen from './src/views/DashboardScreen';
import ExpensesListScreen from './src/views/ExpensesListScreen';
import CategoriesScreen from './src/views/CategoriesScreen';
import SettingsScreen from './src/views/SettingsScreen';
import ExpenseModal from './src/components/ExpenseModal';
import './src/i18n'; // Initialize i18n
import { useTranslation } from 'react-i18next';
import { useAppStore } from './src/store/useAppStore';
import { ThemeProvider, useTheme } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Dashboard: ['home', 'home-outline'],
  Expenses: ['list', 'list-outline'],
  Categories: ['pricetags', 'pricetags-outline'],
  Settings: ['settings', 'settings-outline'],
};

/** Placeholder screen behind the central "+" button; it is never shown. */
const EmptyScreen = () => null;

/**
 * Central coral "+" button in the tab bar. Opens the add-expense modal from any tab.
 */
const AddButton = ({ onPress, label }: { onPress: () => void; label: string }) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        testID="tab-add-expense"
        style={({ pressed }) => ({
          width: 58,
          height: 58,
          borderRadius: 29,
          marginTop: -18,
          backgroundColor: theme.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: theme.scheme === 'dark' ? 0 : 0.25,
          shadowRadius: 10,
          elevation: 6,
        })}
      >
        <Ionicons name="add" size={32} color={theme.colors.onAccent} />
      </Pressable>
    </View>
  );
};

const AppNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const categories = useAppStore(s => s.categories);
  const addExpense = useAppStore(s => s.addExpense);
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => {});
  }, [theme]);

  return (
    <NavigationContainer theme={theme.navigation}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            return icons ? <Ionicons name={focused ? icons[0] : icons[1]} size={size} color={color} /> : null;
          },
          tabBarActiveTintColor: theme.colors.accentText,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarLabelStyle: { fontFamily: theme.fonts.bodySemiBold, fontSize: 12 },
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.bg },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: theme.colors.shadow,
            shadowOpacity: theme.scheme === 'dark' ? 0 : 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -4 },
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('tabs.dashboard') }} />
        <Tab.Screen name="Expenses" component={ExpensesListScreen} options={{ title: t('tabs.expenses') }} />
        <Tab.Screen
          name="Add"
          component={EmptyScreen}
          options={{
            title: t('tabs.add'),
            tabBarButton: (_props: BottomTabBarButtonProps) => (
              <AddButton label={t('tabs.add')} onPress={() => setAddVisible(true)} />
            ),
          }}
          listeners={{ tabPress: e => e.preventDefault() }}
        />
        <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: t('tabs.categories') }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
      </Tab.Navigator>

      <ExpenseModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={({ description, amount, date, categoryId }) => addExpense({ description, amount, date, categoryId })}
        categories={categories}
      />
    </NavigationContainer>
  );
};

export default function App() {
  const load = useAppStore(s => s.load);
  const loaded = useAppStore(s => s.loaded);
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });
  const ready = loaded && (fontsLoaded || Boolean(fontError));

  // Load all data once at startup; screens read it from the shared store.
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
