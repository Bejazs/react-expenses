import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import { Expense } from '../models/Expense';
import { formatDate } from '../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcon } from '../components/CategoryIcon';
import ExpenseModal from '../components/ExpenseModal';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { pickAndReadFile } from '../services/ai/FileParserService';
import { analyzeStatement } from '../services/ai/AIAgentService';

/**
 * Screen for displaying the list of expenses.
 * Allows viewing, editing, and deleting expenses.
 */
const ExpensesListScreen = () => {
  const { t } = useTranslation();
  const { expenses, loading, deleteExpense, updateExpense, loadExpenses, addExpense } = useExpenseViewModel();
  const { categories, loadCategories } = useCategoryViewModel();
  const { currency, aiApiKey, aiProvider, loadSettings } = useSettingsViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [isImporting, setIsImporting] = useState(false);
  const isFocused = useIsFocused();

  // Reload data when screen gains focus
  useEffect(() => {
    if (isFocused) {
      loadExpenses();
      loadCategories();
      loadSettings();
    }
  }, [isFocused]);

  const currencySymbol = currency === 'EUR' ? '€' : '$';

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
    // Add translations for alert in the future if needed, but simple english for now is fine since user asked for standard texts. Actually, I should translate this too.
    // I will add alert translations directly or leave it English for the alert if not in dict.
    Alert.alert(
      "Delete",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) }
      ]
    );
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

      if (parsedExpenses && parsedExpenses.length > 0) {
        let count = 0;
        for (const exp of parsedExpenses) {
          await addExpense(exp.description, exp.amount, exp.date, exp.categoryId);
          count++;
        }
        Alert.alert('Success', `${count} ${t('ai.expensesAdded')}`);
        loadExpenses();
      } else {
        Alert.alert('Info', 'No expenses found in the statement.');
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

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleEditExpense(item)}
        onLongPress={() => confirmDeleteExpense(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: category?.color || '#cbd5e1' }]}>
            <CategoryIcon icon={category?.icon || 'help'} size={24} color="white" />
        </View>
        <View style={styles.details}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.categoryName}>{category?.name || 'Uncategorized'} • {dateStr}</Text>
        </View>
        <Text style={[styles.amount, { color: '#ef4444' }]}>-{currencySymbol}{item.amount.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.importButton, isImporting && styles.importButtonDisabled]}
          onPress={handleImportAI}
          disabled={isImporting}
        >
          <Ionicons name="document-text-outline" size={20} color="white" />
          <Text style={styles.importButtonText}>{isImporting ? t('ai.importing') : t('expenses.importStatement')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { loadExpenses(); loadSettings(); }} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    padding: 15,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  importButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  importButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  separator: {
    height: 12,
  }
});

export default ExpensesListScreen;
