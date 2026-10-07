import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme';
import { formatMoney } from '../../utils/money';

interface MoneyTextProps {
  value: number;
  size?: 'large' | 'regular' | 'small';
  /** Prefix a minus sign (money going out). */
  negative?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Monetary value in Fredoka, always with 2 decimal places, in the user's currency.
 */
export const MoneyText = ({ value, size = 'regular', negative = false, color, style }: MoneyTextProps) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const currency = useAppStore(s => s.settings.currency);
  const base =
    size === 'large' ? theme.typography.moneyLarge : size === 'small' ? { ...theme.typography.money, fontSize: 16, lineHeight: 22 } : theme.typography.money;
  const text = formatMoney(Math.abs(value), currency, i18n.language);
  const sign = negative || value < 0 ? '-' : '';
  return <Text style={[base, { color: color ?? theme.colors.text }, style]}>{sign}{text}</Text>;
};

/**
 * Hook returning a formatter bound to the current currency and language.
 */
export const useFormatMoney = () => {
  const { i18n } = useTranslation();
  const currency = useAppStore(s => s.settings.currency);
  return (value: number) => formatMoney(value, currency, i18n.language);
};
