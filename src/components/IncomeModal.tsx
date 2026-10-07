import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Income } from '../models/Income';
import { formatDateEuropean } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../theme';
import { Button, createFormStyles } from './ui';

interface IncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (income: Omit<Income, 'id' | 'isAutomatic'> & { id?: string }) => void;
  initialIncome?: Income;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ visible, onClose, onSave, initialIncome }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createFormStyles);
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
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description) {
      Alert.alert('Error', t('expenseModal.errorDescription'));
      return;
    }
    if (isNaN(numericAmount)) {
      Alert.alert('Error', t('expenseModal.errorAmount'));
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
            placeholderTextColor={theme.colors.muted}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder={t('incomeModal.amount')}
            placeholderTextColor={theme.colors.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input} accessibilityRole="button">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Ionicons name="calendar-outline" size={20} color={theme.colors.muted} style={{ marginRight: theme.spacing.sm }} />
               <Text style={styles.inputText}>{formatDateEuropean(date)}</Text>
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
                        themeVariant={theme.scheme}
                        onChange={onChangeDate}
                     />
                     <Button label="OK" onPress={() => setShowDatePicker(false)} style={{ marginTop: theme.spacing.lg }} />
                  </View>
               </View>
            </Modal>
          )}

          <View style={styles.buttonContainer}>
            <Button label={t('incomeModal.cancel')} variant="secondary" onPress={onClose} style={styles.button} />
            <Button label={t('incomeModal.save')} onPress={handleSave} style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default IncomeModal;
