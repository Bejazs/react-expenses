import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Income } from '../models/Income';
import { formatDateEuropean } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface IncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (income: Omit<Income, 'id' | 'isAutomatic'> & { id?: string }) => void;
  initialIncome?: Income;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ visible, onClose, onSave, initialIncome }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialIncome) {
        setDescription(initialIncome.description);
        setAmount(initialIncome.amount.toString());
        setDate(new Date(initialIncome.date));
      } else {
        setDescription('');
        setAmount('');
        setDate(new Date());
      }
    }
  }, [visible, initialIncome]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (!description || isNaN(numericAmount)) {
      // Basic validation
      return;
    }

    onSave({
      id: initialIncome?.id,
      description,
      amount: numericAmount,
      date: date.toISOString(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{initialIncome ? t('incomeModal.editIncome') : t('incomeModal.addIncome')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('incomeModal.description')}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder={t('incomeModal.amount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Ionicons name="calendar-outline" size={20} color="gray" style={{marginRight: 10}} />
               <Text>{formatDateEuropean(date)}</Text>
            </View>
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
                        onChange={onChangeDate}
                     />
                     <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                         <Text style={styles.doneButtonText}>Done</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </Modal>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('incomeModal.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('incomeModal.save')}</Text>
            </TouchableOpacity>
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  doneButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    alignItems: 'center'
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default IncomeModal;
