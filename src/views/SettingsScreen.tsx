import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import { Currency } from '../models/Settings';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Appearance, Theme, useTheme, useThemedStyles } from '../theme';
import { Button, createFormStyles } from '../components/ui';

type SectionKey = 'appearance' | 'currency' | 'language' | 'salary' | 'ai';

interface SectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/** Collapsible section card. */
const Section = ({ title, expanded, onToggle, children }: SectionProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.colors.text} />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

/** Single-choice option row. */
const Option = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.selectedOption]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={24} color={theme.colors.accentText} />}
    </TouchableOpacity>
  );
};

/**
 * Settings Screen.
 * Allows the user to configure application settings, such as currency.
 */
const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { currency, aiApiKey, aiProvider, baseSalary, payday, calculationCycle, appearance, setCurrency, setAppearance, updateAISettings, updateSalarySettings } = useSettingsViewModel();
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey || '');
  const [providerInput, setProviderInput] = useState(aiProvider || 'openai');
  const [salaryInput, setSalaryInput] = useState(baseSalary ? baseSalary.toString() : '');
  const [paydayInput, setPaydayInput] = useState(payday ? payday.toString() : '');
  const [cycleInput, setCycleInput] = useState<'calendar' | 'salary'>(calculationCycle || 'calendar');
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  const toggleSection = (section: SectionKey) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

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

  const appearanceOptions: { value: Appearance; label: string }[] = [
    { value: 'system', label: t('settings.appearanceSystem') },
    { value: 'light', label: t('settings.appearanceLight') },
    { value: 'dark', label: t('settings.appearanceDark') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>{t('settings.title')}</Text>

      <Section title={t('settings.appearance')} expanded={expandedSection === 'appearance'} onToggle={() => toggleSection('appearance')}>
        {appearanceOptions.map(option => (
          <Option
            key={option.value}
            label={option.label}
            selected={appearance === option.value}
            onPress={() => setAppearance(option.value)}
          />
        ))}
      </Section>

      <Section title={t('settings.currency')} expanded={expandedSection === 'currency'} onToggle={() => toggleSection('currency')}>
        <Option label="Euro (€)" selected={currency === 'EUR'} onPress={() => handleCurrencyChange('EUR')} />
        <Option label="USD ($)" selected={currency === 'USD'} onPress={() => handleCurrencyChange('USD')} />
      </Section>

      <Section title={t('settings.language')} expanded={expandedSection === 'language'} onToggle={() => toggleSection('language')}>
        <Option label={t('settings.english')} selected={i18n.language === 'en'} onPress={() => handleLanguageChange('en')} />
        <Option label={t('settings.portuguese')} selected={i18n.language === 'pt'} onPress={() => handleLanguageChange('pt')} />
      </Section>

      <Section title={t('settings.salarySettings')} expanded={expandedSection === 'salary'} onToggle={() => toggleSection('salary')}>
        <Text style={styles.label}>{t('settings.baseSalary')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder={t('settings.salaryPlaceholder')}
          placeholderTextColor={theme.colors.muted}
          value={salaryInput}
          onChangeText={setSalaryInput}
        />

        <Text style={styles.label}>{t('settings.payday')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder={t('settings.paydayPlaceholder')}
          placeholderTextColor={theme.colors.muted}
          value={paydayInput}
          onChangeText={setPaydayInput}
        />

        <Text style={styles.label}>{t('settings.calculationCycle')}</Text>
        <Option label={t('settings.calendarMonth')} selected={cycleInput === 'calendar'} onPress={() => setCycleInput('calendar')} />
        <Option label={t('settings.salaryCycle')} selected={cycleInput === 'salary'} onPress={() => setCycleInput('salary')} />

        <Button
          label={t('settings.save')}
          style={styles.saveButton}
          onPress={() => updateSalarySettings(parseFloat(salaryInput.replace(',', '.')) || undefined, parseInt(paydayInput) || undefined, cycleInput)}
        />
      </Section>

      <Section title={t('settings.aiAgent')} expanded={expandedSection === 'ai'} onToggle={() => toggleSection('ai')}>
        <Text style={styles.label}>{t('settings.aiProvider')}</Text>
        <Option label="OpenAI" selected={providerInput === 'openai'} onPress={() => setProviderInput('openai')} />
        <Option label="Anthropic" selected={providerInput === 'anthropic'} onPress={() => setProviderInput('anthropic')} />
        <Option label="Gemini" selected={providerInput === 'gemini'} onPress={() => setProviderInput('gemini')} />

        <Text style={styles.label}>{t('settings.apiKey')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('settings.apiKeyPlaceholder')}
          placeholderTextColor={theme.colors.muted}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          secureTextEntry
        />
        <Button label={t('settings.save')} style={styles.saveButton} onPress={() => updateAISettings(apiKeyInput, providerInput)} />
      </Section>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) => ({
  ...createFormStyles(theme),
  ...StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      padding: theme.spacing.screen,
      paddingBottom: theme.spacing.xxl * 2,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
      marginTop: theme.spacing.sm,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.screen,
      minHeight: theme.minTouch,
    },
    sectionTitle: {
      ...theme.typography.heading,
      fontSize: 18,
      color: theme.colors.text,
    },
    sectionContent: {
      padding: theme.spacing.screen,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    optionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      minHeight: theme.minTouch + theme.spacing.sm,
      borderRadius: theme.radii.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    selectedOption: {
      backgroundColor: theme.colors.peach,
      borderColor: theme.colors.accent,
    },
    optionText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    selectedOptionText: {
      ...theme.typography.bodyStrong,
      color: theme.colors.text,
    },
    saveButton: {
      marginTop: theme.spacing.sm,
    },
  }),
});

export default SettingsScreen;
