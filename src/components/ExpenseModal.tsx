import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
  initialExpense?: Expense;
  categories: Category[];
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ visible, onClose, onSave, initialExpense, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (initialExpense) {
        setDescription(initialExpense.description);
        setAmount(initialExpense.amount.toString());
        // Handle date string properly
        try {
            setDate(new Date(initialExpense.date).toISOString().split('T')[0]);
        } catch (e) {
            setDate(new Date().toISOString().split('T')[0]);
        }
        setSelectedCategoryId(initialExpense.categoryId);
      } else {
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        if (categories.length > 0) {
          // Default to first category if available, or try to find 'other'
          const defaultCat = categories.find(c => c.name === 'Other') || categories[0];
          setSelectedCategoryId(defaultCat?.id || '');
        }
      }
    }
  }, [visible, initialExpense, categories]);

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (!description || isNaN(numericAmount) || !selectedCategoryId) {
      Alert.alert('Error', 'Please fill all fields correctly.');
      return;
    }

    // Basic date validation
    let finalDate = new Date().toISOString();
    try {
        finalDate = new Date(date).toISOString();
    } catch (e) {
        Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
        return;
    }

    onSave({
      id: initialExpense?.id,
      description,
      amount: numericAmount,
      date: finalDate,
      categoryId: selectedCategoryId,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{initialExpense ? 'Edit Expense' : 'Add Expense'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>Select Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  selectedCategoryId === category.id && styles.selectedCategoryOption,
                  { borderColor: selectedCategoryId === category.id ? category.color : 'transparent' }
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={20} color="white" />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} color="red" />
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
  },
  categorySelector: {
    marginBottom: 20,
    maxHeight: 90,
  },
  categoryOption: {
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    borderWidth: 2,
    borderRadius: 10,
    width: 70,
  },
  selectedCategoryOption: {
    backgroundColor: '#f9f9f9',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ExpenseModal;
