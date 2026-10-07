import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, RefreshControl } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useExpenseViewModel } from '../viewmodels/ExpenseViewModel';
import { useIncomeViewModel } from '../viewmodels/IncomeViewModel';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { useSettingsViewModel } from '../viewmodels/SettingsViewModel';
import IncomeModal from '../components/IncomeModal';
import { Ionicons } from '@expo/vector-icons';
import { safeParseDate } from '../utils/dateUtils';
import { toLocale } from '../utils/money';
import { useTranslation } from 'react-i18next';
import { Theme, useTheme, useThemedStyles, withOpacity } from '../theme';
import { Card, IconButton, MoneyText, useFormatMoney } from '../components/ui';

/**
 * Dashboard Screen.
 * Displays a summary of expenses, including total spent this month,
 * a pie chart breakdown by category, and a bar chart of monthly history.
 */
const DashboardScreen = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const formatMoney = useFormatMoney();
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width, 720) - 2 * theme.spacing.screen - 2 * theme.spacing.screen;
  const { expenses, loadExpenses } = useExpenseViewModel();
  const { incomes, addIncome } = useIncomeViewModel();
  const { categories } = useCategoryViewModel();
  const { calculationCycle, payday } = useSettingsViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);

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
        name: cat ? cat.name : t('common.uncategorized'),
        population: amount,
        color: cat ? cat.color : theme.colors.estimate,
        legendFontColor: theme.colors.muted,
        legendFontSize: 12,
        legendFontFamily: theme.fonts.body,
      };
    }).sort((a, b) => b.population - a.population);

    // Bar Data (Last 6 months)
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        labels.push(d.toLocaleString(toLocale(i18n.language), { month: 'short' }));

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
  }, [expenses, incomes, categories, calculationCycle, payday, theme, t, i18n.language]);

  const handleAddIncome = async (incomeData: any) => {
      await addIncome(incomeData.description, incomeData.amount, incomeData.date);
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => withOpacity(theme.colors.accent, opacity),
    labelColor: () => theme.colors.muted,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 2,
    fillShadowGradientFrom: theme.colors.accent,
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientTo: theme.colors.accent,
    fillShadowGradientToOpacity: 0.7,
    propsForLabels: { fontFamily: theme.fonts.body },
    propsForBackgroundLines: { stroke: theme.colors.track },
  };

  const savings = totalIncome - totalSpent;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.accent} />}
      >
        <Text accessibilityRole="header" style={styles.title}>{t('dashboard.title')}</Text>

        <Card tone="accent" style={styles.hero}>
            <Text style={styles.heroLabel}>{t('dashboard.possibleSavings')}</Text>
            <MoneyText value={savings} size="large" color={theme.colors.onAccent} />
        </Card>

        <View style={styles.metricsRow}>
            <Card tone="mint" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                   <Ionicons name="arrow-up-circle" size={22} color={theme.colors.ok} />
                   <Text style={styles.metricTitle}>{t('dashboard.totalIncomeCycle')}</Text>
                </View>
                <View style={styles.metricValueRow}>
                  <MoneyText value={totalIncome} />
                  <IconButton
                    icon="add-circle"
                    accessibilityLabel={t('dashboard.addIncome')}
                    color={theme.colors.ok}
                    onPress={() => setIncomeModalVisible(true)}
                    testID="add-income-btn"
                  />
                </View>
            </Card>

            <Card tone="peach" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                   <Ionicons name="arrow-down-circle" size={22} color={theme.colors.danger} />
                   <Text style={styles.metricTitle}>{t('dashboard.totalSpentCycle')}</Text>
                </View>
                <View style={styles.metricValueRow}>
                  <MoneyText value={totalSpent} />
                </View>
            </Card>
        </View>

        <Card>
            <Text style={styles.cardTitle}>{t('dashboard.expensesByCategory')}</Text>
            {pieData.length > 0 ? (
                <>
                  <View style={styles.pieWrap}>
                    <PieChart
                        data={pieData}
                        width={200}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"50"}
                        hasLegend={false}
                    />
                  </View>
                  {pieData.map(item => (
                    <View key={item.name} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel} numberOfLines={1}>{item.name}</Text>
                      <MoneyText value={item.population} size="small" />
                    </View>
                  ))}
                </>
            ) : (
                <Text style={styles.emptyText}>{t('dashboard.noExpensesThisMonth')}</Text>
            )}
        </Card>

        <Card>
            <Text style={styles.cardTitle}>{t('dashboard.monthlyExpenses')}</Text>
            <BarChart
                data={barData}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{ ...chartConfig, formatYLabel: (value: string) => formatMoney(Number(value)) }}
                verticalLabelRotation={30}
                fromZero
            />
        </Card>
      </ScrollView>

      <IncomeModal
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
        onSave={handleAddIncome}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollContent: {
      padding: theme.spacing.screen,
      paddingBottom: theme.spacing.xxl * 2,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    hero: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    heroLabel: {
      ...theme.typography.label,
      color: theme.colors.onAccent,
      marginBottom: theme.spacing.xs,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    metricCard: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    metricTitle: {
      ...theme.typography.label,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
      flexShrink: 1,
    },
    metricValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: theme.minTouch,
    },
    cardTitle: {
      ...theme.typography.heading,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    pieWrap: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.sm,
    },
    legendLabel: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.muted,
      textAlign: 'center',
      margin: theme.spacing.lg,
    },
  });

export default DashboardScreen;
