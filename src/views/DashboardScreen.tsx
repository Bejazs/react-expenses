import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useIncomeViewModel } from '../viewmodels/IncomeViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import ExpenseModal from '../components/ExpenseModal';
import IncomeModal from '../components/IncomeModal';
import { Ionicons } from '@expo/vector-icons';
import { safeParseDate } from '../utils/dateUtils';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

/**
 * Dashboard Screen.
 * Displays a summary of expenses, including total spent this month,
 * a pie chart breakdown by category, and a bar chart of monthly history.
 */
const DashboardScreen = () => {
  const { t } = useTranslation();
  const { expenses, loadExpenses, addExpense } = useExpenseViewModel();
  const { incomes, loadIncomes, addIncome } = useIncomeViewModel();
  const { categories, loadCategories } = useCategoryViewModel();
  const { currency, calculationCycle, payday, baseSalary, loadSettings } = useSettingsViewModel();
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const isFocused = useIsFocused();

  // Reload data when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadSettings().then(() => {
        loadIncomes();
        loadExpenses();
        loadCategories();
      });
    }
  }, [isFocused]);

  const currencySymbol = currency === 'EUR' ? '€' : '$';

  /**
   * Computes derived data for the dashboard:
   * - Total spent this month.
   * - Pie chart data (expenses by category for current month).
   * - Bar chart data (total expenses for last 6 months).
   */
  const { totalSpent, totalIncome, pieData, barData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Determine the start and end of the current cycle
    let cycleStart: Date;
    let cycleEnd: Date;
    
    if (calculationCycle === 'salary' && payday) {
      const pDay = Math.min(payday, 31);
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const isPastPayday = now.getDate() >= pDay;
      
      cycleStart = new Date(currentYear, isPastPayday ? currentMonth : currentMonth - 1, pDay);
      cycleEnd = new Date(currentYear, isPastPayday ? currentMonth + 1 : currentMonth, pDay - 1, 23, 59, 59);
    } else {
      // Calendar month
      cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
      cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const currentCycleExpenses = expenses.filter(e => {
      const d = safeParseDate(e.date);
      return d && d >= cycleStart && d <= cycleEnd;
    });
    
    const currentCycleIncomes = incomes.filter(i => {
      const d = safeParseDate(i.date);
      return d && d >= cycleStart && d <= cycleEnd;
    });

    const spent = currentCycleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const income = currentCycleIncomes.reduce((sum, i) => sum + i.amount, 0);

    // Pie Data
    const categoryMap = new Map<string, number>();
    currentCycleExpenses.forEach(e => {
      const catId = e.categoryId;
      categoryMap.set(catId, (categoryMap.get(catId) || 0) + e.amount);
    });

    const pData = Array.from(categoryMap.entries()).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat ? cat.name : 'Unknown',
        population: amount,
        color: cat ? cat.color : '#ccc',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    }).sort((a, b) => b.population - a.population);

    // Bar Data (Last 6 months)
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        labels.push(d.toLocaleString('default', { month: 'short' }));

        const m = d.getMonth();
        const y = d.getFullYear();

        const monthlySum = expenses
          .filter(e => {
            const ed = safeParseDate(e.date);
            return ed && ed.getMonth() === m && ed.getFullYear() === y;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        data.push(monthlySum);
    }

    return { totalSpent: spent, totalIncome: income, pieData: pData, barData: { labels, datasets: [{ data }] } };
  }, [expenses, incomes, categories, calculationCycle, payday]);

  const handleAddExpense = async (expenseData: any) => {
      await addExpense(expenseData.description, expenseData.amount, expenseData.date, expenseData.categoryId);
  };
  
  const handleAddIncome = async (incomeData: any) => {
      await addIncome(incomeData.description, incomeData.amount, incomeData.date);
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => { loadSettings().then(() => { loadIncomes(); loadExpenses(); }); }} />}
      >
        <Text style={styles.title}>{t('dashboard.title')}</Text>

        <LinearGradient
            colors={['#6366f1', '#4f46e5', '#4338ca']}
            style={[styles.card, { paddingVertical: 35, borderRadius: 24 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Text style={[styles.cardTitle, {color: 'rgba(255,255,255,0.8)', textAlign: 'center'}]}>{t('dashboard.possibleSavings')}</Text>
            <Text style={[styles.totalAmount, {color: 'white', fontSize: 44, marginVertical: 0}]}>
                {currencySymbol}{(totalIncome - totalSpent).toFixed(2)}
            </Text>
        </LinearGradient>

        <View style={styles.metricsRow}>
            <View style={[styles.card, styles.metricCard]}>
                <View style={styles.metricHeader}>
                   <Ionicons name="arrow-up-circle" size={24} color="#10b981" />
                   <Text style={[styles.cardTitle, {marginLeft: 5, fontSize: 14, color: '#6b7280'}]}>{t('dashboard.totalIncomeCycle')}</Text>
                </View>
                <Text style={[styles.totalAmount, {color: '#111827', fontSize: 22, textAlign: 'left', marginVertical: 5}]}>{currencySymbol}{totalIncome.toFixed(2)}</Text>
            </View>

            <View style={[styles.card, styles.metricCard]}>
                <View style={styles.metricHeader}>
                   <Ionicons name="arrow-down-circle" size={24} color="#ef4444" />
                   <Text style={[styles.cardTitle, {marginLeft: 5, fontSize: 14, color: '#6b7280'}]}>{t('dashboard.totalSpentCycle')}</Text>
                </View>
                <Text style={[styles.totalAmount, {color: '#111827', fontSize: 22, textAlign: 'left', marginVertical: 5}]}>{currencySymbol}{totalSpent.toFixed(2)}</Text>
            </View>
        </View>

        {pieData.length > 0 ? (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('dashboard.expensesByCategory')}</Text>
                <PieChart
                    data={pieData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[0, 0]}
                    absolute
                />
            </View>
        ) : (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('dashboard.expensesByCategory')}</Text>
                <Text style={{textAlign: 'center', margin: 20}}>{t('dashboard.noExpensesThisMonth')}</Text>
            </View>
        )}

        <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('dashboard.monthlyExpenses')}</Text>
            <BarChart
                data={barData}
                width={screenWidth - 60}
                height={220}
                yAxisLabel={currencySymbol}
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
            />
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
         {fabExpanded && (
           <>
             <View style={styles.fabActionRow}>
                <Text style={styles.fabLabel}>{t('incomeModal.addIncome')}</Text>
                <TouchableOpacity style={[styles.fabSmall, {backgroundColor: '#10b981'}]} onPress={() => { setIncomeModalVisible(true); setFabExpanded(false); }} testID="add-income-btn">
                    <Ionicons name="cash-outline" size={24} color="white" />
                </TouchableOpacity>
             </View>
             <View style={styles.fabActionRow}>
                <Text style={styles.fabLabel}>{t('expenseModal.addExpense')}</Text>
                <TouchableOpacity style={[styles.fabSmall, {backgroundColor: '#ef4444'}]} onPress={() => { setExpenseModalVisible(true); setFabExpanded(false); }} testID="add-expense-btn">
                    <Ionicons name="remove-outline" size={24} color="white" />
                </TouchableOpacity>
             </View>
           </>
         )}
         <TouchableOpacity style={[styles.fabMain, fabExpanded && {backgroundColor: '#4b5563', transform: [{rotate: '45deg'}]}]} onPress={() => setFabExpanded(!fabExpanded)} testID="main-fab">
             <Ionicons name="add" size={30} color="white" />
         </TouchableOpacity>
      </View>

      <ExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onSave={handleAddExpense}
        categories={categories}
      />
      
      <IncomeModal
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
        onSave={handleAddIncome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '47%',
    padding: 15,
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    marginVertical: 10,
  },
  fabContainer: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    alignItems: 'flex-end',
  },
  fabMain: {
    backgroundColor: '#6366f1',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fabLabel: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    elevation: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginRight: 5,
  },
});

export default DashboardScreen;
