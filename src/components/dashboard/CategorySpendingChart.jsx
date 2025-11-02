import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { FolderTree } from "lucide-react";

// Design System Colors
const COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6'];

export default function CategorySpendingChart({ transactions, categories, isLoading }) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const categorySpending = expenseTransactions.reduce((acc, transaction) => {
    const category = categories.find(c => c.id === transaction.category_id);
    const categoryName = category ? category.name : 'Uncategorized';

    acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_eur || 0);
    return acc;
  }, {});

  const data = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 categories
    .reverse(); // Reverse so largest is at bottom

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold chart-value" style={{ color: data.payload.fill }}>
            €{data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="chart-container border-0 premium-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="chart-title flex items-center gap-2">
          <FolderTree className="w-5 h-5" />
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tickFormatter={(value) => `€${value.toFixed(0)}`}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease-in-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No expense data for this month</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}