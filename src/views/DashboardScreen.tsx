import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import ExpenseModal from '../components/ExpenseModal';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const { expenses, loadExpenses, addExpense } = useExpenseViewModel();
  const { categories, loadCategories } = useCategoryViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadExpenses();
      loadCategories();
    }
  }, [isFocused]);

  const { totalSpent, pieData, barData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
      try {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } catch (err) {
        return false;
      }
    });

    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Pie Data
    const categoryMap = new Map<string, number>();
    currentMonthExpenses.forEach(e => {
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
            try {
              const ed = new Date(e.date);
              return ed.getMonth() === m && ed.getFullYear() === y;
            } catch (err) {
              return false;
            }
          })
          .reduce((sum, e) => sum + e.amount, 0);
        data.push(monthlySum);
    }

    return { totalSpent: total, pieData: pData, barData: { labels, datasets: [{ data }] } };
  }, [expenses, categories]);

  const handleAddExpense = async (expenseData: any) => {
      await addExpense(expenseData.description, expenseData.amount, expenseData.date, expenseData.categoryId);
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
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadExpenses} />}
      >
        <Text style={styles.title}>Dashboard</Text>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Spent (This Month)</Text>
            <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>
        </View>

        {pieData.length > 0 ? (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Expenses by Category</Text>
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
                <Text style={styles.cardTitle}>Expenses by Category</Text>
                <Text style={{textAlign: 'center', margin: 20}}>No expenses this month</Text>
            </View>
        )}

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Expenses</Text>
            <BarChart
                data={barData}
                width={screenWidth - 60}
                height={220}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
            />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <ExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddExpense}
        categories={categories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default DashboardScreen;
