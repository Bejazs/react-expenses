import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, ScrollView } from 'react-native';
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
  const { currency, aiApiKey, aiProvider, baseSalary, payday, calculationCycle, setCurrency, updateAISettings, updateSalarySettings, loadSettings } = useSettingsViewModel();
  const isFocused = useIsFocused();
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey || '');
  const [providerInput, setProviderInput] = useState(aiProvider || 'openai');
  const [salaryInput, setSalaryInput] = useState(baseSalary ? baseSalary.toString() : '');
  const [paydayInput, setPaydayInput] = useState(payday ? payday.toString() : '');
  const [cycleInput, setCycleInput] = useState<'calendar' | 'salary'>(calculationCycle || 'calendar');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  useEffect(() => {
    if (isFocused) {
      loadSettings();
    }
  }, [isFocused]);

  useEffect(() => {
    setApiKeyInput(aiApiKey || '');
    setProviderInput(aiProvider || 'openai');
    setSalaryInput(baseSalary ? baseSalary.toString() : '');
    setPaydayInput(payday ? payday.toString() : '');
    setCycleInput(calculationCycle || 'calendar');
  }, [aiApiKey, aiProvider, baseSalary, payday, calculationCycle]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('currency')} activeOpacity={0.7}>
          <Text style={styles.sectionTitle}>{t('settings.currency')}</Text>
          <Ionicons name={expandedSection === 'currency' ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        {expandedSection === 'currency' && (
          <View style={styles.sectionContent}>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  currency === 'EUR' && styles.selectedOption,
                ]}
                onPress={() => handleCurrencyChange('EUR')}
              >
                <Text style={[styles.optionText, currency === 'EUR' && styles.selectedOptionText]}>Euro (€)</Text>
                {currency === 'EUR' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  currency === 'USD' && styles.selectedOption,
                ]}
                onPress={() => handleCurrencyChange('USD')}
              >
                <Text style={[styles.optionText, currency === 'USD' && styles.selectedOptionText]}>USD ($)</Text>
                {currency === 'USD' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('language')} activeOpacity={0.7}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Ionicons name={expandedSection === 'language' ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        {expandedSection === 'language' && (
          <View style={styles.sectionContent}>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  i18n.language === 'en' && styles.selectedOption,
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.optionText, i18n.language === 'en' && styles.selectedOptionText]}>{t('settings.english')}</Text>
                {i18n.language === 'en' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  i18n.language === 'pt' && styles.selectedOption,
                ]}
                onPress={() => handleLanguageChange('pt')}
              >
                <Text style={[styles.optionText, i18n.language === 'pt' && styles.selectedOptionText]}>{t('settings.portuguese')}</Text>
                {i18n.language === 'pt' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('salary')} activeOpacity={0.7}>
          <Text style={styles.sectionTitle}>{t('settings.salarySettings')}</Text>
          <Ionicons name={expandedSection === 'salary' ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        {expandedSection === 'salary' && (
          <View style={styles.sectionContent}>
            <Text style={styles.label}>{t('settings.baseSalary')}:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 1500"
              value={salaryInput}
              onChangeText={setSalaryInput}
            />
            
            <Text style={styles.label}>{t('settings.payday')}:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 25"
              value={paydayInput}
              onChangeText={setPaydayInput}
            />

            <Text style={styles.label}>{t('settings.calculationCycle')}:</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, cycleInput === 'calendar' && styles.selectedOption]}
                onPress={() => setCycleInput('calendar')}
              >
                <Text style={[styles.optionText, cycleInput === 'calendar' && styles.selectedOptionText]}>{t('settings.calendarMonth')}</Text>
                {cycleInput === 'calendar' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, cycleInput === 'salary' && styles.selectedOption]}
                onPress={() => setCycleInput('salary')}
              >
                <Text style={[styles.optionText, cycleInput === 'salary' && styles.selectedOptionText]}>{t('settings.salaryCycle')}</Text>
                {cycleInput === 'salary' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => updateSalarySettings(parseFloat(salaryInput) || undefined, parseInt(paydayInput) || undefined, cycleInput)}>
               <Text style={styles.primaryButtonText}>{t('settings.save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('ai')} activeOpacity={0.7}>
          <Text style={styles.sectionTitle}>{t('settings.aiAgent')}</Text>
          <Ionicons name={expandedSection === 'ai' ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </TouchableOpacity>
        {expandedSection === 'ai' && (
          <View style={styles.sectionContent}>
            <Text style={styles.label}>AI Provider:</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  providerInput === 'openai' && styles.selectedOption,
                ]}
                onPress={() => setProviderInput('openai')}
              >
                <Text style={[styles.optionText, providerInput === 'openai' && styles.selectedOptionText]}>OpenAI</Text>
                {providerInput === 'openai' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  providerInput === 'anthropic' && styles.selectedOption,
                ]}
                onPress={() => setProviderInput('anthropic')}
              >
                <Text style={[styles.optionText, providerInput === 'anthropic' && styles.selectedOptionText]}>Anthropic</Text>
                {providerInput === 'anthropic' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  providerInput === 'gemini' && styles.selectedOption,
                ]}
                onPress={() => setProviderInput('gemini')}
              >
                <Text style={[styles.optionText, providerInput === 'gemini' && styles.selectedOptionText]}>Gemini</Text>
                {providerInput === 'gemini' && <Ionicons name="checkmark-circle" size={24} color="#6366f1" />}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('settings.apiKey')}:</Text>
            <TextInput
              style={styles.input}
              placeholder={t('settings.apiKeyPlaceholder')}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
            />
            <TouchableOpacity style={styles.primaryButton} onPress={() => updateAISettings(apiKeyInput, providerInput)}>
               <Text style={styles.primaryButtonText}>{t('settings.save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 30,
    marginTop: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4338ca',
    fontWeight: '700',
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
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SettingsScreen;
