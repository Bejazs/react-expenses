import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { Expense } from '../models/Expense';
import { Ionicons } from '@expo/vector-icons';
import ExpenseModal from '../components/ExpenseModal';
import { useIsFocused } from '@react-navigation/native';

/**
 * Screen for displaying the list of expenses.
 * Allows viewing, editing, and deleting expenses.
 */
const ExpensesListScreen = () => {
  const { expenses, loading, deleteExpense, updateExpense, loadExpenses } = useExpenseViewModel();
  const { categories, loadCategories } = useCategoryViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const isFocused = useIsFocused();

  // Reload data when screen gains focus
  useEffect(() => {
    if (isFocused) {
      loadExpenses();
      loadCategories();
    }
  }, [isFocused]);

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
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) }
      ]
    );
  };

  /**
   * Renders a single expense item in the list.
   */
  const renderItem = ({ item }: { item: Expense }) => {
    const category = categories.find(c => c.id === item.categoryId);
    // Handle invalid date
    let dateStr = '';
    try {
        dateStr = new Date(item.date).toLocaleDateString();
    } catch (e) {
        dateStr = 'Invalid Date';
    }

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => handleEditExpense(item)}
        onLongPress={() => confirmDeleteExpense(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: category?.color || '#ccc' }]}>
            <Ionicons name={(category?.icon || 'help') as any} size={24} color="white" />
        </View>
        <View style={styles.details}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.categoryName}>{category?.name || 'Uncategorized'} • {dateStr}</Text>
        </View>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadExpenses} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
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
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  separator: {
    height: 10,
  }
});

export default ExpensesListScreen;
