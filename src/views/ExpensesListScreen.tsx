import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Platform, ActivityIndicator } from 'react-native';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import { Expense } from '../models/Expense';
import { formatDate } from '../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { Theme, useTheme, useThemedStyles } from '../theme';
import { MoneyText } from '../components/ui';
import { CategoryIcon } from '../components/CategoryIcon';
import ExpenseModal from '../components/ExpenseModal';
import { useTranslation } from 'react-i18next';
import { pickAndReadFile } from '../services/ai/FileParserService';
import { analyzeStatement } from '../services/ai/AIAgentService';
import { validateImportedExpenses } from '../utils/importValidation';

/**
 * Screen for displaying the list of expenses.
 * Allows viewing, editing, and deleting expenses.
 */
const ExpensesListScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { expenses, deleteExpense, updateExpense, loadExpenses, addExpenses } = useExpenseViewModel();
  const { categories } = useCategoryViewModel();
  const { aiApiKey, aiProvider } = useSettingsViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Opens the modal to edit the selected expense.
   * @param expense The expense to edit.
   */
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  /**
   * Saves changes to an expense (update).
   * @param expenseData The updated expense data.
   */
  const handleSaveExpense = async (expenseData: any) => {
    if (selectedExpense) { // Ensure we are editing
      await updateExpense({
        ...selectedExpense,
        ...expenseData,
        id: selectedExpense.id
      });
    }
    setModalVisible(false);
    setSelectedExpense(undefined);
  };

  /**
   * Prompts the user to confirm deletion of an expense.
   * @param id The ID of the expense to delete.
   */
  const confirmDeleteExpense = (id: string) => {
    if (Platform.OS === 'web') {
      if ((globalThis as { confirm?: (message: string) => boolean }).confirm?.(t('common.confirmDelete'))) deleteExpense(id);
      return;
    }
    Alert.alert(t('common.delete'), t('common.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  };

  const handleImportAI = async () => {
    if (!aiApiKey) {
      Alert.alert('Error', t('ai.errorApi'));
      return;
    }

    try {
      setIsImporting(true);
      const textContent = await pickAndReadFile();

      if (!textContent) {
        setIsImporting(false);
        return; // User canceled
      }

      const parsedExpenses = await analyzeStatement(textContent, categories, aiApiKey, aiProvider);

      const { valid, skipped } = validateImportedExpenses(parsedExpenses, categories);

      if (valid.length > 0) {
        const saved = await addExpenses(valid);
        Alert.alert(t('ai.success'), t('ai.importResult', { imported: saved, skipped }));
      } else if (skipped > 0) {
        Alert.alert('Info', t('ai.importResult', { imported: 0, skipped }));
      } else {
        Alert.alert('Info', t('ai.noExpensesFound'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', t('ai.errorGeneral'));
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Renders a single expense item in the list.
   */
  const renderItem = ({ item }: { item: Expense }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const dateStr = formatDate(item.date);
    const categoryName = category?.name || t('common.uncategorized');

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleEditExpense(item)}
        onLongPress={() => confirmDeleteExpense(item.id)}
        accessibilityRole="button"
        accessibilityLabel={t('common.editItem', { name: item.description })}
        accessibilityActions={[{ name: 'delete', label: t('common.deleteItem', { name: item.description }) }]}
        onAccessibilityAction={e => e.nativeEvent.actionName === 'delete' && confirmDeleteExpense(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: category?.color || theme.colors.estimate }]}>
            <CategoryIcon icon={category?.icon || 'help'} size={24} color={theme.colors.onCategory} />
        </View>
        <View style={styles.details}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.categoryName}>{categoryName} • {dateStr}</Text>
        </View>
        <MoneyText value={item.amount} negative size="small" color={theme.colors.danger} />
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} style={{ marginLeft: theme.spacing.sm }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text accessibilityRole="header" style={styles.title}>{t('expenses.title')}</Text>
        <TouchableOpacity
          style={[styles.importButton, isImporting && styles.importButtonDisabled]}
          onPress={handleImportAI}
          disabled={isImporting}
          accessibilityRole="button"
          accessibilityState={{ disabled: isImporting, busy: isImporting }}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color={theme.colors.onAccent} />
          ) : (
            <Ionicons name="document-text-outline" size={20} color={theme.colors.onAccent} />
          )}
          <Text style={styles.importButtonText}>{isImporting ? t('ai.importing') : t('expenses.importStatement')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.accent} />}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('expenses.noExpenses')}</Text>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {modalVisible && (
        <ExpenseModal
          visible={modalVisible}
          onClose={() => { setModalVisible(false); setSelectedExpense(undefined); }}
          onSave={handleSaveExpense}
          initialExpense={selectedExpense}
          categories={categories}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    headerRow: {
      paddingHorizontal: theme.spacing.screen,
      paddingTop: theme.spacing.screen + theme.spacing.sm,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
    },
    importButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.lg,
      minHeight: theme.minTouch,
      borderRadius: theme.radii.pill,
      alignItems: 'center',
    },
    importButtonDisabled: {
      opacity: 0.7,
    },
    importButtonText: {
      ...theme.typography.label,
      color: theme.colors.onAccent,
      marginLeft: theme.spacing.sm,
    },
    listContent: {
      padding: theme.spacing.screen,
      paddingBottom: theme.spacing.xxl * 2,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    expenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.radii.inner,
      minHeight: theme.minTouch,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    details: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    description: {
      ...theme.typography.bodyStrong,
      color: theme.colors.text,
      marginBottom: 2,
    },
    categoryName: {
      ...theme.typography.caption,
      color: theme.colors.muted,
    },
    emptyText: {
      ...theme.typography.body,
      textAlign: 'center',
      marginTop: 60,
      color: theme.colors.muted,
    },
    separator: {
      height: theme.spacing.md,
    },
  });

export default ExpensesListScreen;
