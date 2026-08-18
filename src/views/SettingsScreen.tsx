import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import { Currency } from '../models/Settings';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

/**
 * Settings Screen.
 * Allows the user to configure application settings, such as currency.
 */
const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { currency, openaiApiKey, setCurrency, updateOpenaiApiKey, loadSettings } = useSettingsViewModel();
  const isFocused = useIsFocused();
  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey || '');

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused]);

  useEffect(() => {
    setApiKeyInput(openaiApiKey || '');
  }, [openaiApiKey]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.currency')}</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              currency === 'EUR' && styles.selectedOption,
            ]}
            onPress={() => handleCurrencyChange('EUR')}
          >
            <Text style={[styles.optionText, currency === 'EUR' && styles.selectedOptionText]}>Euro (€)</Text>
            {currency === 'EUR' && <Ionicons name="checkmark-circle" size={24} color="white" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              currency === 'USD' && styles.selectedOption,
            ]}
            onPress={() => handleCurrencyChange('USD')}
          >
            <Text style={[styles.optionText, currency === 'USD' && styles.selectedOptionText]}>USD ($)</Text>
            {currency === 'USD' && <Ionicons name="checkmark-circle" size={24} color="white" />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              i18n.language === 'en' && styles.selectedOption,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.optionText, i18n.language === 'en' && styles.selectedOptionText]}>{t('settings.english')}</Text>
            {i18n.language === 'en' && <Ionicons name="checkmark-circle" size={24} color="white" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              i18n.language === 'pt' && styles.selectedOption,
            ]}
            onPress={() => handleLanguageChange('pt')}
          >
            <Text style={[styles.optionText, i18n.language === 'pt' && styles.selectedOptionText]}>{t('settings.portuguese')}</Text>
            {i18n.language === 'pt' && <Ionicons name="checkmark-circle" size={24} color="white" />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.aiAgent')}</Text>
        <Text style={styles.label}>{t('settings.openaiApiKey')}:</Text>
        <TextInput
          style={styles.input}
          placeholder={t('settings.openaiApiKeyPlaceholder')}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          secureTextEntry
        />
        <Button title={t('settings.save')} onPress={() => updateOpenaiApiKey(apiKeyInput)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'column',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});

export default SettingsScreen;
