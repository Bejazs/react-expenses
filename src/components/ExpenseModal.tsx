import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { formatDateEuropean } from '../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { useTranslation } from 'react-i18next';
import { Theme, useTheme, useThemedStyles } from '../theme';
import { Button, createFormStyles } from './ui';

/**
 * Props for the ExpenseModal component.
 */
interface ExpenseModalProps {
  /**
   * Whether the modal is currently visible.
   */
  visible: boolean;
  /**
   * Callback function when the modal is requested to be closed.
   */
  onClose: () => void;
  /**
   * Callback function when the expense is saved.
   * Passes an object with expense details. ID is optional for new expenses.
   */
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
  /**
   * The expense object to edit, if editing an existing expense.
   * If null/undefined, the modal is in "Add" mode.
   */
  initialExpense?: Expense;
  /**
   * The list of available categories to select from.
   */
  categories: Category[];
}

/**
 * A modal component for adding or editing an expense.
 * It provides input fields for description, amount, date, and category selection.
 */
const ExpenseModal: React.FC<ExpenseModalProps> = ({ visible, onClose, onSave, initialExpense, categories }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (initialExpense) {
        // Pre-fill fields if editing
        setDescription(initialExpense.description);
        setAmount(initialExpense.amount.toString());
        setDate(new Date(initialExpense.date));
        setSelectedCategoryId(initialExpense.categoryId);
      } else {
        // Clear fields if adding new
        setDescription('');
        setAmount('');
        setDate(new Date());
        if (categories.length > 0) {
          const defaultCat = categories.find(c => c.name === 'Other') || categories[0];
          setSelectedCategoryId(defaultCat?.id || '');
        }
      }
    }
  }, [visible, initialExpense, categories]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  /**
   * Validates input and triggers the onSave callback.
   */
  const handleSave = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description) {
      Alert.alert('Error', t('expenseModal.errorDescription'));
      return;
    }
    if (isNaN(numericAmount)) {
      Alert.alert('Error', t('expenseModal.errorAmount'));
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', t('expenseModal.errorCategory'));
      return;
    }

    onSave({
      id: initialExpense?.id,
      description,
      amount: numericAmount,
      date: date.toISOString(),
      categoryId: selectedCategoryId,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{initialExpense ? t('expenseModal.editExpense') : t('expenseModal.addExpense')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('expenseModal.description')}
            placeholderTextColor={theme.colors.muted}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder={t('expenseModal.amount')}
            placeholderTextColor={theme.colors.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input} accessibilityRole="button">
            <Text style={styles.inputText}>{formatDateEuropean(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {showDatePicker && Platform.OS === 'ios' && (
            <Modal transparent={true} animationType="slide" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
               <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                     <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        display="spinner"
                        themeVariant={theme.scheme}
                        onChange={onChangeDate}
                     />
                     <Button label="OK" onPress={() => setShowDatePicker(false)} style={{ marginTop: theme.spacing.lg }} />
                  </View>
               </View>
            </Modal>
          )}

          <Text style={styles.label}>{t('expenseModal.category')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((category) => {
              const selected = selectedCategoryId === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryOption, selected && styles.selectedCategoryOption]}
                  onPress={() => setSelectedCategoryId(category.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={category.name}
                >
                  <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                      <CategoryIcon icon={category.icon} size={20} color={theme.colors.onCategory} />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button label={t('expenseModal.cancel')} variant="secondary" onPress={onClose} style={styles.button} />
            <Button label={t('expenseModal.save')} onPress={handleSave} style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) => ({
  ...createFormStyles(theme),
  ...StyleSheet.create({
    categorySelector: {
      marginBottom: theme.spacing.lg,
      maxHeight: 100,
    },
    categoryOption: {
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      padding: theme.spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: theme.radii.input,
      width: 76,
    },
    selectedCategoryOption: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.peach,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    categoryName: {
      ...theme.typography.caption,
      color: theme.colors.text,
      textAlign: 'center',
    },
  }),
});

export default ExpenseModal;
