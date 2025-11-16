
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { formatCurrency } from "../utils/CurrencyFormatter";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SpendingInsights({ transactions, categories, accounts, isLoading }) {
  const insights = useMemo(() => {
    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startOfMonth(currentMonth) && date <= endOfMonth(currentMonth);
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startOfMonth(lastMonth) && date <= endOfMonth(lastMonth);
    });

    const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const lastExpenses = lastMonthTransactions.filter(t => t.type === 'expense');
    
    const currentTotal = currentExpenses.reduce((sum, t) => sum + (t.amount_eur || 0), 0);
    const lastTotal = lastExpenses.reduce((sum, t) => sum + (t.amount_eur || 0), 0);
    const change = lastTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - lastTotal) / lastTotal) * 100;

    // Category analysis
    const categorySpending = currentExpenses.reduce((acc, t) => {
      const category = categories.find(c => c.id === t.category_id);
      const categoryName = category ? category.name : 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + (t.amount_eur || 0);
      return acc;
    }, {});

    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, amount]) => ({ name, amount }))
      .reverse(); // Reverse so largest is at bottom

    // Unusual spending detection
    const averageTransactionAmount = currentExpenses.length > 0 
      ? currentTotal / currentExpenses.length 
      : 0;
    
    const largeTransactions = currentExpenses.filter(t => 
      (t.amount_eur || 0) > averageTransactionAmount * 2
    ).slice(0, 3);

    return {
      currentTotal,
      lastTotal,
      change,
      topCategories,
      largeTransactions,
      transactionCount: currentExpenses.length
    };
  }, [transactions, categories]);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Month's Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 currency-large">
              {formatCurrency(insights.currentTotal, 'EUR')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {insights.change > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span className={`text-sm font-medium ${insights.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(insights.change).toFixed(1)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transaction Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{insights.transactionCount}</p>
            <p className="text-sm text-slate-500 mt-2 currency">
              Avg: {insights.transactionCount > 0 ? formatCurrency(insights.currentTotal / insights.transactionCount, 'EUR') : '€0'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Spending Status</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.change <= 5 ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-green-700 font-medium">On Track</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <span className="text-yellow-700 font-medium">Watch Spending</span>
              </div>
            )}
            <p className="text-sm text-slate-500 mt-2">
              {insights.change <= 5 ? 'Spending is controlled' : 'Higher than usual'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 glass-effect">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={insights.topCategories}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <defs>
                    {insights.topCategories.map((entry, index) => {
                      const colors = [
                        ['#ef4444', '#dc2626'], // red
                        ['#f59e0b', '#d97706'], // orange
                        ['#eab308', '#ca8a04'], // yellow
                        ['#84cc16', '#65a30d'], // lime
                        ['#10b981', '#059669'], // green
                        ['#06b6d4', '#0891b2'], // cyan
                        ['#3b82f6', '#2563eb'], // blue
                        ['#6366f1', '#4f46e5'], // indigo
                        ['#8b5cf6', '#7c3aed'], // violet
                        ['#d946ef', '#c026d3'], // fuchsia
                      ];
                      const [color1, color2] = colors[index % colors.length];
                      return (
                        <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color1} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={color2} stopOpacity={0.7} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[0, 'auto']}
                    tickFormatter={(value) => `€${value.toFixed(0)}`}
                    padding={{ right: 20 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value, 'EUR')}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[0, 8, 8, 0]}
                    barSize={50}
                  >
                    {insights.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No spending data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 glass-effect">
          <CardHeader>
            <CardTitle className="text-lg">Large Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.largeTransactions.length > 0 ? (
              <div className="space-y-3">
                {insights.largeTransactions.map((transaction) => {
                  const category = categories.find(c => c.id === transaction.category_id);
                  const subcategory = categories.find(c => c.id === transaction.subcategory_id);
                  return (
                    <div key={transaction.id} className="flex justify-between items-start p-3 rounded-lg bg-slate-50">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{transaction.payee}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-slate-600">{category?.name || 'Uncategorized'}</p>
                          {subcategory && (
                            <>
                              <span className="text-slate-400">•</span>
                              <p className="text-sm text-slate-500">{subcategory.name}</p>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{format(new Date(transaction.date), 'MMM d')}</p>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-200 currency">
                        {formatCurrency(transaction.amount_eur, 'EUR')}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No unusually large transactions this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
