import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export default function HistoricalData({ transactions, accounts, categories, isLoading }) {
  const currentDate = new Date();
  const [fromDate, setFromDate] = useState(format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1), 'yyyy-MM'));
  const [toDate, setToDate] = useState(format(currentDate, 'yyyy-MM'));

  // Calculate historical data for the selected date range
  const historicalData = useMemo(() => {
    if (!fromDate || !toDate) return [];

    const from = parseISO(fromDate + '-01');
    const to = parseISO(toDate + '-01');

    if (from > to) return [];

    // Calculate current net worth (sum of all account balances, treating debt as negative)
    const currentNetWorth = accounts.reduce((sum, acc) => {
      const isDebt = acc.type === 'loan' || acc.type === 'credit_card';
      const balance = acc.balance_eur || acc.balance || acc.currentBalance || 0;
      return sum + (isDebt ? -balance : balance);
    }, 0);

    // Get all months in the range
    const months = eachMonthOfInterval({ start: from, end: to });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Filter transactions for this month
      const monthTransactions = transactions.filter(t => {
        const txDate = parseISO(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      // Calculate income, expense
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount_eur || t.amount || 0), 0);

      const expense = Math.abs(monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount_eur || t.amount || 0), 0));

      const savings = income - expense;

      // Calculate net worth at end of this month by working backwards from current net worth
      // Subtract the impact of all transactions that occurred AFTER this month
      const transactionsAfterMonth = transactions.filter(t => {
        const txDate = parseISO(t.date);
        return txDate > monthEnd;
      });

      const netImpactAfterMonth = transactionsAfterMonth.reduce((impact, t) => {
        const fromAccount = accounts.find(a => a.id === t.account_id);
        const toAccount = t.to_account_id ? accounts.find(a => a.id === t.to_account_id) : null;
        const isFromDebt = fromAccount && (fromAccount.type === 'loan' || fromAccount.type === 'credit_card');
        const isToDebt = toAccount && (toAccount.type === 'loan' || toAccount.type === 'credit_card');

        if (t.type === 'income') {
          return impact + (t.amount_eur || 0);
        } else if (t.type === 'expense') {
          return impact - (t.amount_eur || 0);
        } else if (t.type === 'transfer') {
          // Transfers between debt and non-debt accounts affect net worth
          if (isFromDebt && !isToDebt) {
            // Paying off debt increases net worth
            return impact - (t.amount_eur || 0);
          } else if (!isFromDebt && isToDebt) {
            // Borrowing decreases net worth
            return impact + (t.amount_eur || 0);
          }
          // Transfers between same account types don't affect net worth
          return impact;
        }
        return impact;
      }, 0);

      const netWorth = currentNetWorth - netImpactAfterMonth;

      return {
        month: format(month, 'MMM yyyy'),
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2)),
        savings: Number(savings.toFixed(2)),
        netWorth: Number(netWorth.toFixed(2))
      };
    });
  }, [fromDate, toDate, transactions, accounts]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (historicalData.length === 0) return { avgIncome: 0, avgExpense: 0, avgSavings: 0, totalSavings: 0 };

    const totalIncome = historicalData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = historicalData.reduce((sum, d) => sum + d.expense, 0);
    const totalSavings = historicalData.reduce((sum, d) => sum + d.savings, 0);

    return {
      avgIncome: totalIncome / historicalData.length,
      avgExpense: totalExpense / historicalData.length,
      avgSavings: totalSavings / historicalData.length,
      totalSavings
    };
  }, [historicalData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="from-date">From (MM/YYYY)</Label>
              <Input
                id="from-date"
                type="month"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To (MM/YYYY)</Label>
              <Input
                id="to-date"
                type="month"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {/* Data updates automatically */}}
              disabled={!fromDate || !toDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Avg Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 currency-large">
              €{summary.avgIncome.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">per month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Avg Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 currency-large">
              €{summary.avgExpense.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">per month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-blue-500" />
              Avg Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 currency-large">
              €{summary.avgSavings.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">per month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-500" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 currency-large">
              €{summary.totalSavings.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">in period</p>
          </CardContent>
        </Card>
      </div>

      {/* Income, Expense & Savings Trends */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Income, Expense & Savings Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {historicalData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No data available for the selected date range.</p>
              <p className="text-sm mt-2">Adjust your date range or add transactions.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expense"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Net Worth Trends */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Net Worth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {historicalData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No data available for the selected date range.</p>
              <p className="text-sm mt-2">Adjust your date range or add transactions.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Net Worth"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
